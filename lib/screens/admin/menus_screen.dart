import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cardapio_show/services/admin_service.dart';
import 'package:cardapio_show/widgets/ui/loading_indicator.dart';
import 'package:cardapio_show/widgets/ui/confirm_dialog.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/widgets/ui/cached_image.dart';
import 'package:intl/intl.dart';

class AdminMenusScreen extends StatefulWidget {
  const AdminMenusScreen({super.key});

  @override
  State<AdminMenusScreen> createState() => _AdminMenusScreenState();
}

class _AdminMenusScreenState extends State<AdminMenusScreen> {
  final AdminService _adminService = AdminService();
  List<Menu> _menus = [];
  bool _isLoading = true;
  int _currentPage = 1;
  int _totalPages = 1;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final DateFormat _dateFormat = DateFormat('dd/MM/yyyy HH:mm');
  
  @override
  void initState() {
    super.initState();
    _loadMenus();
  }
  
  Future<void> _loadMenus() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final result = await _adminService.getAllMenus(
        page: _currentPage,
        limit: 10,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );
      
      setState(() {
        _menus = result['menus'];
        _totalPages = (result['count'] / 10).ceil();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar cardápios: $e')),
        );
      }
    }
  }
  
  Future<void> _deleteMenu(String menuId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Excluir cardápio',
        content: 'Tem certeza que deseja excluir este cardápio?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        isDestructive: true,
      ),
    );
    
    if (confirmed != true) return;
    
    try {
      await _adminService.deleteMenu(menuId);
      _loadMenus();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cardápio excluído com sucesso')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao excluir cardápio: $e')),
        );
      }
    }
  }
  
  void _search() {
    _currentPage = 1;
    _searchQuery = _searchController.text.trim();
    _loadMenus();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gerenciar Cardápios'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Barra de pesquisa
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Buscar por nome, email ou usuário',
                      prefixIcon: Icon(Icons.search),
                    ),
                    onSubmitted: (_) => _search(),
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: _search,
                  child: const Text('Buscar'),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Lista de cardápios
            Expanded(
              child: _isLoading
                ? const Center(child: LoadingIndicator())
                : _menus.isEmpty
                  ? const Center(child: Text('Nenhum cardápio encontrado'))
                  : ListView.builder(
                      itemCount: _menus.length,
                      itemBuilder: (context, index) {
                        final menu = _menus[index];
                        
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Imagem do banner
                              if (menu.bannerUrl != null && menu.bannerUrl!.isNotEmpty)
                                SizedBox(
                                  height: 120,
                                  width: double.infinity,
                                  child: CachedImage(
                                    imageUrl: menu.bannerUrl!,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              
                              Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Nome do cardápio
                                    Text(
                                      menu.name,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    
                                    const SizedBox(height: 8),
                                    
                                    // Informações do usuário
                                    Row(
                                      children: [
                                        const Icon(Icons.person, size: 16),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            '${menu.userName} (${menu.userEmail})',
                                            style: const TextStyle(fontSize: 14),
                                          ),
                                        ),
                                      ],
                                    ),
                                    
                                    const SizedBox(height: 4),
                                    
                                    // Data de criação
                                    Row(
                                      children: [
                                        const Icon(Icons.calendar_today, size: 16),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Criado em: ${_dateFormat.format(menu.createdAt)}',
                                          style: const TextStyle(fontSize: 14),
                                        ),
                                      ],
                                    ),
                                    
                                    const SizedBox(height: 16),
                                    
                                    // Botões de ação
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        // Visualizar
                                        OutlinedButton.icon(
                                          icon: const Icon(Icons.visibility),
                                          label: const Text('Visualizar'),
                                          onPressed: () {
                                            context.push('/cardapio/${menu.id}');
                                          },
                                        ),
                                        
                                        const SizedBox(width: 8),
                                        
                                        // Editar
                                        OutlinedButton.icon(
                                          icon: const Icon(Icons.edit),
                                          label: const Text('Editar'),
                                          onPressed: () {
                                            context.push('/editar-cardapio/${menu.id}');
                                          },
                                        ),
                                        
                                        const SizedBox(width: 8),
                                        
                                        // Excluir
                                        OutlinedButton.icon(
                                          icon: const Icon(Icons.delete, color: Colors.red),
                                          label: const Text('Excluir'),
                                          onPressed: () {
                                            _deleteMenu(menu.id);
                                          },
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            
            // Paginação
            if (!_isLoading && _totalPages > 1)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: _currentPage > 1
                        ? () {
                            setState(() {
                              _currentPage--;
                            });
                            _loadMenus();
                          }
                        : null,
                    ),
                    Text('$_currentPage de $_totalPages'),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: _currentPage < _totalPages
                        ? () {
                            setState(() {
                              _currentPage++;
                            });
                            _loadMenus();
                          }
                        : null,
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

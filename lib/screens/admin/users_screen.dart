import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/services/admin_service.dart';
import 'package:cardapio_show/widgets/ui/loading_indicator.dart';
import 'package:cardapio_show/widgets/ui/confirm_dialog.dart';
import 'package:cardapio_show/models/user.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final AdminService _adminService = AdminService();
  List<User> _users = [];
  bool _isLoading = true;
  int _currentPage = 1;
  int _totalPages = 1;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    _loadUsers();
  }
  
  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final result = await _adminService.getUsers(
        page: _currentPage,
        limit: 10,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );
      
      setState(() {
        _users = result['users'];
        _totalPages = (result['count'] / 10).ceil();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar usuários: $e')),
        );
      }
    }
  }
  
  Future<void> _updateUserRole(String userId, bool isAdmin) async {
    try {
      await _adminService.updateUserRole(userId, isAdmin);
      _loadUsers();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Função do usuário atualizada com sucesso')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao atualizar função do usuário: $e')),
        );
      }
    }
  }
  
  Future<void> _updateUserQuota(String userId, int quota) async {
    try {
      await _adminService.updateUserQuota(userId, quota);
      _loadUsers();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cota do usuário atualizada com sucesso')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao atualizar cota do usuário: $e')),
        );
      }
    }
  }
  
  Future<void> _deleteUser(String userId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Excluir usuário',
        content: 'Tem certeza que deseja excluir este usuário? Todos os cardápios associados também serão excluídos.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        isDestructive: true,
      ),
    );
    
    if (confirmed != true) return;
    
    try {
      await _adminService.deleteUser(userId);
      _loadUsers();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuário excluído com sucesso')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao excluir usuário: $e')),
        );
      }
    }
  }
  
  void _search() {
    _currentPage = 1;
    _searchQuery = _searchController.text.trim();
    _loadUsers();
  }
  
  @override
  Widget build(BuildContext context) {
    final currentUser = Provider.of<AuthProvider>(context).user;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gerenciar Usuários'),
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
                      labelText: 'Buscar por nome ou email',
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
            
            // Lista de usuários
            Expanded(
              child: _isLoading
                ? const Center(child: LoadingIndicator())
                : _users.isEmpty
                  ? const Center(child: Text('Nenhum usuário encontrado'))
                  : ListView.builder(
                      itemCount: _users.length,
                      itemBuilder: (context, index) {
                        final user = _users[index];
                        final isCurrentUser = user.id == currentUser?.id;
                        
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            title: Text(user.name),
                            subtitle: Text(user.email),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Botão para editar cota
                                IconButton(
                                  icon: const Icon(Icons.edit),
                                  tooltip: 'Editar cota',
                                  onPressed: () {
                                    final controller = TextEditingController(
                                      text: user.menuQuota.toString(),
                                    );
                                    
                                    showDialog(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: const Text('Editar cota de cardápios'),
                                        content: TextField(
                                          controller: controller,
                                          keyboardType: TextInputType.number,
                                          decoration: const InputDecoration(
                                            labelText: 'Cota de cardápios',
                                          ),
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.pop(context),
                                            child: const Text('Cancelar'),
                                          ),
                                          TextButton(
                                            onPressed: () {
                                              final quota = int.tryParse(controller.text) ?? 0;
                                              if (quota < 0) return;
                                              
                                              Navigator.pop(context);
                                              _updateUserQuota(user.id, quota);
                                            },
                                            child: const Text('Salvar'),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                                
                                // Botão para alternar função (admin/usuário)
                                IconButton(
                                  icon: Icon(
                                    user.isAdmin ? Icons.admin_panel_settings : Icons.person,
                                  ),
                                  tooltip: user.isAdmin ? 'Remover admin' : 'Tornar admin',
                                  onPressed: isCurrentUser ? null : () {
                                    _updateUserRole(user.id, !user.isAdmin);
                                  },
                                ),
                                
                                // Botão para excluir usuário
                                IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  tooltip: 'Excluir usuário',
                                  onPressed: isCurrentUser ? null : () {
                                    _deleteUser(user.id);
                                  },
                                ),
                              ],
                            ),
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
                            _loadUsers();
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
                            _loadUsers();
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

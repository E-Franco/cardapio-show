import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/services/menu_service.dart';
import 'package:cardapio_show/utils/constants.dart';
import 'package:cardapio_show/widgets/ui/loading_indicator.dart';
import 'package:cardapio_show/widgets/menu/menu_card.dart';
import 'package:cardapio_show/widgets/ui/confirm_dialog.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _menuService = MenuService();
  List<Menu> _menus = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMenus();
  }

  Future<void> _loadMenus() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    if (user == null) {
      setState(() {
        _isLoading = false;
        _menus = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      List<Menu> userMenus = [];

      if (user.isAdmin) {
        // Administradores podem ver todos os menus
        final result = await _menuService.getAllMenus(limit: 100);
        userMenus = result['menus'] as List<Menu>;
      } else {
        // Usuários comuns veem apenas seus próprios menus
        userMenus = await _menuService.getUserMenus(user.id);
      }

      setState(() {
        _menus = userMenus;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      
      Provider.of<ErrorProvider>(context, listen: false).captureError(
        error,
        title: 'Erro ao carregar cardápios',
        description: 'Não foi possível carregar seus cardápios. Tente novamente mais tarde.',
        severity: ErrorSeverity.error,
        action: ErrorAction(
          label: 'Tentar novamente',
          onPressed: _loadMenus,
        ),
      );

      setState(() {
        _menus = [];
        _isLoading = false;
      });
    }
  }

  bool _canCreateMenu() {
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user == null) return false;
    if (user.isAdmin) return true;

    // Verificar se o usuário atingiu a cota de cardápios
    return _menus.length < user.menuQuota;
  }

  void _handleCreateMenuClick() {
    if (!_canCreateMenu()) {
      Provider.of<ErrorProvider>(context, listen: false).captureError(
        'Limite de cardápios atingido',
        title: 'Limite atingido',
        description: 'Você atingiu o limite de cardápios permitidos para sua conta.',
        severity: ErrorSeverity.warning,
      );
      return;
    }

    // Redirecionar para a página de criação de cardápio
    context.go('/criar-cardapio');
  }

  Future<void> _handleDeleteMenu(Menu menu) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Excluir cardápio',
        message: 'Tem certeza que deseja excluir o cardápio "${menu.name}"? Esta ação é irreversível e não poderá ser desfeita.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        isDestructive: true,
      ),
    );

    if (confirmed != true) return;

    try {
      await _menuService.deleteMenu(menu.id);

      // Atualizar a lista de menus
      setState(() {
        _menus = _menus.where((m) => m.id != menu.id).toList();
      });

      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('O cardápio "${menu.name}" foi removido com sucesso.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (error) {
      if (!mounted) return;
      
      Provider.of<ErrorProvider>(context, listen: false).captureError(
        error,
        title: 'Erro ao excluir cardápio',
        description: 'Não foi possível excluir o cardápio. Tente novamente mais tarde.',
        severity: ErrorSeverity.error,
        action: ErrorAction(
          label: 'Tentar novamente',
          onPressed: () => _handleDeleteMenu(menu),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    // Calcular a porcentagem de uso da cota
    final quotaPercentage = user != null && !user.isAdmin
        ? (_menus.length / user.menuQuota) * 100
        : 100.0;

    return Scaffold(
      body: _isLoading
          ? const Center(
              child: LoadingIndicator(size: 40),
            )
          : CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  sliver: SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Seus Cardápios',
                                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                                Text(
                                  'Crie, gerencie e compartilhe seus cardápios digitais',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context).textTheme.bodySmall?.color,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: _handleCreateMenuClick,
                              icon: const Icon(Icons.add_circle_outline),
                              label: const Text('Criar Novo Cardápio'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.lg,
                                  vertical: AppSpacing.md,
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        // Contador de cardápios com destaque (apenas para usuários não admin)
                        if (user != null && !user.isAdmin) ...[
                          const SizedBox(height: AppSpacing.lg),
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(AppSpacing.md),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(AppRadius.round),
                                        ),
                                        child: const Icon(
                                          Icons.grid_view_rounded,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(width: AppSpacing.md),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Limite de Cardápios',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: AppTextSize.lg,
                                            ),
                                          ),
                                          RichText(
                                            text: TextSpan(
                                              style: TextStyle(
                                                color: Theme.of(context).textTheme.bodySmall?.color,
                                                fontSize: AppTextSize.sm,
                                              ),
                                              children: [
                                                const TextSpan(text: 'Você está utilizando '),
                                                TextSpan(
                                                  text: '${_menus.length}',
                                                  style: TextStyle(
                                                    color: quotaPercentage > 80
                                                        ? Colors.amber[700]
                                                        : Colors.green[600],
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const TextSpan(text: ' de '),
                                                TextSpan(
                                                  text: '${user.menuQuota}',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const TextSpan(text: ' cardápios disponíveis'),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: AppSpacing.md),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(AppRadius.round),
                                    child: LinearProgressIndicator(
                                      value: _menus.length / user.menuQuota,
                                      backgroundColor: Colors.grey[200],
                                      color: AppColors.primary,
                                      minHeight: 8,
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xs),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '0',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Theme.of(context).textTheme.bodySmall?.color,
                                        ),
                                      ),
                                      Text(
                                        '${quotaPercentage.toStringAsFixed(0)}%',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Theme.of(context).textTheme.bodySmall?.color,
                                        ),
                                      ),
                                      Text(
                                        '${user.menuQuota}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Theme.of(context).textTheme.bodySmall?.color,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                
                // Lista de cardápios
                SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  sliver: _menus.isEmpty
                      ? SliverToBoxAdapter(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(AppRadius.round),
                                  ),
                                  child: const Icon(
                                    Icons.menu_book,
                                    color: AppColors.primary,
                                    size: 40,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.md),
                                Text(
                                  'Nenhum cardápio encontrado',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                Text(
                                  'Você ainda não possui nenhum cardápio. Crie seu primeiro cardápio para começar.',
                                  style: TextStyle(
                                    color: Theme.of(context).textTheme.bodySmall?.color,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppSpacing.lg),
                                ElevatedButton.icon(
                                  onPressed: _handleCreateMenuClick,
                                  icon: const Icon(Icons.add_circle_outline),
                                  label: const Text('Criar Meu Primeiro Cardápio'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SliverGrid(
                          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                            maxCrossAxisExtent: 400,
                            mainAxisSpacing: AppSpacing.lg,
                            crossAxisSpacing: AppSpacing.lg,
                            mainAxisExtent: 280,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final menu = _menus[index];
                              return MenuCard(
                                menu: menu,
                                onDelete: () => _handleDeleteMenu(menu),
                                onEdit: () => context.go('/editar-cardapio/${menu.id}'),
                                onShare: () {
                                  // TODO: Implementar compartilhamento
                                },
                              );
                            },
                            childCount: _menus.length,
                          ),
                        ),
                ),
              ],
            ),
    );
  }
}

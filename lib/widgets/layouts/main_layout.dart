import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/utils/constants.dart';
import 'package:cardapio_show/widgets/ui/error_dialog.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final errorProvider = Provider.of<ErrorProvider>(context);
    final user = authProvider.user;
    final isAdmin = user?.isAdmin ?? false;
    
    // Mostrar diálogo de erro se houver um erro atual
    if (errorProvider.currentError != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          builder: (context) => ErrorDialog(
            error: errorProvider.currentError!,
            onDismiss: () => errorProvider.clearCurrentError(),
          ),
        );
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: Image.asset(
          'assets/images/logo.png',
          height: 40,
        ),
        actions: [
          if (user != null) _buildUserMenu(context, user, isAdmin),
        ],
      ),
      body: child,
    );
  }

  Widget _buildUserMenu(BuildContext context, User user, bool isAdmin) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 40),
      icon: CircleAvatar(
        backgroundColor: AppColors.primary.withOpacity(0.1),
        child: const Icon(Icons.person, color: AppColors.primary, size: 20),
      ),
      itemBuilder: (context) => [
        PopupMenuItem(
          enabled: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                user.email,
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).textTheme.bodySmall?.color,
                ),
              ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        if (!isAdmin) ...[
          PopupMenuItem(
            enabled: false,
            child: _buildQuotaIndicator(context, user),
          ),
          const PopupMenuDivider(),
        ],
        if (isAdmin) ...[
          PopupMenuItem(
            value: 'admin_users',
            child: const Row(
              children: [
                Icon(Icons.people, size: 18),
                SizedBox(width: 8),
                Text('Usuários'),
              ],
            ),
            onTap: () => context.go('/admin/usuarios'),
          ),
          PopupMenuItem(
            value: 'admin_menus',
            child: const Row(
              children: [
                Icon(Icons.menu_book, size: 18),
                SizedBox(width: 8),
                Text('Todos Cardápios'),
              ],
            ),
            onTap: () => context.go('/admin/cardapios'),
          ),
        ],
        PopupMenuItem(
          value: 'logout',
          child: const Row(
            children: [
              Icon(Icons.logout, size: 18, color: AppColors.primary),
              SizedBox(width: 8),
              Text('Sair', style: TextStyle(color: AppColors.primary)),
            ],
          ),
          onTap: () {
            Provider.of<AuthProvider>(context, listen: false).signOut();
            context.go('/login');
          },
        ),
      ],
    );
  }

  Widget _buildQuotaIndicator(BuildContext context, User user) {
    final menuCount = 0; // TODO: Implementar contagem de menus
    final percentage = (menuCount / user.menuQuota) * 100;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                child: LinearProgressIndicator(
                  value: menuCount / user.menuQuota,
                  backgroundColor: Colors.grey.shade200,
                  color: AppColors.primary,
                  minHeight: 8,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '$menuCount/$user.menuQuota',
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).textTheme.bodySmall?.color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
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
              '${percentage.toStringAsFixed(0)}%',
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
    );
  }
}

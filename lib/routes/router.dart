import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/screens/home_screen.dart';
import 'package:cardapio_show/screens/login_screen.dart';
import 'package:cardapio_show/screens/register_screen.dart';
import 'package:cardapio_show/screens/forgot_password_screen.dart';
import 'package:cardapio_show/screens/reset_password_screen.dart';
import 'package:cardapio_show/screens/create_menu_screen.dart';
import 'package:cardapio_show/screens/edit_menu_screen.dart';
import 'package:cardapio_show/screens/menu_screen.dart';
import 'package:cardapio_show/screens/preview_menu_screen.dart';
import 'package:cardapio_show/screens/admin/users_screen.dart';
import 'package:cardapio_show/screens/admin/menus_screen.dart';
import 'package:cardapio_show/widgets/layouts/main_layout.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

class AppRouter {
  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final isAuthenticated = authProvider.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' || 
                          state.matchedLocation == '/cadastro' || 
                          state.matchedLocation == '/esqueci-senha' || 
                          state.matchedLocation.startsWith('/redefinir-senha');
      final isPublicMenuRoute = state.matchedLocation.startsWith('/cardapio/');
      
      // Se estiver carregando, não redirecionar
      if (authProvider.isLoading) {
        return null;
      }
      
      // Permitir acesso a rotas públicas
      if (isPublicMenuRoute) {
        return null;
      }
      
      // Se não estiver autenticado e não estiver em uma rota de autenticação
      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }
      
      // Se estiver autenticado e estiver em uma rota de autenticação
      if (isAuthenticated && isAuthRoute) {
        return '/';
      }
      
      // Verificar acesso a rotas de admin
      if (state.matchedLocation.startsWith('/admin') && 
          isAuthenticated && 
          !authProvider.user!.isAdmin) {
        return '/';
      }
      
      return null;
    },
    routes: [
      // Rotas de autenticação
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/cadastro',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/esqueci-senha',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/redefinir-senha/:token',
        builder: (context, state) {
          final token = state.pathParameters['token'] ?? '';
          return ResetPasswordScreen(token: token);
        },
      ),
      
      // Rota pública para visualizar cardápio
      GoRoute(
        path: '/cardapio/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return MenuScreen(id: id);
        },
      ),
      
      // Rotas protegidas (com layout principal)
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainLayout(child: child);
        },
        routes: [
          // Home
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          
          // Cardápios
          GoRoute(
            path: '/criar-cardapio',
            builder: (context, state) => const CreateMenuScreen(),
          ),
          GoRoute(
            path: '/editar-cardapio/:id',
            builder: (context, state) {
              final id = state.pathParameters['id'] ?? '';
              return EditMenuScreen(id: id);
            },
          ),
          GoRoute(
            path: '/preview-cardapio/:id',
            builder: (context, state) {
              final id = state.pathParameters['id'] ?? '';
              return PreviewMenuScreen(id: id);
            },
          ),
          
          // Admin
          GoRoute(
            path: '/admin/usuarios',
            builder: (context, state) => const AdminUsersScreen(),
          ),
          GoRoute(
            path: '/admin/cardapios',
            builder: (context, state) => const AdminMenusScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text(
          'Página não encontrada: ${state.matchedLocation}',
          style: const TextStyle(fontSize: 20),
        ),
      ),
    ),
  );
}

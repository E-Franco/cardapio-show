import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cardapio_show/screens/login_screen.dart';
import 'package:cardapio_show/screens/register_screen.dart';
import 'package:cardapio_show/screens/forgot_password_screen.dart';
import 'package:cardapio_show/screens/reset_password_screen.dart';
import 'package:cardapio_show/screens/home_screen.dart';
import 'package:cardapio_show/screens/menu_edit_screen.dart';
import 'package:cardapio_show/screens/menu_view_screen.dart';
import 'package:cardapio_show/screens/admin/users_screen.dart';
import 'package:cardapio_show/screens/admin/menus_screen.dart';
import 'package:cardapio_show/widgets/layouts/main_layout.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:provider/provider.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isLoggedIn = authProvider.isLoggedIn;
    final isAdmin = authProvider.currentUser?.isAdmin ?? false;
    
    // Rotas públicas que não precisam de autenticação
    final publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    final isPublicRoute = publicRoutes.contains(state.location);
    
    // Rotas de administrador
    final adminRoutes = ['/admin/users', '/admin/menus'];
    final isAdminRoute = adminRoutes.any((route) => state.location.startsWith(route));
    
    // Redirecionar usuário não autenticado para login (exceto em rotas públicas)
    if (!isLoggedIn && !isPublicRoute) {
      return '/login';
    }
    
    // Redirecionar usuário autenticado para fora de rotas públicas
    if (isLoggedIn && isPublicRoute) {
      return '/';
    }
    
    // Redirecionar usuário regular para fora de área admin
    if (isLoggedIn && !isAdmin && isAdminRoute) {
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
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/reset-password',
      builder: (context, state) {
        final token = state.queryParameters['token'] ?? '';
        return ResetPasswordScreen(token: token);
      },
    ),
    
    // Rotas protegidas dentro do shell de navegação
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => MainLayout(child: child),
      routes: [
        // Rota principal
        GoRoute(
          path: '/',
          builder: (context, state) => const HomeScreen(),
        ),
        
        // Rotas de cardápio
        GoRoute(
          path: '/menu/create',
          builder: (context, state) => const MenuEditScreen(isCreating: true),
        ),
        GoRoute(
          path: '/menu/edit/:id',
          builder: (context, state) {
            final menuId = state.pathParameters['id'] ?? '';
            return MenuEditScreen(menuId: menuId, isCreating: false);
          },
        ),
        GoRoute(
          path: '/menu/view/:id',
          builder: (context, state) {
            final menuId = state.pathParameters['id'] ?? '';
            return MenuViewScreen(menuId: menuId);
          },
        ),
        
        // Rotas de administrador
        GoRoute(
          path: '/admin/users',
          builder: (context, state) => const UsersScreen(),
        ),
        GoRoute(
          path: '/admin/menus',
          builder: (context, state) => const MenusScreen(),
        ),
      ],
    ),
  ],
);

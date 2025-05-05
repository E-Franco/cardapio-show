import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_app/models/user.dart';
import 'package:cardapio_app/services/cache_service.dart';
import 'package:cardapio_app/utils/env.dart';

class AuthProvider extends ChangeNotifier {
  final CacheService _cacheService;
  User? _currentUser;
  bool _isLoading = true;
  
  // Getter para o cliente Supabase
  SupabaseClient get supabase => Supabase.instance.client;
  
  // Getters para o estado
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _currentUser != null;
  
  AuthProvider(this._cacheService) {
    _initializeAuth();
  }
  
  // Inicializar autenticação
  Future<void> _initializeAuth() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // Verificar se há um usuário em cache
      final cachedUser = _cacheService.getUser();
      if (cachedUser != null) {
        _currentUser = cachedUser;
        notifyListeners();
      }
      
      // Verificar sessão atual
      final session = supabase.auth.currentSession;
      if (session != null) {
        await _fetchUserData(session.user.id);
      }
    } catch (e) {
      debugPrint('Erro ao inicializar autenticação: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    
    // Configurar listener para mudanças de autenticação
    supabase.auth.onAuthStateChange.listen((data) {
      final event = data.event;
      final session = data.session;
      
      if (event == AuthChangeEvent.signedIn && session != null) {
        _fetchUserData(session.user.id);
      } else if (event == AuthChangeEvent.signedOut) {
        _currentUser = null;
        _cacheService.clearUser();
        notifyListeners();
      }
    });
  }
  
  // Buscar dados do usuário
  Future<void> _fetchUserData(String userId) async {
    try {
      final response = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      
      final user = User.fromJson(response);
      _currentUser = user;
      await _cacheService.saveUser(user);
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao buscar dados do usuário: $e');
    }
  }
  
  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        await _fetchUserData(response.user!.id);
        return {'success': true};
      } else {
        return {'success': false, 'message': 'Credenciais inválidas'};
      }
    } on AuthException catch (e) {
      return {'success': false, 'message': e.message};
    } catch (e) {
      return {'success': false, 'message': 'Erro ao fazer login'};
    }
  }
  
  // Cadastro
  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    try {
      final response = await supabase.auth.signUp(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        // Criar registro do usuário na tabela users
        await supabase.from('users').insert({
          'id': response.user!.id,
          'name': name,
          'email': email,
          'is_admin': false,
          'menu_quota': 3,
        });
        
        await _fetchUserData(response.user!.id);
        return {'success': true};
      } else {
        return {'success': false, 'message': 'Erro ao criar conta'};
      }
    } on AuthException catch (e) {
      return {'success': false, 'message': e.message};
    } catch (e) {
      return {'success': false, 'message': 'Erro ao criar conta'};
    }
  }
  
  // Logout
  Future<void> logout() async {
    await supabase.auth.signOut();
    _currentUser = null;
    await _cacheService.clearUser();
    notifyListeners();
  }
  
  // Recuperação de senha
  Future<Map<String, dynamic>> resetPassword(String email) async {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      return {'success': true};
    } on AuthException catch (e) {
      return {'success': false, 'message': e.message};
    } catch (e) {
      return {'success': false, 'message': 'Erro ao enviar email de recuperação'};
    }
  }
  
  // Atualizar senha
  Future<Map<String, dynamic>> updatePassword(String password) async {
    try {
      await supabase.auth.updateUser(
        UserAttributes(password: password),
      );
      return {'success': true};
    } on AuthException catch (e) {
      return {'success': false, 'message': e.message};
    } catch (e) {
      return {'success': false, 'message': 'Erro ao atualizar senha'};
    }
  }
}

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_show/models/user.dart';
import 'package:cardapio_show/services/cache_service.dart';
import 'package:cardapio_show/utils/env.dart';

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
      final User? cachedUser = _cacheService.getUser();
      if (cachedUser != null) {
        _currentUser = cachedUser;
        notifyListeners();
      }
      
      // Verificar sessão atual
      final Session? session = supabase.auth.currentSession;
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
    supabase.auth.onAuthStateChange.listen((AuthStateChange data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;
      
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
      final Map<String, dynamic> response = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      
      final User user = User.fromJson(response);
      _currentUser = user;
      await _cacheService.saveUser(user);
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao buscar dados do usuário: $e');
    }
  }
  
  // Login
  Future<void> signIn(String email, String password) async {
    try {
      final AuthResponse response = await supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        await _fetchUserData(response.user!.id);
      } else {
        throw Exception('Credenciais inválidas');
      }
    } on AuthException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      throw Exception('Erro ao fazer login: $e');
    }
  }
  
  // Cadastro
  Future<void> register(String name, String email, String password) async {
    try {
      final AuthResponse response = await supabase.auth.signUp(
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
      } else {
        throw Exception('Erro ao criar conta');
      }
    } on AuthException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      throw Exception('Erro ao criar conta: $e');
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
  Future<void> resetPassword(String email) async {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } on AuthException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      throw Exception('Erro ao enviar email de recuperação: $e');
    }
  }
  
  // Confirmar redefinição de senha
  Future<void> confirmPasswordReset(String token, String newPassword) async {
    try {
      await supabase.auth.updateUser(
        UserAttributes(password: newPassword),
      );
    } on AuthException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      throw Exception('Erro ao atualizar senha: $e');
    }
  }
  
  // Atualizar senha
  Future<void> updatePassword(String password) async {
    try {
      await supabase.auth.updateUser(
        UserAttributes(password: password),
      );
    } on AuthException catch (e) {
      throw Exception(e.message);
    } catch (e) {
      throw Exception('Erro ao atualizar senha: $e');
    }
  }
}

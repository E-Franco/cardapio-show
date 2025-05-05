import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class User {
  final String id;
  final String email;
  final String name;
  final bool isAdmin;
  final int menuQuota;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.isAdmin = false,
    this.menuQuota = 3,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      isAdmin: json['is_admin'] ?? false,
      menuQuota: json['menu_quota'] ?? 3,
    );
  }
}

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  final _supabase = Supabase.instance.client;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Verificar se o usuário já está autenticado
      final session = _supabase.auth.currentSession;
      if (session != null) {
        await _fetchUserData();
      }
    } catch (e) {
      debugPrint('Erro ao inicializar autenticação: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    // Ouvir mudanças de autenticação
    _supabase.auth.onAuthStateChange.listen((data) async {
      final AuthChangeEvent event = data.event;
      
      if (event == AuthChangeEvent.signedIn) {
        await _fetchUserData();
      } else if (event == AuthChangeEvent.signedOut) {
        _user = null;
        notifyListeners();
      }
    });
  }

  Future<void> _fetchUserData() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) {
        _user = null;
        return;
      }

      final response = await _supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();

      _user = User.fromJson(response);
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao buscar dados do usuário: $e');
      _user = null;
      notifyListeners();
    }
  }

  Future<void> signIn(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      await _fetchUserData();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signUp(String name, String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
      );

      if (response.user != null) {
        // Criar registro do usuário na tabela users
        await _supabase.from('users').insert({
          'id': response.user!.id,
          'email': email,
          'name': name,
          'is_admin': false,
          'menu_quota': 3,
        });

        await _fetchUserData();
      }
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
      _user = null;
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updatePassword(String password) async {
    try {
      await _supabase.auth.updateUser(
        UserAttributes(password: password),
      );
    } catch (e) {
      rethrow;
    }
  }
}

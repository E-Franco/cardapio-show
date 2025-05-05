import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_app/models/user.dart';
import 'package:cardapio_app/models/menu.dart';

class AdminService {
  final SupabaseClient _supabase;
  
  AdminService(this._supabase);
  
  // Obter todos os usuários
  Future<List<User>> getAllUsers() async {
    try {
      final response = await _supabase
          .from('users')
          .select('*')
          .order('name');
      
      return (response as List).map((data) => User.fromJson(data)).toList();
    } catch (e) {
      throw Exception('Erro ao buscar usuários: $e');
    }
  }
  
  // Obter todos os menus
  Future<List<Menu>> getAllMenus() async {
    try {
      final response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name, email)')
          .order('created_at', ascending: false);
      
      return (response as List).map((data) {
        // Converter o formato do Supabase para o nosso modelo
        final menuData = {
          ...data,
          'owner_name': data['users']['name'],
          'owner_email': data['users']['email'],
        };
        return Menu.fromJson(menuData);
      }).toList();
    } catch (e) {
      throw Exception('Erro ao buscar menus: $e');
    }
  }
  
  // Atualizar usuário
  Future<User> updateUser(User user) async {
    try {
      final userData = {
        'name': user.name,
        'email': user.email,
        'is_admin': user.isAdmin,
        'menu_quota': user.menuQuota,
      };
      
      final response = await _supabase
          .from('users')
          .update(userData)
          .eq('id', user.id)
          .select()
          .single();
      
      return User.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao atualizar usuário: $e');
    }
  }
  
  // Excluir usuário
  Future<void> deleteUser(String userId) async {
    try {
      // Primeiro excluir todos os menus do usuário
      await _supabase
          .from('menus')
          .delete()
          .eq('owner_id', userId);
      
      // Depois excluir o usuário
      await _supabase
          .from('users')
          .delete()
          .eq('id', userId);
      
      // Finalmente, excluir a autenticação do usuário
      await _supabase.auth.admin.deleteUser(userId);
    } catch (e) {
      throw Exception('Erro ao excluir usuário: $e');
    }
  }
  
  // Contar menus por usuário
  Future<Map<String, int>> countMenusByUser() async {
    try {
      final response = await _supabase
          .from('menus')
          .select('owner_id');
      
      final Map<String, int> counts = {};
      for (final item in response as List) {
        final ownerId = item['owner_id'] as String;
        counts[ownerId] = (counts[ownerId] ?? 0) + 1;
      }
      
      return counts;
    } catch (e) {
      throw Exception('Erro ao contar menus: $e');
    }
  }
}

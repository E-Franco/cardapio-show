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

  // Obter usuários com paginação e busca
  Future<Map<String, dynamic>> getUsers({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    try {
      final int offset = (page - 1) * limit;

      var query = _supabase
          .from('users')
          .select('*', count: CountOption.exact);

      if (search != null && search.isNotEmpty) {
        query = query.or('name.ilike.%$search%,email.ilike.%$search%');
      }

      final response = await query
          .order('name')
          .range(offset, offset + limit - 1);

      final List<User> users = (response.data as List).map((data) => User.fromJson(data)).toList();

      return {
        'users': users,
        'count': response.count ?? 0,
      };
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

  // Obter todos os menus com paginação e busca
  Future<Map<String, dynamic>> getAllMenus({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    try {
      final int offset = (page - 1) * limit;

      var query = _supabase
          .from('menus')
          .select('*, users:owner_id(name, email)', count: CountOption.exact);

      if (search != null && search.isNotEmpty) {
        query = query.or('name.ilike.%$search%,users.name.ilike.%$search%,users.email.ilike.%$search%');
      }

      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final List<Menu> menus = (response.data as List).map((data) {
        // Converter o formato do Supabase para o nosso modelo
        final menuData = {
          ...data,
          'owner_name': data['users']['name'],
          'owner_email': data['users']['email'],
        };
        return Menu.fromJson(menuData);
      }).toList();

      return {
        'menus': menus,
        'count': response.count ?? 0,
      };
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

  // Atualizar função de usuário (admin/não admin)
  Future<void> updateUserRole(String userId, bool isAdmin) async {
    try {
      await _supabase
          .from('users')
          .update({'is_admin': isAdmin})
          .eq('id', userId);
    } catch (e) {
      throw Exception('Erro ao atualizar função do usuário: $e');
    }
  }

  // Atualizar cota de menus do usuário
  Future<void> updateUserQuota(String userId, int quota) async {
    try {
      await _supabase
          .from('users')
          .update({'menu_quota': quota})
          .eq('id', userId);
    } catch (e) {
      throw Exception('Erro ao atualizar cota do usuário: $e');
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

  // Excluir menu
  Future<void> deleteMenu(String menuId) async {
    try {
      await _supabase
          .from('menus')
          .delete()
          .eq('id', menuId);
    } catch (e) {
      throw Exception('Erro ao excluir menu: $e');
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

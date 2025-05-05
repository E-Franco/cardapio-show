import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_show/models/user.dart';
import 'package:cardapio_show/models/menu.dart';

class AdminService {
  final _supabase = Supabase.instance.client;

  // Obter todos os usuários
  Future<Map<String, dynamic>> getUsers({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    try {
      final offset = (page - 1) * limit;
      
      var query = _supabase
          .from('users')
          .select('*', { 'count': 'exact' });

      // Adicionar filtro de busca se fornecido
      if (search != null && search.isNotEmpty) {
        query = query.or('name.ilike.%$search%,email.ilike.%$search%');
      }

      final response = await query
          .order('name', ascending: true)
          .range(offset, offset + limit - 1);

      final count = await query.count();

      final users = (response as List).map((item) => User.fromJson(item)).toList();

      return {
        'users': users,
        'count': count,
      };
    } catch (e) {
      debugPrint('Erro ao obter usuários: $e');
      rethrow;
    }
  }

  // Atualizar função do usuário (admin/não admin)
  Future<void> updateUserRole(String userId, bool isAdmin) async {
    try {
      await _supabase
          .from('users')
          .update({
            'is_admin': isAdmin,
          })
          .eq('id', userId);
    } catch (e) {
      debugPrint('Erro ao atualizar função do usuário: $e');
      rethrow;
    }
  }

  // Atualizar cota de cardápios do usuário
  Future<void> updateUserQuota(String userId, int quota) async {
    try {
      await _supabase
          .from('users')
          .update({
            'menu_quota': quota,
          })
          .eq('id', userId);
    } catch (e) {
      debugPrint('Erro ao atualizar cota do usuário: $e');
      rethrow;
    }
  }

  // Excluir um usuário
  Future<void> deleteUser(String userId) async {
    try {
      // Primeiro, excluir todos os cardápios do usuário
      await _supabase
          .from('menus')
          .delete()
          .eq('userId', userId);
      
      // Em seguida, excluir o usuário
      await _supabase
          .from('users')
          .delete()
          .eq('id', userId);
    } catch (e) {
      debugPrint('Erro ao excluir usuário: $e');
      rethrow;
    }
  }

  // Obter todos os cardápios
  Future<Map<String, dynamic>> getAllMenus({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    try {
      final offset = (page - 1) * limit;
      
      var query = _supabase
          .from('menus')
          .select('*, users!inner(email, name)', { 'count': 'exact' });

      // Adicionar filtro de busca se fornecido
      if (search != null && search.isNotEmpty) {
        query = query.or('name.ilike.%$search%,users.email.ilike.%$search%,users.name.ilike.%$search%');
      }

      final response = await query
          .order('createdAt', ascending: false)
          .range(offset, offset + limit - 1);

      final count = await query.count();

      final menus = (response as List).map((item) {
        final menuData = Map<String, dynamic>.from(item);
        final userData = menuData['users'] as Map<String, dynamic>;
        
        // Adicionar informações do usuário ao menu
        menuData['userEmail'] = userData['email'];
        menuData['userName'] = userData['name'];
        
        return Menu.fromJson(menuData);
      }).toList();

      return {
        'menus': menus,
        'count': count,
      };
    } catch (e) {
      debugPrint('Erro ao obter todos os cardápios: $e');
      rethrow;
    }
  }

  // Excluir um cardápio
  Future<void> deleteMenu(String menuId) async {
    try {
      await _supabase
          .from('menus')
          .delete()
          .eq('id', menuId);
    } catch (e) {
      debugPrint('Erro ao excluir cardápio: $e');
      rethrow;
    }
  }
}

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_app/models/menu.dart';
import 'package:cardapio_app/models/product.dart';
import 'package:cardapio_app/models/social_media.dart';
import 'package:cardapio_app/services/cache_service.dart';
import 'package:cardapio_app/utils/env.dart';

class MenuService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  
  MenuService(this._supabase, this._cacheService);
  
  // Obter todos os menus do usuário
  Future<List<Menu>> getUserMenus() async {
    try {
      // Verificar cache primeiro
      final cachedMenus = _cacheService.getMenus();
      if (cachedMenus != null) {
        return cachedMenus;
      }
      
      // Buscar do servidor
      final response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name)')
          .order('created_at', ascending: false);
      
      final List<Menu> menus = (response as List).map((data) {
        // Converter o formato do Supabase para o nosso modelo
        final menuData = {
          ...data,
          'owner_name': data['users']['name'],
        };
        return Menu.fromJson(menuData);
      }).toList();
      
      // Salvar no cache
      await _cacheService.saveMenus(menus);
      
      return menus;
    } catch (e) {
      throw Exception('Erro ao buscar menus: $e');
    }
  }
  
  // Obter um menu específico
  Future<Menu> getMenu(String menuId) async {
    try {
      // Verificar cache primeiro
      final cachedMenu = _cacheService.getMenuDetails(menuId);
      if (cachedMenu != null) {
        return cachedMenu;
      }
      
      // Buscar do servidor
      final response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name)')
          .eq('id', menuId)
          .single();
      
      // Converter o formato do Supabase para o nosso modelo
      final menuData = {
        ...response,
        'owner_name': response['users']['name'],
      };
      
      final menu = Menu.fromJson(menuData);
      
      // Salvar no cache
      await _cacheService.saveMenuDetails(menu);
      
      return menu;
    } catch (e) {
      throw Exception('Erro ao buscar menu: $e');
    }
  }
  
  // Obter produtos de um menu
  Future<List<Product>> getMenuProducts(String menuId) async {
    try {
      // Verificar cache primeiro
      final cachedProducts = _cacheService.getMenuProducts(menuId);
      if (cachedProducts != null) {
        return cachedProducts.map((data) => Product.fromJson(data)).toList();
      }
      
      // Buscar do servidor
      final response = await _supabase
          .from('products')
          .select('*, categories:category_id(name)')
          .eq('menu_id', menuId)
          .order('order', ascending: true);
      
      final List<Product> products = (response as List).map((data) {
        // Converter o formato do Supabase para o nosso modelo
        final productData = {
          ...data,
          'category_name': data['categories'] != null ? data['categories']['name'] : null,
        };
        return Product.fromJson(productData);
      }).toList();
      
      // Salvar no cache
      await _cacheService.saveMenuProducts(menuId, response);
      
      return products;
    } catch (e) {
      throw Exception('Erro ao buscar produtos: $e');
    }
  }
  
  // Obter redes sociais de um menu  {
      throw Exception('Erro ao buscar produtos: $e');
    }
  }
  
  // Obter redes sociais de um menu
  Future<SocialMedia?> getMenuSocialMedia(String menuId) async {
    try {
      // Buscar do servidor
      final response = await _supabase
          .from('social_media')
          .select('*')
          .eq('menu_id', menuId)
          .maybeSingle();
      
      if (response == null) return null;
      
      return SocialMedia.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao buscar redes sociais: $e');
    }
  }
  
  // Criar um novo menu
  Future<Menu> createMenu(Menu menu) async {
    try {
      final response = await _supabase
          .from('menus')
          .insert(menu.toJson())
          .select()
          .single();
      
      final newMenu = Menu.fromJson(response);
      
      // Atualizar cache
      final cachedMenus = _cacheService.getMenus();
      if (cachedMenus != null) {
        await _cacheService.saveMenus([newMenu, ...cachedMenus]);
      }
      
      return newMenu;
    } catch (e) {
      throw Exception('Erro ao criar menu: $e');
    }
  }
  
  // Atualizar um menu existente
  Future<Menu> updateMenu(Menu menu) async {
    try {
      final response = await _supabase
          .from('menus')
          .update(menu.toJson())
          .eq('id', menu.id)
          .select()
          .single();
      
      final updatedMenu = Menu.fromJson(response);
      
      // Atualizar cache
      await _cacheService.saveMenuDetails(updatedMenu);
      
      // Atualizar lista de menus no cache
      final cachedMenus = _cacheService.getMenus();
      if (cachedMenus != null) {
        final updatedMenus = cachedMenus.map((m) => 
          m.id == menu.id ? updatedMenu : m
        ).toList();
        await _cacheService.saveMenus(updatedMenus);
      }
      
      return updatedMenu;
    } catch (e) {
      throw Exception('Erro ao atualizar menu: $e');
    }
  }
  
  // Excluir um menu
  Future<void> deleteMenu(String menuId) async {
    try {
      await _supabase
          .from('menus')
          .delete()
          .eq('id', menuId);
      
      // Atualizar cache
      final cachedMenus = _cacheService.getMenus();
      if (cachedMenus != null) {
        final updatedMenus = cachedMenus.where((m) => m.id != menuId).toList();
        await _cacheService.saveMenus(updatedMenus);
      }
      
      // Remover detalhes do menu do cache
      await _cacheService.clearCache();
    } catch (e) {
      throw Exception('Erro ao excluir menu: $e');
    }
  }
}

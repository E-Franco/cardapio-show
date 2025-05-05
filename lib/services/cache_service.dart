import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/product.dart';

class CacheService {
  static const String _userMenusKey = 'user_menus';
  static const String _menuDetailsPrefix = 'menu_details_';
  static const String _menuProductsPrefix = 'menu_products_';
  
  // Salvar cardápios do usuário em cache
  Future<void> cacheUserMenus(List<Menu> menus) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final menusJson = menus.map((menu) => menu.toJson()).toList();
      await prefs.setString(_userMenusKey, jsonEncode(menusJson));
    } catch (e) {
      debugPrint('Erro ao salvar cardápios em cache: $e');
    }
  }
  
  // Obter cardápios do usuário do cache
  Future<List<Menu>?> getCachedUserMenus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final menusString = prefs.getString(_userMenusKey);
      
      if (menusString == null) return null;
      
      final menusJson = jsonDecode(menusString) as List;
      return menusJson.map((json) => Menu.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Erro ao obter cardápios do cache: $e');
      return null;
    }
  }
  
  // Salvar detalhes de um cardápio em cache
  Future<void> cacheMenuDetails(Menu menu) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_menuDetailsPrefix + menu.id, jsonEncode(menu.toJson()));
    } catch (e) {
      debugPrint('Erro ao salvar detalhes do cardápio em cache: $e');
    }
  }
  
  // Obter detalhes de um cardápio do cache
  Future<Menu?> getCachedMenuDetails(String menuId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final menuString = prefs.getString(_menuDetailsPrefix + menuId);
      
      if (menuString == null) return null;
      
      return Menu.fromJson(jsonDecode(menuString));
    } catch (e) {
      debugPrint('Erro ao obter detalhes do cardápio do cache: $e');
      return null;
    }
  }
  
  // Salvar produtos de um cardápio em cache
  Future<void> cacheMenuProducts(String menuId, List<Product> products) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final productsJson = products.map((product) => product.toJson()).toList();
      await prefs.setString(_menuProductsPrefix + menuId, jsonEncode(productsJson));
    } catch (e) {
      debugPrint('Erro ao salvar produtos do cardápio em cache: $e');
    }
  }
  
  // Obter produtos de um cardápio do cache
  Future<List<Product>?> getCachedMenuProducts(String menuId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final productsString = prefs.getString(_menuProductsPrefix + menuId);
      
      if (productsString == null) return null;
      
      final productsJson = jsonDecode(productsString) as List;
      return productsJson.map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Erro ao obter produtos do cardápio do cache: $e');
      return null;
    }
  }
  
  // Limpar cache de um usuário específico
  Future<void> clearUserCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userMenusKey);
      
      // Obter todas as chaves
      final keys = prefs.getKeys();
      
      // Remover todas as chaves relacionadas a menus e produtos
      for (final key in keys) {
        if (key.startsWith(_menuDetailsPrefix) || key.startsWith(_menuProductsPrefix)) {
          await prefs.remove(key);
        }
      }
    } catch (e) {
      debugPrint('Erro ao limpar cache do usuário: $e');
    }
  }
}

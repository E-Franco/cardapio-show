import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/user.dart';

class CacheService {
  static const String _userKey = 'user';
  static const String _menusKey = 'menus';
  static const String _menuDetailsPrefix = 'menu_details_';
  static const String _menuProductsPrefix = 'menu_products_';
  
  late SharedPreferences _prefs;
  
  // Inicializar o serviço
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Salvar usuário no cache
  Future<void> saveUser(User user) async {
    await _prefs.setString(_userKey, jsonEncode(user.toJson()));
  }
  
  // Obter usuário do cache
  User? getUser() {
    final String? userJson = _prefs.getString(_userKey);
    if (userJson == null) return null;
    
    try {
      return User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }
  
  // Limpar usuário do cache
  Future<void> clearUser() async {
    await _prefs.remove(_userKey);
  }
  
  // Salvar lista de menus no cache
  Future<void> saveMenus(List<Menu> menus) async {
    final List<Map<String, dynamic>> menusJson = menus.map((Menu menu) => menu.toJson()).toList();
    await _prefs.setString(_menusKey, jsonEncode(menusJson));
  }
  
  // Obter lista de menus do cache
  List<Menu>? getMenus() {
    final String? menusJson = _prefs.getString(_menusKey);
    if (menusJson == null) return null;
    
    try {
      final List<dynamic> menusList = jsonDecode(menusJson) as List<dynamic>;
      return menusList
          .map((dynamic item) => Menu.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return null;
    }
  }
  
  // Salvar detalhes de um menu no cache
  Future<void> saveMenuDetails(Menu menu) async {
    await _prefs.setString(_menuDetailsPrefix + menu.id, jsonEncode(menu.toJson()));
  }
  
  // Obter detalhes de um menu do cache
  Menu? getMenuDetails(String menuId) {
    final String? menuJson = _prefs.getString(_menuDetailsPrefix + menuId);
    if (menuJson == null) return null;
    
    try {
      return Menu.fromJson(jsonDecode(menuJson) as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }
  
  // Salvar produtos de um menu no cache
  Future<void> saveMenuProducts(String menuId, List<dynamic> products) async {
    await _prefs.setString(_menuProductsPrefix + menuId, jsonEncode(products));
  }
  
  // Obter produtos de um menu do cache
  List<dynamic>? getMenuProducts(String menuId) {
    final String? productsJson = _prefs.getString(_menuProductsPrefix + menuId);
    if (productsJson == null) return null;
    
    try {
      return jsonDecode(productsJson) as List<dynamic>;
    } catch (e) {
      return null;
    }
  }
  
  // Limpar detalhes de um menu do cache
  Future<void> clearMenuDetails(String menuId) async {
    await _prefs.remove(_menuDetailsPrefix + menuId);
    await _prefs.remove(_menuProductsPrefix + menuId);
  }
  
  // Limpar todo o cache
  Future<void> clearCache() async {
    final Set<String> keys = _prefs.getKeys();
    
    for (final String key in keys) {
      if (key.startsWith(_menuDetailsPrefix) || 
          key.startsWith(_menuProductsPrefix) ||
          key == _menusKey) {
        await _prefs.remove(key);
      }
    }
  }
}  ||
          key == _menusKey) {
        await _prefs.remove(key);
      }
    }
  }
}

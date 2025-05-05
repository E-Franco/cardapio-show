import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cardapio_app/models/menu.dart';
import 'package:cardapio_app/models/user.dart';

class CacheService {
  late SharedPreferences _prefs;
  
  // Chaves para armazenamento
  static const String _userKey = 'user_data';
  static const String _menusKey = 'user_menus';
  static const String _menuDetailsPrefix = 'menu_details_';
  static const String _menuProductsPrefix = 'menu_products_';
  
  // Inicialização
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Métodos para usuário
  Future<void> saveUser(User user) async {
    await _prefs.setString(_userKey, jsonEncode(user.toJson()));
  }
  
  User? getUser() {
    final userJson = _prefs.getString(_userKey);
    if (userJson == null) return null;
    
    try {
      return User.fromJson(jsonDecode(userJson));
    } catch (e) {
      clearUser();
      return null;
    }
  }
  
  Future<void> clearUser() async {
    await _prefs.remove(_userKey);
  }
  
  // Métodos para menus
  Future<void> saveMenus(List<Menu> menus) async {
    final menusJson = menus.map((menu) => menu.toJson()).toList();
    await _prefs.setString(_menusKey, jsonEncode(menusJson));
  }
  
  List<Menu>? getMenus() {
    final menusJson = _prefs.getString(_menusKey);
    if (menusJson == null) return null;
    
    try {
      final List<dynamic> decoded = jsonDecode(menusJson);
      return decoded.map((json) => Menu.fromJson(json)).toList();
    } catch (e) {
      return null;
    }
  }
  
  // Métodos para detalhes de menu específico
  Future<void> saveMenuDetails(Menu menu) async {
    await _prefs.setString('${_menuDetailsPrefix}${menu.id}', jsonEncode(menu.toJson()));
  }
  
  Menu? getMenuDetails(String menuId) {
    final menuJson = _prefs.getString('${_menuDetailsPrefix}$menuId');
    if (menuJson == null) return null;
    
    try {
      return Menu.fromJson(jsonDecode(menuJson));
    } catch (e) {
      return null;
    }
  }
  
  // Métodos para produtos de um menu
  Future<void> saveMenuProducts(String menuId, List<dynamic> products) async {
    await _prefs.setString('${_menuProductsPrefix}$menuId', jsonEncode(products));
  }
  
  List<dynamic>? getMenuProducts(String menuId) {
    final productsJson = _prefs.getString('${_menuProductsPrefix}$menuId');
    if (productsJson == null) return null;
    
    try {
      return jsonDecode(productsJson);
    } catch (e) {
      return null;
    }
  }
  
  // Limpar cache
  Future<void> clearCache() async {
    final keys = _prefs.getKeys();
    
    for (final key in keys) {
      if (key != _userKey) {
        await _prefs.remove(key);
      }
    }
  }
  
  // Verificar se há dados em cache
  bool hasMenusCache() {
    return _prefs.containsKey(_menusKey);
  }
  
  bool hasMenuDetailsCache(String menuId) {
    return _prefs.containsKey('${_menuDetailsPrefix}$menuId');
  }
}

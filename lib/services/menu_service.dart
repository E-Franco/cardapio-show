import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/product.dart';
import 'package:cardapio_show/models/social_media.dart';
import 'package:cardapio_show/services/cache_service.dart';
import 'package:uuid/uuid.dart';

class MenuService {
  final _supabase = Supabase.instance.client;
  final _uuid = const Uuid();
  final _cacheService = CacheService();

  // Criar um novo cardápio
  Future<Menu> createMenu(Menu menu) async {
    try {
      final menuId = _uuid.v4();
      final newMenu = menu.copyWith(
        id: menuId,
        createdAt: DateTime.now(),
      );

      final response = await _supabase
          .from('menus')
          .insert(newMenu.toJson())
          .select()
          .single();

      final createdMenu = Menu.fromJson(response);
      
      // Atualizar cache
      final cachedMenus = await _cacheService.getCachedUserMenus() ?? [];
      cachedMenus.insert(0, createdMenu);
      await _cacheService.cacheUserMenus(cachedMenus);
      
      return createdMenu;
    } catch (e) {
      debugPrint('Erro ao criar cardápio: $e');
      rethrow;
    }
  }

  // Obter um cardápio pelo ID
  Future<Menu> getMenu(String id) async {
    try {
      // Tentar obter do cache primeiro
      final cachedMenu = await _cacheService.getCachedMenuDetails(id);
      
      if (cachedMenu != null) {
        return cachedMenu;
      }
      
      // Se não estiver em cache, buscar da API
      final response = await _supabase
          .from('menus')
          .select()
          .eq('id', id)
          .single();

      final menu = Menu.fromJson(response);
      
      // Salvar em cache
      await _cacheService.cacheMenuDetails(menu);
      
      return menu;
    } catch (e) {
      debugPrint('Erro ao obter cardápio: $e');
      rethrow;
    }
  }

  // Atualizar um cardápio
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
      await _cacheService.cacheMenuDetails(updatedMenu);
      
      // Atualizar lista de cardápios em cache
      final cachedMenus = await _cacheService.getCachedUserMenus();
      if (cachedMenus != null) {
        final index = cachedMenus.indexWhere((m) => m.id == menu.id);
        if (index != -1) {
          cachedMenus[index] = updatedMenu;
          await _cacheService.cacheUserMenus(cachedMenus);
        }
      }
      
      return updatedMenu;
    } catch (e) {
      debugPrint('Erro ao atualizar cardápio: $e');
      rethrow;
    }
  }

  // Excluir um cardápio
  Future<void> deleteMenu(String id) async {
    try {
      await _supabase
          .from('menus')
          .delete()
          .eq('id', id);
      
      // Atualizar cache
      final cachedMenus = await _cacheService.getCachedUserMenus();
      if (cachedMenus != null) {
        cachedMenus.removeWhere((menu) => menu.id == id);
        await _cacheService.cacheUserMenus(cachedMenus);
      }
    } catch (e) {
      debugPrint('Erro ao excluir cardápio: $e');
      rethrow;
    }
  }

  // Obter todos os cardápios de um usuário
  Future<List<Menu>> getUserMenus(String userId) async {
    try {
      // Tentar obter do cache primeiro
      final cachedMenus = await _cacheService.getCachedUserMenus();
      
      // Buscar da API
      final response = await _supabase
          .from('menus')
          .select()
          .eq('userId', userId)
          .order('createdAt', ascending: false);

      final menus = (response as List).map((item) => Menu.fromJson(item)).toList();
      
      // Salvar em cache
      await _cacheService.cacheUserMenus(menus);
      
      return menus;
    } catch (e) {
      debugPrint('Erro ao obter cardápios do usuário: $e');
      
      // Em caso de erro, tentar usar o cache
      final cachedMenus = await _cacheService.getCachedUserMenus();
      if (cachedMenus != null) {
        return cachedMenus;
      }
      
      rethrow;
    }
  }

  // Adicionar um produto ao cardápio
  Future<Product> addProduct(Product product) async {
    try {
      final productId = _uuid.v4();
      final newProduct = product.copyWith(
        id: productId,
      );

      final response = await _supabase
          .from('products')
          .insert(newProduct.toJson())
          .select()
          .single();

      final createdProduct = Product.fromJson(response);
      
      // Atualizar cache de produtos
      final cachedProducts = await _cacheService.getCachedMenuProducts(product.menuId) ?? [];
      cachedProducts.add(createdProduct);
      await _cacheService.cacheMenuProducts(product.menuId, cachedProducts);
      
      return createdProduct;
    } catch (e) {
      debugPrint('Erro ao adicionar produto: $e');
      rethrow;
    }
  }

  // Obter todos os produtos de um cardápio
  Future<List<Product>> getMenuProducts(String menuId) async {
    try {
      // Tentar obter do cache primeiro
      final cachedProducts = await _cacheService.getCachedMenuProducts(menuId);
      
      if (cachedProducts != null) {
        return cachedProducts;
      }
      
      // Se não estiver em cache, buscar da API
      final response = await _supabase
          .from('products')
          .select()
          .eq('menuId', menuId)
          .order('orderIndex', ascending: true);

      final products = (response as List).map((item) => Product.fromJson(item)).toList();
      
      // Salvar em cache
      await _cacheService.cacheMenuProducts(menuId, products);
      
      return products;
    } catch (e) {
      debugPrint('Erro ao obter produtos do cardápio: $e');
      
      // Em caso de erro, tentar usar o cache
      final cachedProducts = await _cacheService.getCachedMenuProducts(menuId);
      if (cachedProducts != null) {
        return cachedProducts;
      }
      
      rethrow;
    }
  }

  // Resto dos métodos permanecem iguais...
}

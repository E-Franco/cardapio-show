import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/product.dart';
import 'package:cardapio_show/models/category.dart';
import 'package:cardapio_show/models/social_media.dart';
import 'package:cardapio_show/services/cache_service.dart';

class MenuService {
  final SupabaseClient _supabase = Supabase.instance.client;
  final CacheService? _cacheService;
  
  MenuService([this._cacheService]);
  
  // Obter todos os menus
  Future<Map<String, dynamic>> getAllMenus({int limit = 10, int offset = 0}) async {
    try {
      final response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name, email)')
          .order('created_at', ascending: false)
          .limit(limit)
          .range(offset, offset + limit - 1);
    
      final int count = await _getMenusCount();
    
      final List<Menu> menus = (response as List<dynamic>).map((dynamic data) {
        // Converter o formato do Supabase para o nosso modelo
        final Map<String, dynamic> menuData = {
          ...data as Map<String, dynamic>,
          'owner_name': data['users']['name'],
          'owner_email': data['users']['email'],
        };
        return Menu.fromJson(menuData);
      }).toList();
    
      return {
        'menus': menus,
        'count': count,
      };
    } catch (e) {
      throw Exception('Erro ao buscar menus: $e');
    }
  }

  // Obter contagem total de menus
  Future<int> _getMenusCount() async {
    try {
      final response = await _supabase
          .from('menus')
          .select('id', count: CountOption.exact);
    
      return response.count ?? 0;
    } catch (e) {
      throw Exception('Erro ao contar menus: $e');
    }
  }
  
  // Obter menus de um usuário específico
  Future<List<Menu>> getUserMenus(String userId) async {
    try {
      final response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name)')
          .eq('owner_id', userId)
          .order('created_at', ascending: false);
    
      return (response as List<dynamic>).map((dynamic data) {
        // Converter o formato do Supabase para o nosso modelo
        final Map<String, dynamic> menuData = {
          ...data as Map<String, dynamic>,
          'owner_name': data['users']['name'],
        };
        return Menu.fromJson(menuData);
      }).toList();
    } catch (e) {
      throw Exception('Erro ao buscar menus do usuário: $e');
    }
  }
  
  // Obter um menu específico
  Future<Menu> getMenu(String menuId) async {
    try {
      // Verificar cache primeiro
      if (_cacheService != null) {
        final Menu? cachedMenu = _cacheService!.getMenuDetails(menuId);
        if (cachedMenu != null) {
          return cachedMenu;
        }
      }
      
      // Buscar do servidor
      final Map<String, dynamic> response = await _supabase
          .from('menus')
          .select('*, users:owner_id(name), categories(*), products(*)')
          .eq('id', menuId)
          .single();
      
      // Processar categorias e produtos
      final List<Category> categories = response['categories'] != null
          ? (response['categories'] as List<dynamic>).map((dynamic item) => 
              Category.fromJson(item as Map<String, dynamic>)).toList()
          : [];
          
      final List<Product> products = response['products'] != null
          ? (response['products'] as List<dynamic>).map((dynamic item) => 
              Product.fromJson(item as Map<String, dynamic>)).toList()
          : [];
      
      // Converter o formato do Supabase para o nosso modelo
      final Map<String, dynamic> menuData = {
        ...response,
        'owner_name': response['users']['name'],
      };
      
      // Remover as listas aninhadas para evitar duplicação
      menuData.remove('categories');
      menuData.remove('products');
      
      final Menu menu = Menu.fromJson(menuData);
      
      // Criar uma cópia com as categorias e produtos
      final Menu menuWithRelations = menu.copyWith(
        categories: categories,
        products: products,
      );
      
      // Salvar no cache
      if (_cacheService != null) {
        await _cacheService!.saveMenuDetails(menuWithRelations);
      }
      
      return menuWithRelations;
    } catch (e) {
      throw Exception('Erro ao buscar menu: $e');
    }
  }
  
  // Criar um novo menu
  Future<Menu> createMenu(Menu menu) async {
    try {
      final Map<String, dynamic> response = await _supabase
          .from('menus')
          .insert(menu.toJson())
          .select()
          .single();
      
      final Menu newMenu = Menu.fromJson(response);
      
      // Atualizar cache
      if (_cacheService != null) {
        final List<Menu>? cachedMenus = _cacheService!.getMenus();
        if (cachedMenus != null) {
          await _cacheService!.saveMenus([newMenu, ...cachedMenus]);
        }
      }
      
      return newMenu;
    } catch (e) {
      throw Exception('Erro ao criar menu: $e');
    }
  }
  
  // Atualizar um menu existente
  Future<Menu> updateMenu(Menu menu) async {
    try {
      final Map<String, dynamic> response = await _supabase
          .from('menus')
          .update(menu.toJson())
          .eq('id', menu.id)
          .select()
          .single();
      
      final Menu updatedMenu = Menu.fromJson(response);
      
      // Atualizar cache
      if (_cacheService != null) {
        await _cacheService!.saveMenuDetails(updatedMenu);
        
        // Atualizar lista de menus no cache
        final List<Menu>? cachedMenus = _cacheService!.getMenus();
        if (cachedMenus != null) {
          final List<Menu> updatedMenus = cachedMenus.map((Menu m) => 
            m.id == menu.id ? updatedMenu : m
          ).toList();
          await _cacheService!.saveMenus(updatedMenus);
        }
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
      if (_cacheService != null) {
        final List<Menu>? cachedMenus = _cacheService!.getMenus();
        if (cachedMenus != null) {
          final List<Menu> updatedMenus = cachedMenus.where((Menu m) => m.id != menuId).toList();
          await _cacheService!.saveMenus(updatedMenus);
        }
        
        // Remover detalhes do menu do cache
        await _cacheService!.clearMenuDetails(menuId);
      }
    } catch (e) {
      throw Exception('Erro ao excluir menu: $e');
    }
  }
  
  // Adicionar categoria a um menu
  Future<Category> addCategory(String menuId, Category category) async {
    try {
      final Map<String, dynamic> categoryData = {
        ...category.toJson(),
        'menu_id': menuId,
      };
      
      final Map<String, dynamic> response = await _supabase
          .from('categories')
          .insert(categoryData)
          .select()
          .single();
      
      return Category.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao adicionar categoria: $e');
    }
  }
  
  // Atualizar categoria
  Future<Category> updateCategory(Category category) async {
    try {
      final Map<String, dynamic> response = await _supabase
          .from('categories')
          .update(category.toJson())
          .eq('id', category.id)
          .select()
          .single();
      
      return Category.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao atualizar categoria: $e');
    }
  }
  
  // Excluir categoria
  Future<void> deleteCategory(String categoryId) async {
    try {
      await _supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);
    } catch (e) {
      throw Exception('Erro ao excluir categoria: $e');
    }
  }
  
  // Adicionar produto
  Future<Product> addProduct(Product product) async {
    try {
      final Map<String, dynamic> response = await _supabase
          .from('products')
          .insert(product.toJson())
          .select()
          .single();
      
      return Product.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao adicionar produto: $e');
    }
  }
  
  // Atualizar produto
  Future<Product> updateProduct(Product product) async {
    try {
      final Map<String, dynamic> response = await _supabase
          .from('products')
          .update(product.toJson())
          .eq('id', product.id)
          .select()
          .single();
      
      return Product.fromJson(response);
    } catch (e) {
      throw Exception('Erro ao atualizar produto: $e');
    }
  }
  
  // Excluir produto
  Future<void> deleteProduct(String productId) async {
    try {
      await _supabase
          .from('products')
          .delete()
          .eq('id', productId);
    } catch (e) {
      throw Exception('Erro ao excluir produto: $e');
    }
  }
  
  // Obter redes sociais de um menu
  Future<SocialMedia?> getMenuSocialMedia(String menuId) async {
    try {
      final Map<String, dynamic>? response = await _supabase
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
  
  // Atualizar redes sociais
  Future<SocialMedia> updateSocialMedia(SocialMedia socialMedia) async {
    try {
      // Verificar se já existe
      final SocialMedia? existing = await getMenuSocialMedia(socialMedia.menuId);
      
      if (existing != null) {
        // Atualizar
        final Map<String, dynamic> response = await _supabase
            .from('social_media')
            .update(socialMedia.toJson())
            .eq('id', existing.id)
            .select()
            .single();
        
        return SocialMedia.fromJson(response);
      } else {
        // Criar novo
        final Map<String, dynamic> response = await _supabase
            .from('social_media')
            .insert(socialMedia.toJson())
            .select()
            .single();
        
        return SocialMedia.fromJson(response);
      }
    } catch (e) {
      throw Exception('Erro ao atualizar redes sociais: $e');
    }
  }
}

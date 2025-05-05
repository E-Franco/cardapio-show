import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_show/services/cache_service.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/product.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('CacheService', () {
    late CacheService cacheService;

    setUp(() {
      cacheService = CacheService();
      SharedPreferences.setMockInitialValues({});
    });

    test('should cache and retrieve user menus', () async {
      // Arrange
      final menus = [
        Menu(
          id: 'menu1',
          name: 'Menu 1',
          userId: 'user1',
          createdAt: DateTime.now(),
        ),
        Menu(
          id: 'menu2',
          name: 'Menu 2',
          userId: 'user1',
          createdAt: DateTime.now(),
        ),
      ];

      // Act
      await cacheService.cacheUserMenus(menus);
      final cachedMenus = await cacheService.getCachedUserMenus();

      // Assert
      expect(cachedMenus, isNotNull);
      expect(cachedMenus!.length, 2);
      expect(cachedMenus[0].id, 'menu1');
      expect(cachedMenus[1].id, 'menu2');
    });

    test('should cache and retrieve menu details', () async {
      // Arrange
      final menu = Menu(
        id: 'menu1',
        name: 'Menu 1',
        userId: 'user1',
        createdAt: DateTime.now(),
      );

      // Act
      await cacheService.cacheMenuDetails(menu);
      final cachedMenu = await cacheService.getCachedMenuDetails('menu1');

      // Assert
      expect(cachedMenu, isNotNull);
      expect(cachedMenu!.id, 'menu1');
      expect(cachedMenu.name, 'Menu 1');
    });

    test('should cache and retrieve menu products', () async {
      // Arrange
      final products = [
        Product(
          id: 'prod1',
          name: 'Product 1',
          price: 10.99,
          menuId: 'menu1',
          categoryId: 'cat1',
          orderIndex: 0,
          type: ProductType.product,
        ),
        Product(
          id: 'prod2',
          name: 'Product 2',
          price: 15.99,
          menuId: 'menu1',
          categoryId: 'cat1',
          orderIndex: 1,
          type: ProductType.product,
        ),
      ];

      // Act
      await cacheService.cacheMenuProducts('menu1', products);
      final cachedProducts = await cacheService.getCachedMenuProducts('menu1');

      // Assert
      expect(cachedProducts, isNotNull);
      expect(cachedProducts!.length, 2);
      expect(cachedProducts[0].id, 'prod1');
      expect(cachedProducts[1].id, 'prod2');
    });

    test('should clear user cache', () async {
      // Arrange
      final menu = Menu(
        id: 'menu1',
        name: 'Menu 1',
        userId: 'user1',
        createdAt: DateTime.now(),
      );
      
      final products = [
        Product(
          id: 'prod1',
          name: 'Product 1',
          price: 10.99,
          menuId: 'menu1',
          categoryId: 'cat1',
          orderIndex: 0,
          type: ProductType.product,
        ),
      ];

      await cacheService.cacheMenuDetails(menu);
      await cacheService.cacheMenuProducts('menu1', products);
      await cacheService.cacheUserMenus([menu]);

      // Act
      await cacheService.clearUserCache();
      
      final cachedMenus = await cacheService.getCachedUserMenus();
      final cachedMenu = await cacheService.getCachedMenuDetails('menu1');
      final cachedProducts = await cacheService.getCachedMenuProducts('menu1');

      // Assert
      expect(cachedMenus, isNull);
      expect(cachedMenu, isNull);
      expect(cachedProducts, isNull);
    });
  });
}

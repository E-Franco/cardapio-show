import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_app/services/cache_service.dart';
import 'package:cardapio_app/models/user.dart';
import 'package:cardapio_app/models/menu.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('CacheService', () {
    late CacheService cacheService;
    
    setUp(() async {
      // Configurar SharedPreferences para testes
      SharedPreferences.setMockInitialValues({});
      cacheService = CacheService();
      await cacheService.init();
    });
    
    test('should save and retrieve user', () async {
      // Arrange
      final user = User(
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        menuQuota: 5,
      );
      
      // Act
      await cacheService.saveUser(user);
      final retrievedUser = cacheService.getUser();
      
      // Assert
      expect(retrievedUser, isNotNull);
      expect(retrievedUser!.id, user.id);
      expect(retrievedUser.name, user.name);
      expect(retrievedUser.email, user.email);
      expect(retrievedUser.isAdmin, user.isAdmin);
      expect(retrievedUser.menuQuota, user.menuQuota);
    });
    
    test('should clear user data', () async {
      // Arrange
      final user = User(
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        menuQuota: 5,
      );
      await cacheService.saveUser(user);
      
      // Act
      await cacheService.clearUser();
      final retrievedUser = cacheService.getUser();
      
      // Assert
      expect(retrievedUser, isNull);
    });
    
    test('should save and retrieve menus', () async {
      // Arrange
      final now = DateTime.now();
      final menus = [
        Menu(
          id: '1',
          name: 'Menu 1',
          ownerId: 'user1',
          createdAt: now,
          updatedAt: now,
        ),
        Menu(
          id: '2',
          name: 'Menu 2',
          ownerId: 'user1',
          createdAt: now,
          updatedAt: now,
        ),
      ];
      
      // Act
      await cacheService.saveMenus(menus);
      final retrievedMenus = cacheService.getMenus();
      
      // Assert
      expect(retrievedMenus, isNotNull);
      expect(retrievedMenus!.length, 2);
      expect(retrievedMenus[0].id, '1');
      expect(retrievedMenus[0].name, 'Menu 1');
      expect(retrievedMenus[1].id, '2');
      expect(retrievedMenus[1].name, 'Menu 2');
    });
    
    test('should save and retrieve menu details', () async {
      // Arrange
      final now = DateTime.now();
      final menu = Menu(
        id: '123',
        name: 'Test Menu',
        ownerId: 'user123',
        createdAt: now,
        updatedAt: now,
      );
      
      // Act
      await cacheService.saveMenuDetails(menu);
      final retrievedMenu = cacheService.getMenuDetails('123');
      
      // Assert
      expect(retrievedMenu, isNotNull);
      expect(retrievedMenu!.id, menu.id);
      expect(retrievedMenu.name, menu.name);
      expect(retrievedMenu.ownerId, menu.ownerId);
    });
    
    test('should clear cache except user data', () async {
      // Arrange
      final now = DateTime.now();
      final user = User(
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        menuQuota: 5,
      );
      final menu = Menu(
        id: '123',
        name: 'Test Menu',
        ownerId: 'user123',
        createdAt: now,
        updatedAt: now,
      );
      
      await cacheService.saveUser(user);
      await cacheService.saveMenuDetails(menu);
      
      // Act
      await cacheService.clearCache();
      
      // Assert
      final retrievedUser = cacheService.getUser();
      final retrievedMenu = cacheService.getMenuDetails('123');
      
      expect(retrievedUser, isNotNull); // User should still exist
      expect(retrievedMenu, isNull); // Menu should be cleared
    });
  });
}

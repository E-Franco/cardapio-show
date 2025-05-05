import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/models/category.dart';
import 'package:cardapio_show/models/product.dart';

void main() {
  group('Menu Model', () {
    test('should create a Menu instance from JSON', () {
      // Arrange
      final Map<String, dynamic> json = {
        'id': 'menu123',
        'name': 'Test Menu',
        'userId': 'user123',
        'bannerImageUrl': 'https://example.com/banner.jpg',
        'bannerColor': 0xFF123456,
        'bodyColor': 0xFFFFFFFF,
        'textColor': 0xFF000000,
        'displayNameOption': 'banner',
        'fontFamily': 'Roboto',
        'createdAt': '2023-01-01T12:00:00.000Z',
        'categories': [
          {
            'id': 'cat1',
            'name': 'Category 1',
          }
        ],
        'products': [
          {
            'id': 'prod1',
            'name': 'Product 1',
            'price': 10.99,
            'description': 'Description 1',
            'imageUrl': 'https://example.com/product1.jpg',
            'menuId': 'menu123',
            'categoryId': 'cat1',
            'orderIndex': 0,
            'type': 'product',
          }
        ],
        'userEmail': 'user@example.com',
        'userName': 'User Name',
      };

      // Act
      final menu = Menu.fromJson(json);

      // Assert
      expect(menu.id, 'menu123');
      expect(menu.name, 'Test Menu');
      expect(menu.userId, 'user123');
      expect(menu.bannerImageUrl, 'https://example.com/banner.jpg');
      expect(menu.bannerColor, 0xFF123456);
      expect(menu.bodyColor, 0xFFFFFFFF);
      expect(menu.textColor, 0xFF000000);
      expect(menu.displayNameOption, 'banner');
      expect(menu.fontFamily, 'Roboto');
      expect(menu.createdAt, DateTime.parse('2023-01-01T12:00:00.000Z'));
      expect(menu.categories!.length, 1);
      expect(menu.categories![0].id, 'cat1');
      expect(menu.products!.length, 1);
      expect(menu.products![0].id, 'prod1');
      expect(menu.userEmail, 'user@example.com');
      expect(menu.userName, 'User Name');
    });

    test('should convert Menu instance to JSON', () {
      // Arrange
      final menu = Menu(
        id: 'menu123',
        name: 'Test Menu',
        userId: 'user123',
        bannerImageUrl: 'https://example.com/banner.jpg',
        bannerColor: 0xFF123456,
        bodyColor: 0xFFFFFFFF,
        textColor: 0xFF000000,
        displayNameOption: 'banner',
        fontFamily: 'Roboto',
        createdAt: DateTime.parse('2023-01-01T12:00:00.000Z'),
        categories: [
          Category(
            id: 'cat1',
            name: 'Category 1',
          )
        ],
        products: [
          Product(
            id: 'prod1',
            name: 'Product 1',
            price: 10.99,
            description: 'Description 1',
            imageUrl: 'https://example.com/product1.jpg',
            menuId: 'menu123',
            categoryId: 'cat1',
            orderIndex: 0,
            type: ProductType.product,
          )
        ],
        userEmail: 'user@example.com',
        userName: 'User Name',
      );

      // Act
      final json = menu.toJson();

      // Assert
      expect(json['id'], 'menu123');
      expect(json['name'], 'Test Menu');
      expect(json['userId'], 'user123');
      expect(json['bannerImageUrl'], 'https://example.com/banner.jpg');
      expect(json['bannerColor'], 0xFF123456);
      expect(json['bodyColor'], 0xFFFFFFFF);
      expect(json['textColor'], 0xFF000000);
      expect(json['displayNameOption'], 'banner');
      expect(json['fontFamily'], 'Roboto');
      expect(json['createdAt'], menu.createdAt.toIso8601String());
      expect(json['categories'].length, 1);
      expect(json['products'].length, 1);
    });

    test('should create a copy with updated values', () {
      // Arrange
      final menu = Menu(
        id: 'menu123',
        name: 'Test Menu',
        userId: 'user123',
        createdAt: DateTime.now(),
      );

      // Act
      final updatedMenu = menu.copyWith(
        name: 'Updated Menu',
        bannerColor: 0xFF654321,
        fontFamily: 'Lato',
      );

      // Assert
      expect(updatedMenu.id, 'menu123');
      expect(updatedMenu.name, 'Updated Menu');
      expect(updatedMenu.userId, 'user123');
      expect(updatedMenu.bannerColor, 0xFF654321);
      expect(updatedMenu.fontFamily, 'Lato');
    });
  });
}

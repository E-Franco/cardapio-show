import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_app/models/menu.dart';
import 'package:cardapio_app/models/product.dart';
import 'package:cardapio_app/models/social_media.dart';

void main() {
  group('Menu Model', () {
    final now = DateTime.now();
    final nowString = now.toIso8601String();
    
    test('should create a Menu from JSON', () {
      // Arrange
      final json = {
        'id': '123',
        'name': 'Test Menu',
        'owner_id': 'user123',
        'owner_name': 'Test User',
        'banner_image': 'https://example.com/image.jpg',
        'banner_color': '#FF0000',
        'banner_link': 'https://example.com',
        'show_link_button': true,
        'background_color': '#FFFFFF',
        'text_color': '#000000',
        'title_position': 'center',
        'font_family': 'Roboto',
        'body_background_color': '#F5F5F5',
        'created_at': nowString,
        'updated_at': nowString,
      };
      
      // Act
      final menu = Menu.fromJson(json);
      
      // Assert
      expect(menu.id, '123');
      expect(menu.name, 'Test Menu');
      expect(menu.ownerId, 'user123');
      expect(menu.ownerName, 'Test User');
      expect(menu.bannerImage, 'https://example.com/image.jpg');
      expect(menu.bannerColor, '#FF0000');
      expect(menu.bannerLink, 'https://example.com');
      expect(menu.showLinkButton, true);
      expect(menu.backgroundColor, '#FFFFFF');
      expect(menu.textColor, '#000000');
      expect(menu.titlePosition, 'center');
      expect(menu.fontFamily, 'Roboto');
      expect(menu.bodyBackgroundColor, '#F5F5F5');
      expect(menu.createdAt.toIso8601String(), nowString);
      expect(menu.updatedAt.toIso8601String(), nowString);
    });
    
    test('should convert Menu to JSON', () {
      // Arrange
      final menu = Menu(
        id: '123',
        name: 'Test Menu',
        ownerId: 'user123',
        bannerImage: 'https://example.com/image.jpg',
        bannerColor: '#FF0000',
        bannerLink: 'https://example.com',
        showLinkButton: true,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        titlePosition: 'center',
        fontFamily: 'Roboto',
        bodyBackgroundColor: '#F5F5F5',
        createdAt: now,
        updatedAt: now,
      );
      
      // Act
      final json = menu.toJson();
      
      // Assert
      expect(json['id'], '123');
      expect(json['name'], 'Test Menu');
      expect(json['owner_id'], 'user123');
      expect(json['banner_image'], 'https://example.com/image.jpg');
      expect(json['banner_color'], '#FF0000');
      expect(json['banner_link'], 'https://example.com');
      expect(json['show_link_button'], true);
      expect(json['background_color'], '#FFFFFF');
      expect(json['text_color'], '#000000');
      expect(json['title_position'], 'center');
      expect(json['font_family'], 'Roboto');
      expect(json['body_background_color'], '#F5F5F5');
      expect(json['created_at'], nowString);
      expect(json['updated_at'], nowString);
    });
    
    test('should create a copy with updated fields', () {
      // Arrange
      final menu = Menu(
        id: '123',
        name: 'Test Menu',
        ownerId: 'user123',
        createdAt: now,
        updatedAt: now,
      );
      
      // Act
      final updatedMenu = menu.copyWith(
        name: 'New Menu Name',
        bannerColor: '#00FF00',
      );
      
      // Assert
      expect(updatedMenu.id, '123'); // Unchanged
      expect(updatedMenu.name, 'New Menu Name'); // Changed
      expect(updatedMenu.ownerId, 'user123'); // Unchanged
      expect(updatedMenu.bannerColor, '#00FF00'); // Changed
    });
  });
}

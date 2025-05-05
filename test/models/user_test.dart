import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_app/models/user.dart';

void main() {
  group('User Model', () {
    test('should create a User from JSON', () {
      // Arrange
      final json = {
        'id': '123',
        'name': 'Test User',
        'email': 'test@example.com',
        'is_admin': true,
        'menu_quota': 10,
      };
      
      // Act
      final user = User.fromJson(json);
      
      // Assert
      expect(user.id, '123');
      expect(user.name, 'Test User');
      expect(user.email, 'test@example.com');
      expect(user.isAdmin, true);
      expect(user.menuQuota, 10);
    });
    
    test('should convert User to JSON', () {
      // Arrange
      final user = User(
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: true,
        menuQuota: 10,
      );
      
      // Act
      final json = user.toJson();
      
      // Assert
      expect(json['id'], '123');
      expect(json['name'], 'Test User');
      expect(json['email'], 'test@example.com');
      expect(json['is_admin'], true);
      expect(json['menu_quota'], 10);
    });
    
    test('should create a copy with updated fields', () {
      // Arrange
      final user = User(
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        menuQuota: 5,
      );
      
      // Act
      final updatedUser = user.copyWith(
        name: 'New Name',
        isAdmin: true,
        menuQuota: 10,
      );
      
      // Assert
      expect(updatedUser.id, '123'); // Unchanged
      expect(updatedUser.name, 'New Name'); // Changed
      expect(updatedUser.email, 'test@example.com'); // Unchanged
      expect(updatedUser.isAdmin, true); // Changed
      expect(updatedUser.menuQuota, 10); // Changed
    });
  });
}

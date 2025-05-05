import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_show/models/user.dart';

void main() {
  group('User Model', () {
    test('should create a User instance from JSON', () {
      // Arrange
      final Map<String, dynamic> json = {
        'id': '123',
        'email': 'test@example.com',
        'name': 'Test User',
        'is_admin': true,
        'menu_quota': 5,
      };

      // Act
      final user = User.fromJson(json);

      // Assert
      expect(user.id, '123');
      expect(user.email, 'test@example.com');
      expect(user.name, 'Test User');
      expect(user.isAdmin, true);
      expect(user.menuQuota, 5);
    });

    test('should convert User instance to JSON', () {
      // Arrange
      final user = User(
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: true,
        menuQuota: 5,
      );

      // Act
      final json = user.toJson();

      // Assert
      expect(json['id'], '123');
      expect(json['email'], 'test@example.com');
      expect(json['name'], 'Test User');
      expect(json['is_admin'], true);
      expect(json['menu_quota'], 5);
    });

    test('should create a copy with updated values', () {
      // Arrange
      final user = User(
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        menuQuota: 3,
      );

      // Act
      final updatedUser = user.copyWith(
        name: 'Updated User',
        isAdmin: true,
        menuQuota: 10,
      );

      // Assert
      expect(updatedUser.id, '123');
      expect(updatedUser.email, 'test@example.com');
      expect(updatedUser.name, 'Updated User');
      expect(updatedUser.isAdmin, true);
      expect(updatedUser.menuQuota, 10);
    });
  });
}

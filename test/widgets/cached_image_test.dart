import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_app/widgets/ui/cached_image.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:network_image_mock/network_image_mock.dart';

void main() {
  group('CachedImage Widget', () {
    testWidgets('should display image when loaded successfully', (WidgetTester tester) async {
      await mockNetworkImagesFor(() async {
        // Arrange
        const imageUrl = 'https://example.com/image.jpg';
        
        // Act
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: CachedImage(
                imageUrl: imageUrl,
                width: 100,
                height: 100,
              ),
            ),
          ),
        );
        
        // Wait for image to load
        await tester.pumpAndSettle();
        
        // Assert
        expect(find.byType(CachedNetworkImage), findsOneWidget);
      });
    });
    
    testWidgets('should display placeholder while loading', (WidgetTester tester) async {
      // Arrange
      const imageUrl = 'https://example.com/image.jpg';
      
      // Act
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CachedImage(
              imageUrl: imageUrl,
              width: 100,
              height: 100,
            ),
          ),
        ),
      );
      
      // Assert - before image loads, should show CircularProgressIndicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
    
    testWidgets('should display custom placeholder if provided', (WidgetTester tester) async {
      // Arrange
      const imageUrl = 'https://example.com/image.jpg';
      
      // Act
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CachedImage(
              imageUrl: imageUrl,
              width: 100,
              height: 100,
              placeholder: Text('Loading...'),
            ),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Loading...'), findsOneWidget);
    });
    
    testWidgets('should apply border radius if provided', (WidgetTester tester) async {
      await mockNetworkImagesFor(() async {
        // Arrange
        const imageUrl = 'https://example.com/image.jpg';
        
        // Act
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: CachedImage(
                imageUrl: imageUrl,
                width: 100,
                height: 100,
                borderRadius: BorderRadius.all(Radius.circular(8)),
              ),
            ),
          ),
        );
        
        // Assert
        expect(find.byType(ClipRRect), findsOneWidget);
      });
    });
  });
}

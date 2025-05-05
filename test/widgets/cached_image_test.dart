import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cardapio_show/widgets/ui/cached_image.dart';
import 'package:cached_network_image/cached_network_image.dart';

void main() {
  testWidgets('CachedImage should render placeholder for loading state', (WidgetTester tester) async {
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
    
    // Assert
    expect(find.byType(CachedNetworkImage), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('CachedImage should handle blob URLs', (WidgetTester tester) async {
    // Arrange
    const imageUrl = 'blob:https://example.com/image-blob';
    
    // Act
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: CachedImage(
            imageUrl: imageUrl,
            width: 100,
            height: 100,
            usePlaceholderIfBlob: false,
          ),
        ),
      ),
    );
    
    // Assert
    expect(find.byType(Image), findsOneWidget);
  });

  testWidgets('CachedImage should apply border radius when provided', (WidgetTester tester) async {
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
}

import 'package:cardapio_show/models/category.dart';
import 'package:cardapio_show/models/product.dart';

class Menu {
  final String id;
  final String name;
  final String userId;
  final String? bannerImageUrl;
  final int? bannerColor;
  final int? bodyColor;
  final int? textColor;
  final String? displayNameOption;
  final String? fontFamily;
  final DateTime createdAt;
  final List<Category>? categories;
  final List<Product>? products;
  final String? userEmail;
  final String? userName;

  Menu({
    required this.id,
    required this.name,
    required this.userId,
    this.bannerImageUrl,
    this.bannerColor,
    this.bodyColor,
    this.textColor,
    this.displayNameOption,
    this.fontFamily,
    required this.createdAt,
    this.categories,
    this.products,
    this.userEmail,
    this.userName,
  });

  factory Menu.fromJson(Map<String, dynamic> json) {
    return Menu(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      userId: json['userId'] ?? '',
      bannerImageUrl: json['bannerImageUrl'],
      bannerColor: json['bannerColor'],
      bodyColor: json['bodyColor'],
      textColor: json['textColor'],
      displayNameOption: json['displayNameOption'],
      fontFamily: json['fontFamily'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      categories: json['categories'] != null
          ? (json['categories'] as List)
              .map((item) => Category.fromJson(item))
              .toList()
          : null,
      products: json['products'] != null
          ? (json['products'] as List)
              .map((item) => Product.fromJson(item))
              .toList()
          : null,
      userEmail: json['userEmail'],
      userName: json['userName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'userId': userId,
      'bannerImageUrl': bannerImageUrl,
      'bannerColor': bannerColor,
      'bodyColor': bodyColor,
      'textColor': textColor,
      'displayNameOption': displayNameOption,
      'fontFamily': fontFamily,
      'createdAt': createdAt.toIso8601String(),
      'categories': categories?.map((category) => category.toJson()).toList(),
      'products': products?.map((product) => product.toJson()).toList(),
      'userEmail': userEmail,
      'userName': userName,
    };
  }

  Menu copyWith({
    String? id,
    String? name,
    String? userId,
    String? bannerImageUrl,
    int? bannerColor,
    int? bodyColor,
    int? textColor,
    String? displayNameOption,
    String? fontFamily,
    DateTime? createdAt,
    List<Category>? categories,
    List<Product>? products,
    String? userEmail,
    String? userName,
  }) {
    return Menu(
      id: id ?? this.id,
      name: name ?? this.name,
      userId: userId ?? this.userId,
      bannerImageUrl: bannerImageUrl ?? this.bannerImageUrl,
      bannerColor: bannerColor ?? this.bannerColor,
      bodyColor: bodyColor ?? this.bodyColor,
      textColor: textColor ?? this.textColor,
      displayNameOption: displayNameOption ?? this.displayNameOption,
      fontFamily: fontFamily ?? this.fontFamily,
      createdAt: createdAt ?? this.createdAt,
      categories: categories ?? this.categories,
      products: products ?? this.products,
      userEmail: userEmail ?? this.userEmail,
      userName: userName ?? this.userName,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Menu &&
        other.id == id &&
        other.name == name &&
        other.userId == userId;
  }

  @override
  int get hashCode => id.hashCode ^ name.hashCode ^ userId.hashCode;
}

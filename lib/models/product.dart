enum ProductType { product, image }

class Product {
  final String id;
  final String name;
  final double price;
  final String? description;
  final String? imageUrl;
  final String menuId;
  final String categoryId;
  final int orderIndex;
  final ProductType type;

  Product({
    required this.id,
    required this.name,
    this.price = 0.0,
    this.description,
    this.imageUrl,
    required this.menuId,
    required this.categoryId,
    required this.orderIndex,
    this.type = ProductType.product,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      price: json['price']?.toDouble() ?? 0.0,
      description: json['description'],
      imageUrl: json['imageUrl'],
      menuId: json['menuId'] ?? '',
      categoryId: json['categoryId'] ?? '',
      orderIndex: json['orderIndex'] ?? 0,
      type: _parseProductType(json['type']),
    );
  }

  static ProductType _parseProductType(String? type) {
    if (type == 'image') return ProductType.image;
    return ProductType.product;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'description': description,
      'imageUrl': imageUrl,
      'menuId': menuId,
      'categoryId': categoryId,
      'orderIndex': orderIndex,
      'type': type == ProductType.image ? 'image' : 'product',
    };
  }

  Product copyWith({
    String? id,
    String? name,
    double? price,
    String? description,
    String? imageUrl,
    String? menuId,
    String? categoryId,
    int? orderIndex,
    ProductType? type,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      menuId: menuId ?? this.menuId,
      categoryId: categoryId ?? this.categoryId,
      orderIndex: orderIndex ?? this.orderIndex,
      type: type ?? this.type,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Product &&
        other.id == id &&
        other.name == name &&
        other.price == price &&
        other.description == description &&
        other.imageUrl == imageUrl &&
        other.menuId == menuId &&
        other.categoryId == categoryId &&
        other.orderIndex == orderIndex &&
        other.type == type;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      name.hashCode ^
      price.hashCode ^
      description.hashCode ^
      imageUrl.hashCode ^
      menuId.hashCode ^
      categoryId.hashCode ^
      orderIndex.hashCode ^
      type.hashCode;
}

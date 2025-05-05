class Product {
  final String id;
  final String menuId;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final bool isAvailable;
  final String? categoryId;
  final String? categoryName;
  final int order;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.menuId,
    required this.name,
    this.description,
    required this.price,
    this.image,
    this.isAvailable = true,
    this.categoryId,
    this.categoryName,
    required this.order,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      menuId: json['menu_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      image: json['image'] as String?,
      isAvailable: json['is_available'] as bool? ?? true,
      categoryId: json['category_id'] as String?,
      categoryName: json['category_name'] as String?,
      order: json['order'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menu_id': menuId,
      'name': name,
      'description': description,
      'price': price,
      'image': image,
      'is_available': isAvailable,
      'category_id': categoryId,
      'order': order,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Product copyWith({
    String? id,
    String? menuId,
    String? name,
    String? description,
    double? price,
    String? image,
    bool? isAvailable,
    String? categoryId,
    String? categoryName,
    int? order,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      menuId: menuId ?? this.menuId,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      image: image ?? this.image,
      isAvailable: isAvailable ?? this.isAvailable,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      order: order ?? this.order,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

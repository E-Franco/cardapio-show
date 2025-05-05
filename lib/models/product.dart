class Product {
  final String id;
  final String menuId;
  final String categoryId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final int? order;
  final bool isAvailable;

  Product({
    required this.id,
    required this.menuId,
    required this.categoryId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.order,
    this.isAvailable = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      menuId: json['menu_id'] as String,
      categoryId: json['category_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] is int) 
          ? (json['price'] as int).toDouble() 
          : json['price'] as double,
      imageUrl: json['image_url'] as String?,
      order: json['order'] as int?,
      isAvailable: json['is_available'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menu_id': menuId,
      'category_id': categoryId,
      'name': name,
      'description': description,
      'price': price,
      'image_url': imageUrl,
      'order': order,
      'is_available': isAvailable,
    };
  }

  Product copyWith({
    String? id,
    String? menuId,
    String? categoryId,
    String? name,
    String? description,
    double? price,
    String? imageUrl,
    int? order,
    bool? isAvailable,
  }) {
    return Product(
      id: id ?? this.id,
      menuId: menuId ?? this.menuId,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
      order: order ?? this.order,
      isAvailable: isAvailable ?? this.isAvailable,
    );
  }
}

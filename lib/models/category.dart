class Category {
  final String id;
  final String name;
  final int? order;
  final String? menuId;

  Category({
    required this.id,
    required this.name,
    this.order,
    this.menuId,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      order: json['order'] as int?,
      menuId: json['menu_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (order != null) 'order': order,
      if (menuId != null) 'menu_id': menuId,
    };
  }

  Category copyWith({
    String? id,
    String? name,
    int? order,
    String? menuId,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      order: order ?? this.order,
      menuId: menuId ?? this.menuId,
    );
  }
}

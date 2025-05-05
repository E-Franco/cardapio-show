class User {
  final String id;
  final String email;
  final String name;
  final bool isAdmin;
  final int menuQuota;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.isAdmin = false,
    this.menuQuota = 3,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      isAdmin: json['is_admin'] ?? false,
      menuQuota: json['menu_quota'] ?? 3,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'is_admin': isAdmin,
      'menu_quota': menuQuota,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    bool? isAdmin,
    int? menuQuota,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      isAdmin: isAdmin ?? this.isAdmin,
      menuQuota: menuQuota ?? this.menuQuota,
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final bool isAdmin;
  final int menuQuota;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.isAdmin,
    required this.menuQuota,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      isAdmin: json['is_admin'] as bool,
      menuQuota: json['menu_quota'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'is_admin': isAdmin,
      'menu_quota': menuQuota,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    bool? isAdmin,
    int? menuQuota,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      isAdmin: isAdmin ?? this.isAdmin,
      menuQuota: menuQuota ?? this.menuQuota,
    );
  }
}

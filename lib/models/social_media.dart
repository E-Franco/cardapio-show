class SocialMedia {
  final String id;
  final String menuId;
  final String? instagram;
  final String? facebook;
  final String? twitter;
  final DateTime createdAt;
  final DateTime updatedAt;

  SocialMedia({
    required this.id,
    required this.menuId,
    this.instagram,
    this.facebook,
    this.twitter,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SocialMedia.fromJson(Map<String, dynamic> json) {
    return SocialMedia(
      id: json['id'] as String,
      menuId: json['menu_id'] as String,
      instagram: json['instagram'] as String?,
      facebook: json['facebook'] as String?,
      twitter: json['twitter'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menu_id': menuId,
      'instagram': instagram,
      'facebook': facebook,
      'twitter': twitter,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  SocialMedia copyWith({
    String? id,
    String? menuId,
    String? instagram,
    String? facebook,
    String? twitter,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return SocialMedia(
      id: id ?? this.id,
      menuId: menuId ?? this.menuId,
      instagram: instagram ?? this.instagram,
      facebook: facebook ?? this.facebook,
      twitter: twitter ?? this.twitter,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SocialMedia &&
        other.id == id &&
        other.menuId == menuId &&
        other.instagram == instagram &&
        other.facebook == facebook &&
        other.twitter == twitter &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      menuId.hashCode ^
      instagram.hashCode ^
      facebook.hashCode ^
      twitter.hashCode ^
      createdAt.hashCode ^
      updatedAt.hashCode;
}

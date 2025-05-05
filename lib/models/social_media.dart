class SocialMedia {
  final String id;
  final String menuId;
  final String? instagram;
  final String? facebook;
  final String? twitter;

  SocialMedia({
    required this.id,
    required this.menuId,
    this.instagram,
    this.facebook,
    this.twitter,
  });

  factory SocialMedia.fromJson(Map<String, dynamic> json) {
    return SocialMedia(
      id: json['id'] ?? '',
      menuId: json['menuId'] ?? '',
      instagram: json['instagram'],
      facebook: json['facebook'],
      twitter: json['twitter'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menuId': menuId,
      'instagram': instagram,
      'facebook': facebook,
      'twitter': twitter,
    };
  }

  SocialMedia copyWith({
    String? id,
    String? menuId,
    String? instagram,
    String? facebook,
    String? twitter,
  }) {
    return SocialMedia(
      id: id ?? this.id,
      menuId: menuId ?? this.menuId,
      instagram: instagram ?? this.instagram,
      facebook: facebook ?? this.facebook,
      twitter: twitter ?? this.twitter,
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
        other.twitter == twitter;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      menuId.hashCode ^
      instagram.hashCode ^
      facebook.hashCode ^
      twitter.hashCode;
}

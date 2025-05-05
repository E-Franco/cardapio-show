class SocialMedia {
  final String id;
  final String menuId;
  final String? instagram;
  final String? facebook;
  final String? twitter;
  final String? whatsapp;
  final String? website;

  SocialMedia({
    required this.id,
    required this.menuId,
    this.instagram,
    this.facebook,
    this.twitter,
    this.whatsapp,
    this.website,
  });

  factory SocialMedia.fromJson(Map<String, dynamic> json) {
    return SocialMedia(
      id: json['id'] as String,
      menuId: json['menu_id'] as String,
      instagram: json['instagram'] as String?,
      facebook: json['facebook'] as String?,
      twitter: json['twitter'] as String?,
      whatsapp: json['whatsapp'] as String?,
      website: json['website'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'menu_id': menuId,
      'instagram': instagram,
      'facebook': facebook,
      'twitter': twitter,
      'whatsapp': whatsapp,
      'website': website,
    };
  }

  SocialMedia copyWith({
    String? id,
    String? menuId,
    String? instagram,
    String? facebook,
    String? twitter,
    String? whatsapp,
    String? website,
  }) {
    return SocialMedia(
      id: id ?? this.id,
      menuId: menuId ?? this.menuId,
      instagram: instagram ?? this.instagram,
      facebook: facebook ?? this.facebook,
      twitter: twitter ?? this.twitter,
      whatsapp: whatsapp ?? this.whatsapp,
      website: website ?? this.website,
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
        other.whatsapp == whatsapp &&
        other.website == website;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      menuId.hashCode ^
      instagram.hashCode ^
      facebook.hashCode ^
      twitter.hashCode ^
      whatsapp.hashCode ^
      website.hashCode;
}

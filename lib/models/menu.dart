import 'package:cardapio_app/models/product.dart';
import 'package:cardapio_app/models/social_media.dart';

class Menu {
  final String id;
  final String name;
  final String ownerId;
  final String? ownerName;
  final String? bannerImage;
  final String? bannerColor;
  final String? bannerLink;
  final bool showLinkButton;
  final String? backgroundColor;
  final String? textColor;
  final String? titlePosition;
  final String? fontFamily;
  final String? bodyBackgroundColor;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Product>? products;
  final SocialMedia? socialMedia;

  Menu({
    required this.id,
    required this.name,
    required this.ownerId,
    this.ownerName,
    this.bannerImage,
    this.bannerColor,
    this.bannerLink,
    this.showLinkButton = false,
    this.backgroundColor,
    this.textColor,
    this.titlePosition,
    this.fontFamily,
    this.bodyBackgroundColor,
    required this.createdAt,
    required this.updatedAt,
    this.products,
    this.socialMedia,
  });

  factory Menu.fromJson(Map<String, dynamic> json) {
    return Menu(
      id: json['id'] as String,
      name: json['name'] as String,
      ownerId: json['owner_id'] as String,
      ownerName: json['owner_name'] as String?,
      bannerImage: json['banner_image'] as String?,
      bannerColor: json['banner_color'] as String?,
      bannerLink: json['banner_link'] as String?,
      showLinkButton: json['show_link_button'] as bool? ?? false,
      backgroundColor: json['background_color'] as String?,
      textColor: json['text_color'] as String?,
      titlePosition: json['title_position'] as String?,
      fontFamily: json['font_family'] as String?,
      bodyBackgroundColor: json['body_background_color'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      products: json['products'] != null
          ? (json['products'] as List).map((p) => Product.fromJson(p)).toList()
          : null,
      socialMedia: json['social_media'] != null
          ? SocialMedia.fromJson(json['social_media'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'owner_id': ownerId,
      'banner_image': bannerImage,
      'banner_color': bannerColor,
      'banner_link': bannerLink,
      'show_link_button': showLinkButton,
      'background_color': backgroundColor,
      'text_color': textColor,
      'title_position': titlePosition,
      'font_family': fontFamily,
      'body_background_color': bodyBackgroundColor,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Menu copyWith({
    String? id,
    String? name,
    String? ownerId,
    String? ownerName,
    String? bannerImage,
    String? bannerColor,
    String? bannerLink,
    bool? showLinkButton,
    String? backgroundColor,
    String? textColor,
    String? titlePosition,
    String? fontFamily,
    String? bodyBackgroundColor,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<Product>? products,
    SocialMedia? socialMedia,
  }) {
    return Menu(
      id: id ?? this.id,
      name: name ?? this.name,
      ownerId: ownerId ?? this.ownerId,
      ownerName: ownerName ?? this.ownerName,
      bannerImage: bannerImage ?? this.bannerImage,
      bannerColor: bannerColor ?? this.bannerColor,
      bannerLink: bannerLink ?? this.bannerLink,
      showLinkButton: showLinkButton ?? this.showLinkButton,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      textColor: textColor ?? this.textColor,
      titlePosition: titlePosition ?? this.titlePosition,
      fontFamily: fontFamily ?? this.fontFamily,
      bodyBackgroundColor: bodyBackgroundColor ?? this.bodyBackgroundColor,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      products: products ?? this.products,
      socialMedia: socialMedia ?? this.socialMedia,
    );
  }
}

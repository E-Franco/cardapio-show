import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

class CachedImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final Duration fadeInDuration;
  final BorderRadius? borderRadius;
  final bool useOldImageOnUrlChange;
  final int memCacheWidth;
  final int memCacheHeight;
  final int maxWidthDiskCache;
  final int maxHeightDiskCache;
  
  // Gerenciador de cache personalizado com limites
  static final customCacheManager = CacheManager(
    Config(
      'customCacheKey',
      stalePeriod: const Duration(days: 7),
      maxNrOfCacheObjects: 100,
      repo: JsonCacheInfoRepository(databaseName: 'cardapio_image_cache'),
      fileService: HttpFileService(),
    ),
  );

  const CachedImage({
    Key? key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.fadeInDuration = const Duration(milliseconds: 300),
    this.borderRadius,
    this.useOldImageOnUrlChange = true,
    this.memCacheWidth = 800,
    this.memCacheHeight = 800,
    this.maxWidthDiskCache = 1200,
    this.maxHeightDiskCache = 1200,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Calcular dimensões para cache de memória baseado no tamanho do widget
    final calculatedMemCacheWidth = width != null ? (width! * MediaQuery.of(context).devicePixelRatio).round() : memCacheWidth;
    final calculatedMemCacheHeight = height != null ? (height! * MediaQuery.of(context).devicePixelRatio).round() : memCacheHeight;
    
    final image = CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,
      fadeInDuration: fadeInDuration,
      useOldImageOnUrlChange: useOldImageOnUrlChange,
      memCacheWidth: calculatedMemCacheWidth,
      memCacheHeight: calculatedMemCacheHeight,
      maxWidthDiskCache: maxWidthDiskCache,
      maxHeightDiskCache: maxHeightDiskCache,
      cacheManager: customCacheManager,
      placeholder: (context, url) => placeholder ?? const Center(
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
      errorWidget: (context, url, error) => errorWidget ?? const Center(
        child: Icon(Icons.error_outline, color: Colors.red),
      ),
    );
    
    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: image,
      );
    }
    
    return image;
  }
}

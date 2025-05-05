import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:cardapio_show/utils/constants.dart';

class CachedImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final BorderRadius? borderRadius;
  final int? memCacheWidth;
  final int? memCacheHeight;
  final Duration fadeInDuration;
  final bool usePlaceholderIfBlob;

  const CachedImage({
    Key? key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.borderRadius,
    this.memCacheWidth,
    this.memCacheHeight,
    this.fadeInDuration = const Duration(milliseconds: 300),
    this.usePlaceholderIfBlob = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Se a URL for um blob, usar um widget de imagem simples
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      return _buildImageWidget(
        usePlaceholderIfBlob 
            ? _buildPlaceholderWidget()
            : Image.network(
                imageUrl,
                width: width,
                height: height,
                fit: fit,
                errorBuilder: (context, error, stackTrace) {
                  return _buildErrorWidget(context);
                },
              ),
      );
    }

    // Se a URL for um placeholder, usar um widget de imagem simples
    if (imageUrl.contains('placeholder.svg')) {
      return _buildImageWidget(
        Image.network(
          imageUrl,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (context, error, stackTrace) {
            return _buildErrorWidget(context);
          },
        ),
      );
    }

    // Calcular dimensões para cache de memória
    final calculatedMemCacheWidth = memCacheWidth ?? _calculateMemCacheSize(width);
    final calculatedMemCacheHeight = memCacheHeight ?? _calculateMemCacheSize(height);

    // Caso contrário, usar CachedNetworkImage
    return _buildImageWidget(
      CachedNetworkImage(
        imageUrl: imageUrl,
        width: width,
        height: height,
        fit: fit,
        memCacheWidth: calculatedMemCacheWidth,
        memCacheHeight: calculatedMemCacheHeight,
        fadeInDuration: fadeInDuration,
        placeholder: (context, url) => placeholder ?? _buildPlaceholderWidget(),
        errorWidget: (context, url, error) => errorWidget ?? _buildErrorWidget(context),
        // Configurações adicionais para otimização
        maxWidthDiskCache: 1280, // Limitar tamanho máximo no cache de disco
        maxHeightDiskCache: 1280,
        useOldImageOnUrlChange: true, // Usar imagem antiga enquanto carrega a nova
      ),
    );
  }

  Widget _buildImageWidget(Widget child) {
    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: child,
      );
    }
    return child;
  }

  Widget _buildPlaceholderWidget() {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildErrorWidget(BuildContext context) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.broken_image,
            color: Colors.grey[400],
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            'Imagem não disponível',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // Calcular tamanho ideal para cache de memória
  int? _calculateMemCacheSize(double? size) {
    if (size == null) return null;
    
    // Considerar a densidade de pixels do dispositivo
    final pixelRatio = WidgetsBinding.instance.window.devicePixelRatio;
    
    // Limitar o tamanho máximo para economizar memória
    return (size * pixelRatio).round().clamp(1, 1000);
  }
}

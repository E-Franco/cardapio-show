import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cardapio_show/models/menu.dart';
import 'package:cardapio_show/utils/constants.dart';
import 'package:cardapio_show/widgets/ui/cached_image.dart';

class MenuCard extends StatelessWidget {
  final Menu menu;
  final VoidCallback onDelete;
  final VoidCallback onEdit;
  final VoidCallback onShare;

  const MenuCard({
    super.key,
    required this.menu,
    required this.onDelete,
    required this.onEdit,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner
          Stack(
            children: [
              Container(
                height: 120,
                color: menu.getBannerColor(),
                child: menu.bannerImage != null
                    ? CachedImage(
                        imageUrl: menu.bannerImage!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                      )
                    : null,
              ),
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.3),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              const Positioned(
                top: 8,
                left: 8,
                child: Icon(
                  Icons.menu_book,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              Positioned.fill(
                child: Center(
                  child: Text(
                    menu.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: AppTextSize.lg,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          offset: Offset(0, 1),
                          blurRadius: 3,
                          color: Colors.black45,
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
          
          // Conteúdo
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: const Text(
                        'Cardápio',
                        style: TextStyle(
                          fontSize: AppTextSize.xs,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.open_in_new,
                        size: 16,
                        color: Colors.grey,
                      ),
                      onPressed: () => context.go('/cardapio/${menu.id}'),
                      tooltip: 'Abrir cardápio',
                      constraints: const BoxConstraints(
                        minWidth: 24,
                        minHeight: 24,
                      ),
                      padding: EdgeInsets.zero,
                      splashRadius: 20,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onShare,
                        icon: const Icon(Icons.share, size: 16),
                        label: const Text('Compartilhar'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: 8,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onEdit,
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Editar'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: 8,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    IconButton(
                      onPressed: onDelete,
                      icon: const Icon(
                        Icons.delete,
                        color: Colors.red,
                        size: 20,
                      ),
                      tooltip: 'Excluir cardápio',
                      constraints: const BoxConstraints(
                        minWidth: 32,
                        minHeight: 32,
                      ),
                      padding: EdgeInsets.zero,
                      splashRadius: 20,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

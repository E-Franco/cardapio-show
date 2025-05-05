import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cardapio_web/models/menu.dart';
import 'package:cardapio_web/models/product.dart';
import 'package:cardapio_web/providers/error_provider.dart';
import 'package:cardapio_web/services/menu_service.dart';
import 'package:cardapio_web/widgets/ui/loading_indicator.dart';
import 'package:cardapio_web/widgets/ui/cached_image.dart';

class MenuViewScreen extends StatefulWidget {
  final String menuId;
  final bool isPreview;
  
  const MenuViewScreen({
    Key? key,
    required this.menuId,
    this.isPreview = false,
  }) : super(key: key);

  @override
  _MenuViewScreenState createState() => _MenuViewScreenState();
}

class _MenuViewScreenState extends State<MenuViewScreen> {
  Menu? _menu;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadMenu();
  }
  
  Future<void> _loadMenu() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final menu = await MenuService().getMenu(widget.menuId);
      if (mounted) {
        setState(() {
          _menu = menu;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.isPreview ? AppBar(
        title: const Text('Pré-visualização do Cardápio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => context.go('/editar-cardapio/${widget.menuId}'),
          ),
        ],
      ) : null,
      body: _isLoading 
        ? const Center(child: LoadingIndicator())
        : _menu == null
          ? const Center(child: Text('Cardápio não encontrado'))
          : _buildMenuContent(),
    );
  }
  
  Widget _buildMenuContent() {
    final bodyColor = _menu!.bodyColor != null 
      ? Color(_menu!.bodyColor!) 
      : Colors.white;
    
    final textColor = _menu!.textColor != null 
      ? Color(_menu!.textColor!) 
      : Colors.black;
    
    return Container(
      color: bodyColor,
      child: Column(
        children: [
          _buildBanner(),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_menu!.displayNameOption != 'none' && _menu!.displayNameOption != 'banner') ...[
                      const SizedBox(height: 20),
                      Center(
                        child: Text(
                          _menu!.name,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                            fontFamily: _menu!.fontFamily ?? 'Roboto',
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    ..._buildCategories(textColor),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildBanner() {
    const double minHeight = 100.0;
    
    if (_menu!.bannerImageUrl == null) {
      return Container(
        width: double.infinity,
        constraints: const BoxConstraints(minHeight: minHeight),
        color: _menu!.bannerColor != null ? Color(_menu!.bannerColor!) : Colors.grey.shade800,
        child: _menu!.displayNameOption == 'banner' 
          ? Center(
              child: Text(
                _menu!.name,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontFamily: _menu!.fontFamily ?? 'Roboto',
                ),
              ),
            )
          : null,
      );
    }
    
    return Stack(
      children: [
        // Banner image
        CachedImage(
          imageUrl: _menu!.bannerImageUrl!,
          width: double.infinity,
          fit: BoxFit.cover,
          placeholder: Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: minHeight),
            color: Colors.grey.shade300,
          ),
        ),
        
        // Overlay for text visibility if displayNameOption is 'banner'
        if (_menu!.displayNameOption == 'banner')
          Container(
            width: double.infinity,
            height: null, // Allow natural height
            color: Colors.black.withOpacity(0.4),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 16),
                child: Text(
                  _menu!.name,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontFamily: _menu!.fontFamily ?? 'Roboto',
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
      ],
    );
  }
  
  List<Widget> _buildCategories(Color textColor) {
    final categories = _menu!.categories;
    
    if (categories == null || categories.isEmpty) {
      return [
        Center(
          child: Text(
            'Nenhuma categoria adicionada',
            style: TextStyle(color: textColor),
          ),
        ),
      ];
    }
    
    return categories.map((category) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 30),
          Text(
            category.name,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: textColor,
              fontFamily: _menu!.fontFamily ?? 'Roboto',
            ),
          ),
          const Divider(thickness: 2),
          const SizedBox(height: 16),
          ..._buildProducts(category.id, textColor),
        ],
      );
    }).toList();
  }
  
  List<Widget> _buildProducts(String categoryId, Color textColor) {
    final products = _menu!.products
        ?.where((product) => product.categoryId == categoryId)
        .toList();
    
    if (products == null || products.isEmpty) {
      return [
        Center(
          child: Text(
            'Nenhum produto adicionado',
            style: TextStyle(color: textColor),
          ),
        ),
      ];
    }
    
    return products.map((product) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: _buildProductCard(product, textColor),
      );
    }).toList();
  }
  
  Widget _buildProductCard(Product product, Color textColor) {
    return Card(
      color: Colors.white.withOpacity(0.9),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (product.imageUrl != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedImage(
                  imageUrl: product.imageUrl!,
                  width: 100,
                  height: 100,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                            fontFamily: _menu!.fontFamily ?? 'Roboto',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'R\$ ${product.price.toStringAsFixed(2).replaceAll('.', ',')}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade800,
                          fontFamily: _menu!.fontFamily ?? 'Roboto',
                        ),
                      ),
                    ],
                  ),
                  if (product.description != null && product.description!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      product.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: textColor.withOpacity(0.8),
                        fontFamily: _menu!.fontFamily ?? 'Roboto',
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

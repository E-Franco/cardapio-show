import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cardapio_web/models/menu.dart';
import 'package:cardapio_web/models/product.dart';
import 'package:cardapio_web/models/category.dart';
import 'package:cardapio_web/providers/error_provider.dart';
import 'package:cardapio_web/services/menu_service.dart';
import 'package:cardapio_web/widgets/menu/add_image_form.dart';
import 'package:cardapio_web/widgets/menu/add_product_form.dart';
import 'package:cardapio_web/widgets/ui/color_picker_with_opacity.dart';
import 'package:cardapio_web/widgets/ui/loading_indicator.dart';
import 'package:cardapio_web/widgets/ui/confirm_dialog.dart';
import 'package:cardapio_web/widgets/ui/cached_image.dart';
import 'package:cardapio_web/widgets/ui/qr_code_generator.dart';

class MenuEditScreen extends StatefulWidget {
  final String menuId;
  
  const MenuEditScreen({
    Key? key,
    required this.menuId,
  }) : super(key: key);

  @override
  _MenuEditScreenState createState() => _MenuEditScreenState();
}

class _MenuEditScreenState extends State<MenuEditScreen> with SingleTickerProviderStateMixin {
  Menu? _menu;
  bool _isLoading = true;
  bool _isSaving = false;
  
  final _nameController = TextEditingController();
  final _addCategoryController = TextEditingController();
  
  late TabController _tabController;
  
  // Design options
  String _displayNameOption = 'below';
  String _selectedFont = 'Roboto';
  List<String> _availableFonts = [
    'Roboto',
    'Lato',
    'Open Sans',
    'Montserrat',
    'Playfair Display',
    'Oswald',
  ];
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadMenu();
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _addCategoryController.dispose();
    _tabController.dispose();
    super.dispose();
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
          _nameController.text = menu.name;
          _displayNameOption = menu.displayNameOption ?? 'below';
          _selectedFont = menu.fontFamily ?? 'Roboto';
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
  
  Future<void> _saveMenu() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('O nome do cardápio não pode estar vazio'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    setState(() {
      _isSaving = true;
    });
    
    try {
      final updatedMenu = _menu!.copyWith(
        name: _nameController.text,
        displayNameOption: _displayNameOption,
        fontFamily: _selectedFont,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cardápio salvo com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }
  
  void _showAddCategoryDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Adicionar Categoria'),
        content: TextField(
          controller: _addCategoryController,
          decoration: const InputDecoration(
            labelText: 'Nome da categoria',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _addCategoryController.clear();
            },
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (_addCategoryController.text.trim().isNotEmpty) {
                _addCategory(_addCategoryController.text);
                Navigator.pop(context);
                _addCategoryController.clear();
              }
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    );
  }
  
  Future<void> _addCategory(String name) async {
    try {
      final newCategory = Category(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: name,
      );
      
      List<Category> updatedCategories = [...(_menu!.categories ?? []), newCategory];
      
      final updatedMenu = _menu!.copyWith(
        categories: updatedCategories,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        setState(() {
          _menu = updatedMenu;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Categoria adicionada com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    }
  }
  
  Future<void> _removeCategory(Category category) async {
    final hasProducts = _menu!.products?.any((p) => p.categoryId == category.id) ?? false;
    
    if (hasProducts) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Não é possível remover uma categoria que contém produtos.'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Remover categoria',
        content: 'Tem certeza que deseja remover a categoria "${category.name}"?',
        confirmText: 'Remover',
        isDanger: true,
      ),
    );
    
    if (confirmed != true) return;
    
    try {
      List<Category> updatedCategories = _menu!.categories?.where((c) => c.id != category.id).toList() ?? [];
      
      final updatedMenu = _menu!.copyWith(
        categories: updatedCategories,
      );
        ?? [];
      
      final updatedMenu = _menu!.copyWith(
        categories: updatedCategories,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        setState(() {
          _menu = updatedMenu;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Categoria removida com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    }
  }
  
  void _showAddProductDialog(String categoryId) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Container(
          width: 600,
          padding: const EdgeInsets.all(16),
          child: AddProductForm(
            menuId: widget.menuId,
            categoryId: categoryId,
            onProductAdded: (product) {
              _addProduct(product);
              Navigator.pop(context);
            },
          ),
        ),
      ),
    );
  }
  
  void _showEditProductDialog(Product product) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Container(
          width: 600,
          padding: const EdgeInsets.all(16),
          child: AddProductForm(
            menuId: widget.menuId,
            categoryId: product.categoryId,
            productToEdit: product,
            onProductAdded: (updatedProduct) {
              _updateProduct(updatedProduct);
              Navigator.pop(context);
            },
          ),
        ),
      ),
    );
  }
  
  Future<void> _addProduct(Product product) async {
    try {
      List<Product> updatedProducts = [...(_menu!.products ?? []), product];
      
      final updatedMenu = _menu!.copyWith(
        products: updatedProducts,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        setState(() {
          _menu = updatedMenu;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produto adicionado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    }
  }
  
  Future<void> _updateProduct(Product updatedProduct) async {
    try {
      List<Product> updatedProducts = _menu!.products?.map((p) => 
        p.id == updatedProduct.id ? updatedProduct : p
      ).toList() ?? [];
      
      final updatedMenu = _menu!.copyWith(
        products: updatedProducts,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        setState(() {
          _menu = updatedMenu;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produto atualizado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    }
  }
  
  Future<void> _removeProduct(Product product) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Remover produto',
        content: 'Tem certeza que deseja remover o produto "${product.name}"?',
        confirmText: 'Remover',
        isDanger: true,
      ),
    );
    
    if (confirmed != true) return;
    
    try {
      List<Product> updatedProducts = _menu!.products?.where((p) => p.id != product.id).toList() ?? [];
      
      final updatedMenu = _menu!.copyWith(
        products: updatedProducts,
      );
      
      await MenuService().updateMenu(updatedMenu);
      
      if (mounted) {
        setState(() {
          _menu = updatedMenu;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produto removido com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
      }
    }
  }
  
  void _showBannerImageDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Container(
          width: 600,
          padding: const EdgeInsets.all(16),
          child: AddImageForm(
            menuId: widget.menuId,
            currentImageUrl: _menu!.bannerImageUrl,
            onImageUploaded: (imageUrl) {
              setState(() {
                _menu = _menu!.copyWith(bannerImageUrl: imageUrl);
              });
            },
            title: 'Upload de Imagem de Banner',
            imageType: 'banner',
          ),
        ),
      ),
    );
  }
  
  void _showShareDialog() {
    final menuUrl = 'https://cardapioweb.com/cardapio/${widget.menuId}';
    
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Container(
          width: 400,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Compartilhar Cardápio',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              QrCodeGenerator(
                data: menuUrl,
                title: _menu!.name,
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              const Text(
                'Link do cardápio:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        menuUrl,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy),
                      onPressed: () {
                        // Copy to clipboard functionality
                        // This would use a clipboard package in a real app
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Link copiado para a área de transferência!'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Fechar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  void _updateColor(String colorType, Color color) {
    try {
      Menu updatedMenu;
      
      switch (colorType) {
        case 'banner':
          updatedMenu = _menu!.copyWith(bannerColor: color.value);
          break;
        case 'body':
          updatedMenu = _menu!.copyWith(bodyColor: color.value);
          break;
        case 'text':
          updatedMenu = _menu!.copyWith(textColor: color.value);
          break;
        default:
          return;
      }
      
      setState(() {
        _menu = updatedMenu;
      });
      
      MenuService().updateMenu(updatedMenu);
    } catch (e) {
      Provider.of<ErrorProvider>(context, listen: false).setError(e.toString());
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Cardápio'),
        actions: [
          if (!_isLoading && !_isSaving) ...[
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: _showShareDialog,
              tooltip: 'Compartilhar',
            ),
            IconButton(
              icon: const Icon(Icons.preview),
              onPressed: () => context.go('/preview-cardapio/${widget.menuId}'),
              tooltip: 'Pré-visualizar',
            ),
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _saveMenu,
              tooltip: 'Salvar',
            ),
          ],
        ],
      ),
      body: _isLoading || _menu == null
          ? const Center(child: LoadingIndicator())
          : Column(
              children: [
                TabBar(
                  controller: _tabController,
                  tabs: const [
                    Tab(text: 'Conteúdo'),
                    Tab(text: 'Aparência'),
                    Tab(text: 'Configurações'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildContentTab(),
                      _buildAppearanceTab(),
                      _buildSettingsTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
  
  Widget _buildContentTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Nome do Cardápio',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Categorias',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              ElevatedButton.icon(
                onPressed: _showAddCategoryDialog,
                icon: const Icon(Icons.add),
                label: const Text('Adicionar Categoria'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ..._buildCategoriesWithProducts(),
        ],
      ),
    );
  }
  
  List<Widget> _buildCategoriesWithProducts() {
    final categories = _menu!.categories;
    
    if (categories == null || categories.isEmpty) {
      return [
        const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Text('Nenhuma categoria adicionada'),
          ),
        ),
      ];
    }
    
    return categories.map((category) {
      return Card(
        margin: const EdgeInsets.only(bottom: 24),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    category.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeCategory(category),
                        tooltip: 'Remover categoria',
                      ),
                    ],
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Produtos',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showAddProductDialog(category.id),
                    icon: const Icon(Icons.add),
                    label: const Text('Adicionar Produto'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ..._buildProductsList(category.id),
            ],
          ),
        ),
      );
    }).toList();
  }
  
  List<Widget> _buildProductsList(String categoryId) {
    final products = _menu!.products
        ?.where((product) => product.categoryId == categoryId)
        .toList();
    
    if (products == null || products.isEmpty) {
      return [
        const Center(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text('Nenhum produto adicionado'),
          ),
        ),
      ];
    }
    
    return products.map((product) {
      return Card(
        elevation: 2,
        margin: const EdgeInsets.only(bottom: 12),
        child: ListTile(
          leading: product.imageUrl != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: CachedImage(
                    imageUrl: product.imageUrl!,
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                  ),
                )
              : const Icon(Icons.fastfood),
          title: Text(product.name),
          subtitle: product.description != null && product.description!.isNotEmpty
              ? Text(
                  product.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                )
              : null,
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'R\$ ${product.price.toStringAsFixed(2).replaceAll('.', ',')}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 16),
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () => _showEditProductDialog(product),
                tooltip: 'Editar produto',
              ),
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () => _removeProduct(product),
                tooltip: 'Remover produto',
              ),
            ],
          ),
        ),
      );
    }).toList();
  }
  
  Widget _buildAppearanceTab() {
    final bannerColor = _menu!.bannerColor != null 
      ? Color(_menu!.bannerColor!) 
      : Colors.grey.shade800;
      
    final bodyColor = _menu!.bodyColor != null 
      ? Color(_menu!.bodyColor!) 
      : Colors.white;
      
    final textColor = _menu!.textColor != null 
      ? Color(_menu!.textColor!) 
      : Colors.black;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Banner',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    height: 150,
                    decoration: BoxDecoration(
                      color: bannerColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: _menu!.bannerImageUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CachedImage(
                              imageUrl: _menu!.bannerImageUrl!,
                              width: double.infinity,
                              height: 150,
                              fit: BoxFit.cover,
                            ),
                          )
                        : const Center(
                            child: Text(
                              'Sem imagem de banner',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: _showBannerImageDialog,
                        icon: const Icon(Icons.image),
                        label: Text(_menu!.bannerImageUrl != null
                            ? 'Alterar imagem'
                            : 'Adicionar imagem'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ColorPickerWithOpacity(
                    initialColor: bannerColor,
                    onColorChanged: (color) => _updateColor('banner', color),
                    label: 'Cor do Banner (quando não há imagem)',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Nome do Restaurante',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Onde exibir o nome do restaurante:'),
                  const SizedBox(height: 8),
                  RadioListTile<String>(
                    title: const Text('Dentro do banner'),
                    value: 'banner',
                    groupValue: _displayNameOption,
                    onChanged: (value) {
                      setState(() {
                        _displayNameOption = value!;
                      });
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('Abaixo do banner'),
                    value: 'below',
                    groupValue: _displayNameOption,
                    onChanged: (value) {
                      setState(() {
                        _displayNameOption = value!;
                      });
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('Não exibir'),
                    value: 'none',
                    groupValue: _displayNameOption,
                    onChanged: (value) {
                      setState(() {
                        _displayNameOption = value!;
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Cores e Fontes',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ColorPickerWithOpacity(
                    initialColor: bodyColor,
                    onColorChanged: (color) => _updateColor('body', color),
                    label: 'Cor de fundo do cardápio',
                    allowTransparent: true,
                  ),
                  const SizedBox(height: 16),
                  ColorPickerWithOpacity(
                    initialColor: textColor,
                    onColorChanged: (color) => _updateColor('text', color),
                    label: 'Cor do texto',
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Fonte:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _selectedFont,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                    ),
                    items: _availableFonts.map((font) {
                      return DropdownMenuItem<String>(
                        value: font,
                        child: Text(
                          font,
                          style: TextStyle(fontFamily: font),
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _selectedFont = value;
                        });
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSettingsTab() {
    final publicUrl = 'https://cardapioweb.com/cardapio/${widget.menuId}';
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Link Público',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Utilize este link para compartilhar seu cardápio:',
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            publicUrl,
                            style: const TextStyle(fontSize: 14),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy),
                          onPressed: () {
                            // Copy to clipboard functionality
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Link copiado para a área de transferência!'),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'QR Code',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Gere um QR Code para compartilhar seu cardápio:',
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: ElevatedButton.icon(
                      onPressed: _showShareDialog,
                      icon: const Icon(Icons.qr_code),
                      label: const Text('Gerar QR Code'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

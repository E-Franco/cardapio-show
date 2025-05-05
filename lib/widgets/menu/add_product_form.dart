import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:cardapio_show/models/product.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/services/upload_service.dart';
import 'package:cardapio_show/utils/constants.dart';
import 'package:cardapio_show/widgets/ui/loading_indicator.dart';

class AddProductForm extends StatefulWidget {
  final String menuId;
  final String categoryId;
  final Function(Product) onProductAdded;
  final Product? productToEdit;

  const AddProductForm({
    Key? key,
    required this.menuId,
    required this.categoryId,
    required this.onProductAdded,
    this.productToEdit,
  }) : super(key: key);

  @override
  _AddProductFormState createState() => _AddProductFormState();
}

class _AddProductFormState extends State<AddProductForm> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  String? _imageUrl;
  File? _imageFile;
  bool _isLoading = false;
  final ImagePicker _imagePicker = ImagePicker();
  final UploadService _uploadService = UploadService();

  @override
  void initState() {
    super.initState();
    if (widget.productToEdit != null) {
      _nameController.text = widget.productToEdit!.name;
      _descriptionController.text = widget.productToEdit!.description ?? '';
      _priceController.text = widget.productToEdit!.price.toString();
      _imageUrl = widget.productToEdit!.imageUrl;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    // Clean up any temporary blob URLs
    if (_imageFile != null) {
      _releaseFileResources();
    }
    super.dispose();
  }

  void _releaseFileResources() {
    _imageFile = null;
  }

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );
      
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
          _imageUrl = null; // Clear the previous URL if there was one
        });
      }
    } catch (e) {
      Provider.of<ErrorProvider>(context, listen: false).setError(
        'Erro ao selecionar imagem: ${e.toString()}'
      );
    }
  }

  Future<void> _handleSubmit() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        String? finalImageUrl = _imageUrl;
        
        // Upload new image if selected
        if (_imageFile != null) {
          finalImageUrl = await _uploadService.uploadProductImage(
            widget.menuId,
            _imageFile!,
          );
        }
        
        final double price = double.tryParse(_priceController.text.replaceAll(',', '.')) ?? 0.0;
        
        final Product product = Product(
          id: widget.productToEdit?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
          menuId: widget.menuId,
          categoryId: widget.categoryId,
          name: _nameController.text,
          description: _descriptionController.text.isNotEmpty 
              ? _descriptionController.text 
              : null,
          price: price,
          imageUrl: finalImageUrl,
        );
        
        widget.onProductAdded(product);
        
        // Reset form after successful submission
        _resetForm();
        
      } catch (e) {
        if (mounted) {
          Provider.of<ErrorProvider>(context, listen: false).setError(
            'Erro ao adicionar produto: ${e.toString()}'
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }
  
  void _resetForm() {
    _nameController.clear();
    _descriptionController.clear();
    _priceController.clear();
    setState(() {
      _imageFile = null;
      _imageUrl = null;
    });
    _formKey.currentState?.reset();
    _releaseFileResources();
  }

  @override
  Widget build(BuildContext context) {
    final bool isEditing = widget.productToEdit != null;
    
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isEditing ? 'Editar Produto' : 'Adicionar Produto',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _isLoading
              ? const Center(child: LoadingIndicator())
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nome do produto',
                        border: OutlineInputBorder(),
                      ),
                      validator: (String? value) {
                        if (value == null || value.isEmpty) {
                          return 'Por favor, insira o nome do produto';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Descrição (opcional)',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _priceController,
                      decoration: const InputDecoration(
                        labelText: 'Preço',
                        border: OutlineInputBorder(),
                        prefixText: 'R\$ ',
                      ),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (String? value) {
                        if (value == null || value.isEmpty) {
                          return 'Por favor, insira o preço';
                        }
                        if (double.tryParse(value.replaceAll(',', '.')) == null) {
                          return 'Por favor, insira um valor válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Imagem do produto (opcional):',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (_imageFile != null || _imageUrl != null)
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: _imageFile != null
                                  ? Image.file(
                                      _imageFile!,
                                      fit: BoxFit.cover,
                                    )
                                  : _imageUrl != null
                                      ? Image.network(
                                          _imageUrl!,
                                          fit: BoxFit.cover,
                                          loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
                                            if (loadingProgress == null) return child;
                                            return const Center(
                                              child: CircularProgressIndicator(),
                                            );
                                          },
                                          errorBuilder: (BuildContext context, Object error, StackTrace? stackTrace) {
                                            return const Center(
                                              child: Icon(Icons.error),
                                            );
                                          },
                                        )
                                      : const SizedBox(),
                            ),
                          ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ElevatedButton.icon(
                              onPressed: _pickImage,
                              icon: const Icon(Icons.image),
                              label: Text(_imageFile != null || _imageUrl != null
                                  ? 'Alterar imagem'
                                  : 'Escolher imagem'),
                            ),
                            if (_imageFile != null || _imageUrl != null) ...[
                              const SizedBox(height: 8),
                              TextButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _imageFile = null;
                                    _imageUrl = null;
                                  });
                                },
                                icon: const Icon(Icons.delete, color: Colors.red),
                                label: const Text(
                                  'Remover imagem',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {
                            _resetForm();
                            Navigator.of(context).pop();
                          },
                          child: const Text('Cancelar'),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _handleSubmit,
                          child: Text(isEditing ? 'Atualizar' : 'Adicionar'),
                        ),
                      ],
                    ),
                  ],
                ),
        ],
      ),
    );
  }
}

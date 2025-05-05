import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:cardapio_web/providers/error_provider.dart';
import 'package:cardapio_web/services/upload_service.dart';
import 'package:cardapio_web/widgets/ui/loading_indicator.dart';

class AddImageForm extends StatefulWidget {
  final String menuId;
  final String? currentImageUrl;
  final Function(String) onImageUploaded;
  final String title;
  final String imageType;

  const AddImageForm({
    Key? key,
    required this.menuId,
    this.currentImageUrl,
    required this.onImageUploaded,
    required this.title,
    required this.imageType,
  }) : super(key: key);

  @override
  _AddImageFormState createState() => _AddImageFormState();
}

class _AddImageFormState extends State<AddImageForm> {
  File? _imageFile;
  bool _isLoading = false;
  final _imagePicker = ImagePicker();
  final _formKey = GlobalKey<FormState>();
  
  @override
  void dispose() {
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
      final pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );
      
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
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
      if (_imageFile == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Por favor, selecione uma imagem'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        final imageUrl = await UploadService().uploadMenuImage(
          widget.menuId,
          _imageFile!,
          widget.imageType,
        );
        
        widget.onImageUploaded(imageUrl);
        _resetForm();
        
        if (mounted) {
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (mounted) {
          Provider.of<ErrorProvider>(context, listen: false).setError(
            'Erro ao fazer upload da imagem: ${e.toString()}'
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
    setState(() {
      _imageFile = null;
    });
    _formKey.currentState?.reset();
    _releaseFileResources();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.title,
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
                    if (widget.currentImageUrl != null) ...[
                      const Text(
                        'Imagem atual:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.currentImageUrl!,
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              width: double.infinity,
                              height: 200,
                              color: Colors.grey.shade300,
                              child: const Center(
                                child: Icon(Icons.error, size: 48),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),
                    ],
                    const Text(
                      'Nova imagem:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    if (_imageFile != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          _imageFile!,
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.cover,
                        ),
                      ),
                    const SizedBox(height: 16),
                    Center(
                      child: ElevatedButton.icon(
                        onPressed: _pickImage,
                        icon: const Icon(Icons.image),
                        label: Text(_imageFile != null
                            ? 'Alterar imagem'
                            : 'Escolher imagem'),
                      ),
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
                          onPressed: _imageFile != null ? _handleSubmit : null,
                          child: const Text('Salvar'),
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

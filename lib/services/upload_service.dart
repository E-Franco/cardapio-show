import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';

class UploadService {
  final SupabaseClient _supabase = Supabase.instance.client;
  static const String BUCKET_PRODUCTS = 'product-images';
  static const String BUCKET_BANNERS = 'banner-images';
  static const String BUCKET_PROFILES = 'profile-images';
  
  // Upload de imagem com compressão
  Future<String> uploadImage(File file, String bucket, {int quality = 85}) async {
    try {
      // Gerar nome único para o arquivo
      final String fileExt = path.extension(file.path);
      final String fileName = '${const Uuid().v4()}$fileExt';
      
      // Comprimir imagem
      final File compressedFile = await _compressImage(file, quality);
      
      // Fazer upload
      await _supabase.storage.from(bucket).upload(
        fileName,
        compressedFile,
        fileOptions: const FileOptions(
          cacheControl: '3600',
          upsert: false,
        ),
      );
      
      // Obter URL pública
      final String imageUrl = _supabase.storage.from(bucket).getPublicUrl(fileName);
      
      // Limpar arquivo temporário
      await compressedFile.delete();
      
      return imageUrl;
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem: $e');
    }
  }
  
  // Upload específico para imagens de produtos
  Future<String> uploadProductImage(String menuId, File file, {int quality = 85}) async {
    try {
      return await uploadImage(file, BUCKET_PRODUCTS, quality: quality);
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem do produto: $e');
    }
  }
  
  // Upload específico para imagens de banner
  Future<String> uploadBannerImage(String menuId, File file, {int quality = 90}) async {
    try {
      return await uploadImage(file, BUCKET_BANNERS, quality: quality);
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem do banner: $e');
    }
  }
  
  // Upload específico para imagens de perfil
  Future<String> uploadProfileImage(File file, {int quality = 80}) async {
    try {
      return await uploadImage(file, BUCKET_PROFILES, quality: quality);
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem de perfil: $e');
    }
  }

  // Upload específico para imagens de menu
  Future<String> uploadMenuImage(
    String menuId,
    File file,
    String imageType,
    {int quality = 90}
  ) async {
    try {
      final String bucket = imageType == 'banner' ? BUCKET_BANNERS : BUCKET_PRODUCTS;
      return await uploadImage(file, bucket, quality: quality);
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem do menu: $e');
    }
  }
  
  // Comprimir imagem
  Future<File> _compressImage(File file, int quality) async {
    // Ler a imagem
    final List<int> bytes = await file.readAsBytes();
    final img.Image? image = img.decodeImage(bytes);
    
    if (image == null) {
      throw Exception('Não foi possível decodificar a imagem');
    }
    
    // Redimensionar se for muito grande
    img.Image resized = image;
    if (image.width > 1200 || image.height > 1200) {
      resized = img.copyResize(
        image,
        width: image.width > image.height ? 1200 : null,
        height: image.width <= image.height ? 1200 : null,
      );
    }
    
    // Comprimir
    final List<int> compressedBytes = img.encodeJpg(resized, quality: quality);
    
    // Salvar em arquivo temporário
    final Directory tempDir = await getTemporaryDirectory();
    final File tempFile = File('${tempDir.path}/${const Uuid().v4()}.jpg');
    await tempFile.writeAsBytes(compressedBytes);
    
    return tempFile;
  }
  
  // Excluir imagem
  Future<void> deleteImage(String imageUrl, String bucket) async {
    try {
      // Extrair nome do arquivo da URL
      final Uri uri = Uri.parse(imageUrl);
      final List<String> pathSegments = uri.pathSegments;
      final String fileName = pathSegments.last;
      
      await _supabase.storage.from(bucket).remove([fileName]);
    } catch (e) {
      throw Exception('Erro ao excluir imagem: $e');
    }
  }
  
  // Excluir imagem de produto
  Future<void> deleteProductImage(String imageUrl) async {
    try {
      await deleteImage(imageUrl, BUCKET_PRODUCTS);
    } catch (e) {
      throw Exception('Erro ao excluir imagem do produto: $e');
    }
  }
  
  // Excluir imagem de banner
  Future<void> deleteBannerImage(String imageUrl) async {
    try {
      await deleteImage(imageUrl, BUCKET_BANNERS);
    } catch (e) {
      throw Exception('Erro ao excluir imagem do banner: $e');
    }
  }
  
  // Excluir imagem de perfil
  Future<void> deleteProfileImage(String imageUrl) async {
    try {
      await deleteImage(imageUrl, BUCKET_PROFILES);
    } catch (e) {
      throw Exception('Erro ao excluir imagem de perfil: $e');
    }
  }
}

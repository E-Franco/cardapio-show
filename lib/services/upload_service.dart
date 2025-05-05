import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';

class UploadService {
  final SupabaseClient _supabase;
  
  UploadService(this._supabase);
  
  // Upload de imagem com compressão
  Future<String> uploadImage(File file, String bucket, {int quality = 85}) async {
    try {
      // Gerar nome único para o arquivo
      final fileExt = path.extension(file.path);
      final fileName = '${const Uuid().v4()}$fileExt';
      
      // Comprimir imagem
      final compressedFile = await _compressImage(file, quality);
      
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
      final imageUrl = _supabase.storage.from(bucket).getPublicUrl(fileName);
      
      // Limpar arquivo temporário
      await compressedFile.delete();
      
      return imageUrl;
    } catch (e) {
      throw Exception('Erro ao fazer upload da imagem: $e');
    }
  }
  
  // Comprimir imagem
  Future<File> _compressImage(File file, int quality) async {
    // Ler a imagem
    final bytes = await file.readAsBytes();
    final image = img.decodeImage(bytes);
    
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
    final compressedBytes = img.encodeJpg(resized, quality: quality);
    
    // Salvar em arquivo temporário
    final tempDir = await getTemporaryDirectory();
    final tempFile = File('${tempDir.path}/${const Uuid().v4()}.jpg');
    await tempFile.writeAsBytes(compressedBytes);
    
    return tempFile;
  }
  
  // Excluir imagem
  Future<void> deleteImage(String imageUrl, String bucket) async {
    try {
      // Extrair nome do arquivo da URL
      final uri = Uri.parse(imageUrl);
      final pathSegments = uri.pathSegments;
      final fileName = pathSegments.last;
      
      await _supabase.storage.from(bucket).remove([fileName]);
    } catch (e) {
      throw Exception('Erro ao excluir imagem: $e');
    }
  }
}

import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:path/path.dart' as path;
import 'package:http/http.dart' as http;

class UploadService {
  static final _supabase = Supabase.instance.client;
  static final _uuid = const Uuid();

  // Upload de imagem
  static Future<String> uploadImage(Uint8List bytes, String fileName, String folder) async {
    try {
      final fileExt = path.extension(fileName).replaceAll('.', '');
      final filePath = '$folder/${_uuid.v4()}.$fileExt';

      await _supabase.storage
          .from('cardapio-show')
          .uploadBinary(
            filePath,
            bytes,
            fileOptions: FileOptions(
              contentType: 'image/$fileExt',
            ),
          );

      final imageUrl = _supabase.storage
          .from('cardapio-show')
          .getPublicUrl(filePath);

      return imageUrl;
    } catch (e) {
      debugPrint('Erro ao fazer upload da imagem: $e');
      rethrow;
    }
  }

  // Excluir imagem
  static Future<void> deleteImage(String imageUrl) async {
    try {
      // Verificar se a URL é do Supabase
      if (!imageUrl.contains('storage.googleapis.com') && 
          !imageUrl.contains('supabase')) {
        return;
      }

      // Extrair o caminho do arquivo da URL
      final uri = Uri.parse(imageUrl);
      final pathSegments = uri.pathSegments;
      
      // O último segmento deve ser o nome do arquivo
      if (pathSegments.length < 2) {
        return;
      }
      
      // Obter o bucket e o caminho
      final bucket = pathSegments[pathSegments.length - 2];
      final filePath = pathSegments.last;
      
      await _supabase.storage
          .from(bucket)
          .remove([filePath]);
    } catch (e) {
      debugPrint('Erro ao excluir imagem: $e');
      // Não relançar o erro para não interromper o fluxo
    }
  }

  // Verificar se uma URL de imagem é válida
  static Future<bool> isImageUrlValid(String url) async {
    try {
      final response = await http.head(Uri.parse(url));
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      return false;
    }
  }
}

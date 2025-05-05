import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  // Supabase
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get supabaseServiceKey => dotenv.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
  
  // Configurações do app
  static String get appName => dotenv.env['APP_NAME'] ?? 'Cardápio Show';
  static String get appVersion => dotenv.env['APP_VERSION'] ?? '1.0.0';
  
  // URLs
  static String get apiUrl => dotenv.env['API_URL'] ?? '';
  static String get webUrl => dotenv.env['WEB_URL'] ?? '';
  
  // Configurações de cache
  static int get cacheMaxAge => int.tryParse(dotenv.env['CACHE_MAX_AGE'] ?? '7') ?? 7; // dias
  
  // Não permitir instanciação
  Env._();
}

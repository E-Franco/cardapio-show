import 'package:flutter/material.dart';

// Cores
class AppColors {
  static const Color primary = Color(0xFFE5324B);
  static const Color secondary = Color(0xFF2D3748);
  static const Color accent = Color(0xFFFFC107);
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFDC3545);
  static const Color success = Color(0xFF28A745);
  static const Color warning = Color(0xFFFFC107);
  static const Color info = Color(0xFF17A2B8);
  
  // Não permitir instanciação
  AppColors._();
}

// Espaçamentos
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  
  // Não permitir instanciação
  AppSpacing._();
}

// Raios de borda
class AppRadius {
  static const double xs = 2.0;
  static const double sm = 4.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double round = 100.0;
  
  // Não permitir instanciação
  AppRadius._();
}

// Tamanhos de texto
class AppTextSize {
  static const double xs = 12.0;
  static const double sm = 14.0;
  static const double md = 16.0;
  static const double lg = 18.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  
  // Não permitir instanciação
  AppTextSize._();
}

// Duração de animações
class AppDuration {
  static const Duration short = Duration(milliseconds: 150);
  static const Duration medium = Duration(milliseconds: 300);
  static const Duration long = Duration(milliseconds: 500);
  
  // Não permitir instanciação
  AppDuration._();
}

// Tamanhos de tela
class AppBreakpoints {
  static const double mobile = 600;
  static const double tablet = 960;
  static const double desktop = 1280;
  
  // Não permitir instanciação
  AppBreakpoints._();
}

// Configurações de API
class ApiConfig {
  static const int defaultTimeout = 30; // segundos
  static const int maxRetries = 3;
  
  // Não permitir instanciação
  ApiConfig._();
}

// Configurações de cache
class CacheConfig {
  static const Duration defaultExpiration = Duration(days: 7);
  static const int maxCacheSize = 50 * 1024 * 1024; // 50 MB
  
  // Não permitir instanciação
  CacheConfig._();
}

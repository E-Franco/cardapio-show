import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/providers/theme_provider.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/routes/router.dart';
import 'package:cardapio_show/services/cache_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Carregar variáveis de ambiente
  await dotenv.load(fileName: ".env");
  
  // Inicializar serviços
  final cacheService = CacheService();
  await cacheService.init();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => ErrorProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider(cacheService)),
        Provider<CacheService>.value(value: cacheService),
      ],
      child: const CardapioApp(),
    ),
  );
}

class CardapioApp extends StatelessWidget {
  const CardapioApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    
    return MaterialApp.router(
      title: 'Cardápio Show',
      theme: themeProvider.lightTheme,
      darkTheme: themeProvider.darkTheme,
      themeMode: themeProvider.themeMode,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cardapio_show/providers/auth_provider.dart';
import 'package:cardapio_show/providers/theme_provider.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/routes/router.dart';
import 'package:cardapio_show/utils/env.dart';
import 'package:cardapio_show/utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Carregar variáveis de ambiente
  await Environment.load();
  
  // Inicializar Supabase
  await Supabase.initialize(
    url: Environment.supabaseUrl,
    anonKey: Environment.supabaseAnonKey,
    debug: false,
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => ErrorProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp.router(
            title: AppConstants.appName,
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: themeProvider.themeMode,
            debugShowCheckedModeBanner: false,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}

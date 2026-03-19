import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'core/router/app_router.dart';
import 'features/auth/auth_service.dart';
import 'features/expert/expert_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    }
  } catch (e) {
    debugPrint("Firebase initialization warning: $e");
  }

  // Initialize AuthService
  final authService = AuthService();
  final appRouter = AppRouter(authService);
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authService),
        ChangeNotifierProvider(create: (_) => ExpertProvider()),
      ],
      child: SommelierApp(appRouter: appRouter),
    ),
  );
}

class SommelierApp extends StatelessWidget {
  final AppRouter appRouter;
  
  const SommelierApp({super.key, required this.appRouter});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Oinos Sommelier',
      theme: ThemeData(
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF191C2E), // Dark Purple
          onPrimary: Colors.white,
          secondary: Color(0xFFF1F3F7), // Light Gray
          onSecondary: Color(0xFF191C2E),
          surface: Colors.white,
          onSurface: Color(0xFF191C2E),
          tertiary: Color(0xFF1A667A), // Petrol Blue / Accent
          onTertiary: Colors.white,
          surfaceContainerHighest: Color(0xFFF1F3F7),
          outline: Color(0xFFE4E7EC),
        ),
        scaffoldBackgroundColor: Colors.white,
        useMaterial3: true,
      ),
      themeMode: ThemeMode.light, // Strictly Light Mode
      routerConfig: appRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/auth_service.dart';
import '../../features/auth/sign_in_screen.dart';
import '../../features/expert/expert_screen.dart';
import '../../features/lab/lab_screen.dart';
import 'scaffold_with_nav_bar.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _expertNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'expert');
final GlobalKey<NavigatorState> _labNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'lab');

class AppRouter {
  final AuthService authService;
  
  AppRouter(this.authService);

  late final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/expert',
    refreshListenable: authService, // Refreshes router on auth state change
    redirect: (context, state) {
      final isLoggedIn = authService.currentUser != null;
      final isGoingToLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !isGoingToLogin) {
        // Redirect to login if unauthenticated and trying to access any route
        return '/login';
      }

      if (isLoggedIn && isGoingToLogin) {
        // Prevent logged-in users from seeing the sign-in screen
        return '/expert';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const SignInScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _expertNavigatorKey,
            routes: [
              GoRoute(
                path: '/expert',
                builder: (context, state) => const ExpertScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _labNavigatorKey,
            routes: [
              GoRoute(
                path: '/lab',
                builder: (context, state) => const LabScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

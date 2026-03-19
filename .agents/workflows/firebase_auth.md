---
description: Implement Firebase Authentication (Email + Password) in Flutter
---

# Firebase Authentication (Email & Password) Workflow

Follow these steps to integrate Email & Password authentication into the Oinos Sommelier Flutter application.

1. **Enable Authentication in Firebase Console**
   - Go to your Firebase Console (Project: oinos-33896).
   - Navigate to **Authentication** -> **Sign-in method**.
   - Enable **Email/Password** provider.

2. **Add Flutter Dependencies**
// turbo
```bash
flutter pub add firebase_auth
```

3. **Create Auth Service (`lib/features/auth/auth_service.dart`)**
   Create a service to encapsulate all Firebase Auth logic (Sign-In, Sign-Up, Sign-Out, and Auth State changes).
// turbo
```bash
mkdir -p lib/features/auth
New-Item -Path "lib/features/auth/auth_service.dart" -ItemType File -Force
```
   *Action:* Implement `AuthService` class utilizing `FirebaseAuth.instance`.

4. **Create Auth UI Screens**
   - `sign_in_screen.dart`: UI for logging in with Email & Password.
   - `sign_up_screen.dart`: UI for registering new users.
// turbo
```bash
New-Item -Path "lib/features/auth/sign_in_screen.dart" -ItemType File -Force
New-Item -Path "lib/features/auth/sign_up_screen.dart" -ItemType File -Force
```
   *Action:* Implement the Flutter UI matching the overall dark purple & light gray theme of the Oinos app.

5. **Protect Routes / conditional Navigation**
   Update `lib/main.dart` or your main navigation system to conditionally show the `ExpertScreen` vs `SignInScreen` based on `FirebaseAuth.instance.authStateChanges()`. For instance, the general `Sommelier` tab could be public, while the `Admin Lab` tab prompts for authentication.

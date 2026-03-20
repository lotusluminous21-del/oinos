import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _isGoogleInitialized = false;

  AuthService() {
    _auth.userChanges().listen((_) {
      notifyListeners();
    });
  }

  // Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Sign In
  Future<void> signInWithEmailPassword(String email, String password) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      // notifyListeners() is handled by userChanges() stream
    } catch (e) {
      debugPrint("Sign-In Error: $e");
      rethrow;
    }
  }

  // Register
  Future<void> registerWithEmailPassword(String email, String password) async {
    try {
      await _auth.createUserWithEmailAndPassword(email: email, password: password);
      // notifyListeners() is handled by userChanges() stream
    } catch (e) {
      debugPrint("Registration Error: $e");
      rethrow;
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    try {
      if (kIsWeb) {
        // Web flow
        GoogleAuthProvider authProvider = GoogleAuthProvider();
        await _auth.signInWithPopup(authProvider);
      } else {
        // Native (Android/iOS) flow using google_sign_in v7 API
        if (!_isGoogleInitialized) {
          try {
            await GoogleSignIn.instance.initialize();
            _isGoogleInitialized = true;
          } catch (e) {
            debugPrint("GoogleSignIn init error (safe to ignore if already init): $e");
          }
        }
        
        late final GoogleSignInAccount account;
        try {
          account = await GoogleSignIn.instance.authenticate();
        } on GoogleSignInException catch (e) {
          if (e.code == GoogleSignInExceptionCode.canceled) return;
          rethrow;
        }

        // Get id token
        final idToken = account.authentication.idToken;

        // Get access token via authorization client
        final authClient = account.authorizationClient;
        var authz = await authClient.authorizationForScopes([]);
        authz ??= await authClient.authorizeScopes([]);
        
        final AuthCredential credential = GoogleAuthProvider.credential(
          accessToken: authz.accessToken,
          idToken: idToken,
        );
        
        await _auth.signInWithCredential(credential);
      }
    } catch (e) {
      debugPrint("Google Sign-In Error: $e");
      rethrow;
    }
  }

  // Sign Out
  Future<void> signOut() async {
    try {
      if (!kIsWeb && _isGoogleInitialized) {
        await GoogleSignIn.instance.signOut();
      }
      await _auth.signOut();
      notifyListeners();
    } catch (e) {
      debugPrint("Sign-Out Error: $e");
      rethrow;
    }
  }
}

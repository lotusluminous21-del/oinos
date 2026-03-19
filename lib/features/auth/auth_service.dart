import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;

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

  // Sign Out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
      notifyListeners();
    } catch (e) {
      debugPrint("Sign-Out Error: $e");
      rethrow;
    }
  }
}

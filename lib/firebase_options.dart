import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDh2dFTOCdKVEDMhwk7vMPMpA49Q5J2dno',
    appId: '1:693657367669:web:472c2929ee29b3a814f43c',
    messagingSenderId: '693657367669',
    projectId: 'oinos-33896',
    authDomain: 'oinos-33896.firebaseapp.com',
    storageBucket: 'oinos-33896.firebasestorage.app',
    measurementId: 'G-XFGP5ELBB1',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyACw0_Z0qf-eJ2Yym_VYZ408WckJvdBqM0',
    appId: '1:693657367669:android:0c57fb032259d7de14f43c',
    messagingSenderId: '693657367669',
    projectId: 'oinos-33896',
    storageBucket: 'oinos-33896.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAXFfn2lala9y0Ts1Yc00AXorukkQ45-sA',
    appId: '1:693657367669:ios:5042ad3e89926e4d14f43c',
    messagingSenderId: '693657367669',
    projectId: 'oinos-33896',
    storageBucket: 'oinos-33896.firebasestorage.app',
    iosBundleId: 'com.example.oinos',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'STUB_API_KEY',
    appId: 'STUB_APP_ID',
    messagingSenderId: 'STUB_SENDER_ID',
    projectId: 'oinos-33896',
    storageBucket: 'oinos-33896.appspot.com',
    iosBundleId: 'com.example.oinos',
  );
}
import 'package:flutter/foundation.dart';

enum LogLevel { info, error, system }

class LogEntry {
  final String id;
  final DateTime timestamp;
  final LogLevel level;
  final String message;
  final dynamic error;
  final StackTrace? stackTrace;

  LogEntry({
    required this.id,
    required this.timestamp,
    required this.level,
    required this.message,
    this.error,
    this.stackTrace,
  });
}

class DevConsoleService extends ChangeNotifier {
  static final DevConsoleService instance = DevConsoleService._internal();

  DevConsoleService._internal();

  final List<LogEntry> _logs = [];

  List<LogEntry> get logs => List.unmodifiable(_logs);

  void logInfo(String message) {
    _addLog(LogLevel.info, message);
    if (kDebugMode) {
      print('[INFO]: $message');
    }
  }

  void logError(String message, [dynamic error, StackTrace? stackTrace]) {
    _addLog(LogLevel.error, message, error, stackTrace);
    if (kDebugMode) {
      print('[ERROR]: $message\nDetails: $error\nStack trace: $stackTrace');
    }
  }

  void logSystem(String message) {
    _addLog(LogLevel.system, message);
    if (kDebugMode) {
      print('[SYSTEM]: $message');
    }
  }

  void _addLog(LogLevel level, String message, [dynamic error, StackTrace? stackTrace]) {
    final entry = LogEntry(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      timestamp: DateTime.now(),
      level: level,
      message: message,
      error: error,
      stackTrace: stackTrace,
    );
    _logs.insert(0, entry); // Insert at beginning for newest first
    notifyListeners();
  }

  void clearLogs() {
    _logs.clear();
    notifyListeners();
  }
}

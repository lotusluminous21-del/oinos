import 'package:flutter/foundation.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'quiz_state.dart';
import '../../core/services/dev_console_service.dart';

/// State management for the Quiz-Based Expert System (v2).
/// Manages the dynamic quiz flow: init → question → question → ... → result.
class QuizProvider extends ChangeNotifier {
  // ── Dependencies ──────────────────────────────────────────────────
  final FirebaseFunctions _functions =
      FirebaseFunctions.instanceFor(region: 'europe-west1');
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // ── State ─────────────────────────────────────────────────────────
  QuizPhase _phase = QuizPhase.welcome;
  String _sessionId = '';
  String _storeId = 'default';
  QuizQuestion? _currentQuestion;
  final List<QuizAnswer> _answers = [];
  final List<QuizQuestion> _questionHistory = [];
  QuizResult? _result;
  String _errorMessage = '';
  int _answerCount = 0;

  // ── Getters ───────────────────────────────────────────────────────
  QuizPhase get phase => _phase;
  String get sessionId => _sessionId;
  String get storeId => _storeId;
  QuizQuestion? get currentQuestion => _currentQuestion;
  List<QuizAnswer> get answers => List.unmodifiable(_answers);
  List<QuizQuestion> get questionHistory => List.unmodifiable(_questionHistory);
  QuizResult? get result => _result;
  String get errorMessage => _errorMessage;
  int get answerCount => _answerCount;
  bool get isLoading =>
      _phase == QuizPhase.loading || _phase == QuizPhase.submitting;

  /// Set the store ID before starting the quiz.
  void setStoreId(String id) {
    _storeId = id;
  }

  // ── Initialize Quiz ───────────────────────────────────────────────

  Future<void> startQuiz() async {
    final user = _auth.currentUser;
    if (user == null) return;

    _phase = QuizPhase.loading;
    _answers.clear();
    _questionHistory.clear();
    _result = null;
    _errorMessage = '';
    _answerCount = 0;
    notifyListeners();

    try {
      final fn = _functions.httpsCallable('quiz_init');
      final result = await fn.call({
        'storeId': _storeId,
      });

      final data = Map<String, dynamic>.from(result.data);

      if (data['status'] == 'error') {
        _phase = QuizPhase.error;
        _errorMessage = data['message'] ?? 'Άγνωστο σφάλμα';
        notifyListeners();
        return;
      }

      _sessionId = data['sessionId'] ?? '';
      _currentQuestion = QuizQuestion.fromMap(
          Map<String, dynamic>.from(data['question']));
      _questionHistory.add(_currentQuestion!);
      _phase = QuizPhase.questioning;
      notifyListeners();
    } catch (e) {
      DevConsoleService.instance
          .logError('Quiz init failed', e, StackTrace.current);
      _phase = QuizPhase.error;
      _errorMessage = 'Αποτυχία σύνδεσης. Δοκιμάστε ξανά.';
      notifyListeners();
    }
  }

  // ── Submit Answer ─────────────────────────────────────────────────

  Future<void> submitAnswer(QuizOption selectedOption) async {
    final user = _auth.currentUser;
    if (user == null || _currentQuestion == null) return;

    final answer = QuizAnswer(
      questionId: _currentQuestion!.id,
      optionId: selectedOption.id,
      label: selectedOption.label,
      dimension: _currentQuestion!.dimension,
    );

    _answers.add(answer);
    _phase = QuizPhase.submitting;
    notifyListeners();

    try {
      final fn = _functions.httpsCallable('quiz_next');
      final result = await fn.call({
        'sessionId': _sessionId,
        'answer': answer.toMap(),
      });

      final data = Map<String, dynamic>.from(result.data);

      if (data['status'] == 'error') {
        _phase = QuizPhase.error;
        _errorMessage = data['message'] ?? 'Άγνωστο σφάλμα';
        notifyListeners();
        return;
      }

      if (data['type'] == 'result') {
        // Final recommendation
        _result = QuizResult.fromMap(data);
        _phase = QuizPhase.result;
        notifyListeners();
        return;
      }

      // Next question
      _answerCount = data['answerCount'] ?? _answers.length;
      _currentQuestion = QuizQuestion.fromMap(
          Map<String, dynamic>.from(data['question']));
      _questionHistory.add(_currentQuestion!);
      _phase = QuizPhase.questioning;
      notifyListeners();
    } catch (e) {
      DevConsoleService.instance
          .logError('Quiz next failed', e, StackTrace.current);
      _phase = QuizPhase.error;
      _errorMessage = 'Αποτυχία σύνδεσης. Δοκιμάστε ξανά.';
      notifyListeners();
    }
  }

  // ── Go Back ───────────────────────────────────────────────────────

  void goBack() {
    if (_answers.isEmpty || _questionHistory.length < 2) return;

    _answers.removeLast();
    _questionHistory.removeLast();
    _currentQuestion = _questionHistory.last;
    _answerCount = _answers.length;
    _phase = QuizPhase.questioning;
    notifyListeners();
  }

  bool get canGoBack => _answers.isNotEmpty && _phase == QuizPhase.questioning;

  // ── Reset ─────────────────────────────────────────────────────────

  void resetQuiz() {
    _phase = QuizPhase.welcome;
    _sessionId = '';
    _currentQuestion = null;
    _answers.clear();
    _questionHistory.clear();
    _result = null;
    _errorMessage = '';
    _answerCount = 0;
    notifyListeners();
  }
}

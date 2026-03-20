import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:uuid/uuid.dart';
import 'expert_state.dart';
import '../../core/services/dev_console_service.dart';

/// State management for the Expert Sommelier pipeline.
/// Mirrors the reference Zustand store with real-time Firestore syncing.
class ExpertProvider extends ChangeNotifier {
  // ── Dependencies ──────────────────────────────────────────────────
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFunctions _functions =
      FirebaseFunctions.instanceFor(region: 'europe-west1');
  final Uuid _uuid = const Uuid();

  // ── State ─────────────────────────────────────────────────────────
  String _sessionId;
  List<ChatMessage> _messages = [];
  bool _isTyping = false;
  String _agentStatus = '';
  PipelineStage _pipelineStage = PipelineStage.none;
  SidebarState? _sidebarState;
  bool _isSyncing = false;

  // ── Reveal tracking (word-by-word animation) ──────────────────────
  final Set<String> _revealedMessageIds = {};
  bool _hydrationSeeded = false;

  // ── Firestore listener ────────────────────────────────────────────
  StreamSubscription<DocumentSnapshot>? _snapshotSub;

  // ── Getters ───────────────────────────────────────────────────────
  String get sessionId => _sessionId;
  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isTyping => _isTyping;
  String get agentStatus => _agentStatus;
  PipelineStage get pipelineStage => _pipelineStage;
  SidebarState? get sidebarState => _sidebarState;
  bool get hasMessages => _messages.isNotEmpty;
  bool get isGenerating => _pipelineStage.isGenerating;
  Set<String> get revealedMessageIds => _revealedMessageIds;

  bool get showSolutionCTA =>
      (_sidebarState?.showSolutionButton ?? false) && !isGenerating;

  ExpertProvider() : _sessionId = const Uuid().v4() {
    _initAuthListener();
  }

  // ── Auth listener — re-sync when user logs in ────────────────────
  StreamSubscription<User?>? _authSub;

  void _initAuthListener() {
    _authSub = _auth.authStateChanges().listen((user) {
      if (user != null) {
        _syncWithFirestore();
        initSessionListener();
      } else {
        _snapshotSub?.cancel();
        _snapshotSub = null;
      }
    });
  }

  // ── Session Listener (real-time Firestore) ────────────────────────

  void initSessionListener() {
    _snapshotSub?.cancel();
    final user = _auth.currentUser;
    if (user == null) return;

    final sessionRef = _db
        .collection('users')
        .doc(user.uid)
        .collection('expert_sessions')
        .doc(_sessionId);

    _snapshotSub = sessionRef.snapshots().listen((docSnap) {
      if (!docSnap.exists) return;
      final data = docSnap.data()!;

      // 1. Typing / agent status
      if (data.containsKey('agentStatus')) {
        _isTyping = true;
        _agentStatus = data['agentStatus'] as String;
      } else {
        _agentStatus = '';
      }

      // 2. Messages merge — only if Firestore has more
      if (data['messages'] is List) {
        final remoteMsgs = (data['messages'] as List)
            .map((m) => ChatMessage.fromMap(Map<String, dynamic>.from(m)))
            .toList();
        if (remoteMsgs.length > _messages.length) {
          _messages = remoteMsgs;
        }
      }

      // 3. Pipeline stage
      if (data['pipelineStage'] != null) {
        _pipelineStage =
            PipelineStage.fromString(data['pipelineStage'] as String?);
      }

      // 4. Sidebar state
      if (data['sidebarState'] is Map) {
        _sidebarState = SidebarState.fromMap(
            Map<String, dynamic>.from(data['sidebarState']));
      }

      notifyListeners();
    }, onError: (e) {
      DevConsoleService.instance
          .logError('Expert session listener error', e, StackTrace.current);
    });
  }

  // ── Send Message ──────────────────────────────────────────────────

  Future<void> sendMessage(String content) async {
    final user = _auth.currentUser;
    if (user == null || content.trim().isEmpty) return;

    final msg = ChatMessage(
      id: _uuid.v4(),
      role: MessageRole.user,
      content: content.trim(),
      timestamp: DateTime.now(),
    );

    _messages = [..._messages, msg];
    _isTyping = true;
    _agentStatus = 'Προετοιμασία...';
    notifyListeners();

    await _syncWithFirestore();

    try {
      final fn = _functions.httpsCallable('chat_sommelier');
      await fn.call({
        'sessionId': _sessionId,
        'message': content.trim(),
        'messageId': msg.id,
      });
    } catch (e) {
      DevConsoleService.instance
          .logError('Failed to send text to sommelier', e, StackTrace.current);
    } finally {
      _isTyping = false;
      _agentStatus = '';
      notifyListeners();
    }
  }

  // ── Generate Solution (callable function) ─────────────────────────

  Future<void> generateSolution() async {
    final user = _auth.currentUser;
    if (user == null) return;

    _isTyping = true;
    _agentStatus = 'Δημιουργία πρότασης...';
    notifyListeners();

    try {
      final fn = _functions.httpsCallable('generate_expert_solution');
      await fn.call({'sessionId': _sessionId, 'userId': user.uid});
    } catch (e) {
      DevConsoleService.instance
          .logError('Failed to generate solution', e, StackTrace.current);
    } finally {
      _isTyping = false;
      _agentStatus = '';
      notifyListeners();
    }
  }

  // ── Reset Session ─────────────────────────────────────────────────

  void resetSession() {
    _snapshotSub?.cancel();
    _snapshotSub = null;

    _sessionId = _uuid.v4();
    _messages = [];
    _isTyping = false;
    _agentStatus = '';
    _pipelineStage = PipelineStage.none;
    _sidebarState = null;
    _revealedMessageIds.clear();
    _hydrationSeeded = false;
    notifyListeners();

    // Re-attach listener for the new session
    Future.microtask(() => initSessionListener());
  }

  // ── Reveal tracking helpers ───────────────────────────────────────

  void seedRevealedMessages() {
    if (_hydrationSeeded) return;
    _hydrationSeeded = true;
    for (final m in _messages) {
      _revealedMessageIds.add(m.id);
    }
  }

  void markRevealed(String messageId) {
    _revealedMessageIds.add(messageId);
  }

  bool isRevealed(String messageId) => _revealedMessageIds.contains(messageId);

  // ── Sync to Firestore ─────────────────────────────────────────────

  Future<void> _syncWithFirestore() async {
    if (_isSyncing) return;
    final user = _auth.currentUser;
    if (user == null) return;

    try {
      _isSyncing = true;
      final sessionRef = _db
          .collection('users')
          .doc(user.uid)
          .collection('expert_sessions')
          .doc(_sessionId);

      await sessionRef.set({
        'sessionId': _sessionId,
        'messages': _messages.map((m) => m.toMap()).toList(),
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (e) {
      DevConsoleService.instance
          .logError('Failed to sync expert store', e, StackTrace.current);
    } finally {
      _isSyncing = false;
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────

  @override
  void dispose() {
    _snapshotSub?.cancel();
    _authSub?.cancel();
    super.dispose();
  }
}

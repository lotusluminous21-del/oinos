/// Data models for the Expert Sommelier pipeline.
/// Mirrors the reference app's types.ts, adapted for the wine domain.
library expert_state;


// ─── Pipeline Stage ─────────────────────────────────────────────────

enum PipelineStage {
  none,
  planning,
  retrieving,
  synthesizing,
  complete,
  error;

  static PipelineStage fromString(String? s) {
    switch (s) {
      case 'planning':
        return PipelineStage.planning;
      case 'retrieving':
        return PipelineStage.retrieving;
      case 'synthesizing':
        return PipelineStage.synthesizing;
      case 'complete':
        return PipelineStage.complete;
      case 'error':
        return PipelineStage.error;
      default:
        return PipelineStage.none;
    }
  }

  bool get isGenerating =>
      this == PipelineStage.planning ||
      this == PipelineStage.retrieving ||
      this == PipelineStage.synthesizing;
}

// ─── Chat Message ───────────────────────────────────────────────────

enum MessageRole { user, assistant }

class RecommendedWine {
  final String sku;
  final String name;
  final double price;
  final String whyItFits;

  const RecommendedWine({
    required this.sku,
    required this.name,
    required this.price,
    required this.whyItFits,
  });

  factory RecommendedWine.fromMap(Map<String, dynamic> map) {
    return RecommendedWine(
      sku: map['sku']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      price: (map['price'] ?? 0.0).toDouble(),
      whyItFits: map['why_it_fits']?.toString() ?? map['whyItFits']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'sku': sku,
        'name': name,
        'price': price,
        'why_it_fits': whyItFits,
      };
}

class ChatMessage {
  final String id;
  final MessageRole role;
  final String content;
  final DateTime timestamp;
  final List<RecommendedWine>? wines;

  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.wines,
  });

  bool get isUser => role == MessageRole.user;

  factory ChatMessage.fromMap(Map<String, dynamic> map) {
    return ChatMessage(
      id: map['id'] ?? '',
      role: map['role'] == 'user' ? MessageRole.user : MessageRole.assistant,
      content: map['content'] ?? '',
      timestamp: map['timestamp'] is int
          ? DateTime.fromMillisecondsSinceEpoch(map['timestamp'])
          : DateTime.tryParse(map['timestamp']?.toString() ?? '') ??
              DateTime.now(),
      wines: map['wines'] != null
          ? (map['wines'] as List)
              .map((w) => RecommendedWine.fromMap(Map<String, dynamic>.from(w)))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'role': role == MessageRole.user ? 'user' : 'assistant',
        'content': content,
        'timestamp': timestamp.toIso8601String(),
        if (wines != null) 'wines': wines!.map((w) => w.toMap()).toList(),
      };
}

// ─── Interview Dimension ────────────────────────────────────────────

enum DimensionStatus {
  identified,
  pending,
  unknown;

  static DimensionStatus fromString(String? s) {
    switch (s) {
      case 'identified':
        return DimensionStatus.identified;
      case 'pending':
        return DimensionStatus.pending;
      default:
        return DimensionStatus.unknown;
    }
  }
}

class InterviewDimension {
  final DimensionStatus status;
  final String? value;

  const InterviewDimension({required this.status, this.value});

  factory InterviewDimension.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const InterviewDimension(status: DimensionStatus.unknown);
    }
    return InterviewDimension(
      status: DimensionStatus.fromString(map['status']),
      value: map['value'],
    );
  }
}

// ─── Interview Progress (5 wine-domain axes) ────────────────────────

class InterviewProgress {
  final InterviewDimension what; // Τι ψάχνει (grape / style)
  final InterviewDimension why; // Γιατί / Περίσταση
  final InterviewDimension how; // Γεύση / Προτιμήσεις
  final InterviewDimension where; // Food Pairing
  final InterviewDimension result; // Budget / Αποτέλεσμα

  const InterviewProgress({
    required this.what,
    required this.why,
    required this.how,
    required this.where,
    required this.result,
  });

  factory InterviewProgress.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return InterviewProgress(
        what: const InterviewDimension(status: DimensionStatus.unknown),
        why: const InterviewDimension(status: DimensionStatus.unknown),
        how: const InterviewDimension(status: DimensionStatus.unknown),
        where: const InterviewDimension(status: DimensionStatus.unknown),
        result: const InterviewDimension(status: DimensionStatus.unknown),
      );
    }
    return InterviewProgress(
      what: InterviewDimension.fromMap(map['what']),
      why: InterviewDimension.fromMap(map['why']),
      how: InterviewDimension.fromMap(map['how']),
      where: InterviewDimension.fromMap(map['where']),
      result: InterviewDimension.fromMap(map['result']),
    );
  }

  Map<String, InterviewDimension> get dimensions => {
        'what': what,
        'why': why,
        'how': how,
        'where': where,
        'result': result,
      };
}

// ─── Knowledge Dimension (extras beyond the 5 core) ─────────────────

class KnowledgeDimension {
  final String id;
  final String label;
  final DimensionStatus status;
  final String? value;

  const KnowledgeDimension({
    required this.id,
    required this.label,
    required this.status,
    this.value,
  });

  factory KnowledgeDimension.fromMap(Map<String, dynamic> map) {
    return KnowledgeDimension(
      id: map['id'] ?? '',
      label: map['label'] ?? '',
      status: DimensionStatus.fromString(map['status']),
      value: map['value'],
    );
  }
}

// ─── Log Entry ──────────────────────────────────────────────────────

class LogEntry {
  final String type;
  final String message;

  const LogEntry({required this.type, required this.message});

  factory LogEntry.fromMap(Map<String, dynamic> map) {
    return LogEntry(
      type: map['type'] ?? 'info',
      message: map['message'] ?? '',
    );
  }
}

// ─── Sidebar State ──────────────────────────────────────────────────

class SidebarState {
  final String overallPhase;
  final String overallPhaseLabel;
  final String? domain;
  final bool showSolutionButton;
  final double briefReadiness;
  final InterviewProgress? interviewProgress;
  final List<KnowledgeDimension> knowledgeDimensions;
  final List<LogEntry> logs;

  const SidebarState({
    required this.overallPhase,
    required this.overallPhaseLabel,
    this.domain,
    this.showSolutionButton = false,
    this.briefReadiness = 0.0,
    this.interviewProgress,
    this.knowledgeDimensions = const [],
    this.logs = const [],
  });

  factory SidebarState.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SidebarState(
        overallPhase: 'interviewing',
        overallPhaseLabel: 'Συνέντευξη',
      );
    }
    return SidebarState(
      overallPhase: map['overallPhase'] ?? 'interviewing',
      overallPhaseLabel: map['overallPhaseLabel'] ?? 'Συνέντευξη',
      domain: map['domain'],
      showSolutionButton: map['showSolutionButton'] ?? false,
      briefReadiness: (map['briefReadiness'] ?? 0.0).toDouble(),
      interviewProgress: map['interviewProgress'] != null
          ? InterviewProgress.fromMap(
              Map<String, dynamic>.from(map['interviewProgress']))
          : null,
      knowledgeDimensions: (map['knowledgeDimensions'] as List<dynamic>?)
              ?.map((d) =>
                  KnowledgeDimension.fromMap(Map<String, dynamic>.from(d)))
              .toList() ??
          [],
      logs: (map['logs'] as List<dynamic>?)
              ?.map((l) => LogEntry.fromMap(Map<String, dynamic>.from(l)))
              .toList() ??
          [],
    );
  }
}

// ─── UI Constants ───────────────────────────────────────────────────

/// Greek labels for each overall phase
const Map<String, String> overallPhaseLabels = {
  'interviewing': 'Συνέντευξη',
  'ready_for_plan': 'Έτοιμο για Πρόταση',
  'planning': 'Δημιουργία Πλάνου',
  'retrieving': 'Αναζήτηση Κρασιών',
  'synthesizing': 'Ανάλυση Sommelier',
  'complete': 'Ολοκλήρωση',
};

/// Greek labels for the 5 interview dimensions (wine domain)
const Map<String, String> interviewDimensionLabels = {
  'what': 'Τι ψάχνετε',
  'why': 'Περίσταση',
  'how': 'Γευστικές Προτιμήσεις',
  'where': 'Συνοδευτικό Φαγητό',
  'result': 'Budget / Αποτέλεσμα',
};

/// Pipeline stage labels shown during generation
const Map<PipelineStage, String> pipelineStageLabels = {
  PipelineStage.planning: 'Δημιουργία πλάνου αναζήτησης...',
  PipelineStage.retrieving: 'Αναζήτηση κατάλληλων κρασιών...',
  PipelineStage.synthesizing: 'Ο Sommelier αξιολογεί συμβατότητα...',
};

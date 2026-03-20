/// Data models for the Quiz-Based Expert System (v2).
/// Supports dynamic, LLM-driven quiz flow with MCDA scoring.
library quiz_state;

// ─── Quiz Option ────────────────────────────────────────────────────

class QuizOption {
  final String id;
  final String label;
  final String emoji;
  final String description;

  const QuizOption({
    required this.id,
    required this.label,
    this.emoji = '',
    this.description = '',
  });

  factory QuizOption.fromMap(Map<String, dynamic> map) {
    return QuizOption(
      id: map['id']?.toString() ?? '',
      label: map['label']?.toString() ?? '',
      emoji: map['emoji']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'label': label,
        'emoji': emoji,
        'description': description,
      };
}

// ─── Quiz Question ──────────────────────────────────────────────────

class QuizQuestion {
  final String id;
  final String title;
  final String subtitle;
  final String dimension;
  final List<QuizOption> options;

  const QuizQuestion({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.dimension = '',
    required this.options,
  });

  factory QuizQuestion.fromMap(Map<String, dynamic> map) {
    return QuizQuestion(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      subtitle: map['subtitle']?.toString() ?? '',
      dimension: map['dimension']?.toString() ?? '',
      options: (map['options'] as List<dynamic>?)
              ?.map((o) => QuizOption.fromMap(Map<String, dynamic>.from(o)))
              .toList() ??
          [],
    );
  }
}

// ─── Quiz Answer ────────────────────────────────────────────────────

class QuizAnswer {
  final String questionId;
  final String optionId;
  final String label;
  final String dimension;

  const QuizAnswer({
    required this.questionId,
    required this.optionId,
    required this.label,
    required this.dimension,
  });

  Map<String, dynamic> toMap() => {
        'questionId': questionId,
        'option_id': optionId,
        'label': label,
        'dimension': dimension,
      };
}

// ─── Recommended Wine (reused from expert_state) ────────────────────

class QuizRecommendedWine {
  final String sku;
  final String name;
  final double price;
  final String whyItFits;

  const QuizRecommendedWine({
    required this.sku,
    required this.name,
    required this.price,
    required this.whyItFits,
  });

  factory QuizRecommendedWine.fromMap(Map<String, dynamic> map) {
    return QuizRecommendedWine(
      sku: map['sku']?.toString() ?? '',
      name: map['name']?.toString() ?? '',
      price: (map['price'] ?? 0.0).toDouble(),
      whyItFits:
          map['why_it_fits']?.toString() ?? map['whyItFits']?.toString() ?? '',
    );
  }
}

// ─── Quiz Result ────────────────────────────────────────────────────

class QuizResult {
  final String prose;
  final List<QuizRecommendedWine> wines;

  const QuizResult({
    required this.prose,
    required this.wines,
  });

  factory QuizResult.fromMap(Map<String, dynamic> map) {
    return QuizResult(
      prose: map['prose']?.toString() ?? '',
      wines: (map['wines'] as List<dynamic>?)
              ?.map((w) =>
                  QuizRecommendedWine.fromMap(Map<String, dynamic>.from(w)))
              .toList() ??
          [],
    );
  }
}

// ─── Quiz Phase ─────────────────────────────────────────────────────

enum QuizPhase {
  welcome,
  loading,
  questioning,
  submitting,
  result,
  error,
}

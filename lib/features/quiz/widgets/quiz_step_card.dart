import 'package:flutter/material.dart';
import '../quiz_state.dart';

/// A large, tap-friendly card for a single quiz option.
/// Designed for zero-typing interaction.
class QuizOptionCard extends StatefulWidget {
  final QuizOption option;
  final bool isSelected;
  final VoidCallback onTap;

  const QuizOptionCard({
    super.key,
    required this.option,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<QuizOptionCard> createState() => _QuizOptionCardState();
}

class _QuizOptionCardState extends State<QuizOptionCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
      lowerBound: 0.95,
      upperBound: 1.0,
      value: 1.0,
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isSelected = widget.isSelected;

    return GestureDetector(
      onTapDown: (_) => _scaleController.reverse(),
      onTapUp: (_) {
        _scaleController.forward();
        widget.onTap();
      },
      onTapCancel: () => _scaleController.forward(),
      child: ScaleTransition(
        scale: _scaleController,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.tertiary.withOpacity(0.08)
                : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected
                  ? theme.colorScheme.tertiary
                  : theme.colorScheme.outline.withOpacity(0.4),
              width: isSelected ? 2.0 : 1.0,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: theme.colorScheme.tertiary.withOpacity(0.15),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ],
          ),
          child: Row(
            children: [
              // Emoji / Icon
              if (widget.option.emoji.isNotEmpty)
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? theme.colorScheme.tertiary.withOpacity(0.12)
                        : theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      widget.option.emoji,
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                ),
              if (widget.option.emoji.isNotEmpty) const SizedBox(width: 16),

              // Label + Description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.option.label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight:
                            isSelected ? FontWeight.w700 : FontWeight.w600,
                        color: isSelected
                            ? theme.colorScheme.tertiary
                            : theme.colorScheme.onSurface,
                      ),
                    ),
                    if (widget.option.description.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        widget.option.description,
                        style: TextStyle(
                          fontSize: 13,
                          color: theme.colorScheme.onSurface.withOpacity(0.5),
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),

              // Checkmark
              AnimatedOpacity(
                opacity: isSelected ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 200),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check, color: Colors.white, size: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Displays a quiz question with its tappable option cards.
class QuizStepCard extends StatelessWidget {
  final QuizQuestion question;
  final String? selectedOptionId;
  final ValueChanged<QuizOption> onOptionSelected;

  const QuizStepCard({
    super.key,
    required this.question,
    this.selectedOptionId,
    required this.onOptionSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),

          // Question title
          Text(
            question.title,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
              letterSpacing: -0.3,
              height: 1.3,
            ),
          ),

          // Subtitle
          if (question.subtitle.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              question.subtitle,
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
                height: 1.4,
              ),
            ),
          ],

          const SizedBox(height: 28),

          // Options list
          ...question.options.map((option) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: QuizOptionCard(
                  option: option,
                  isSelected: option.id == selectedOptionId,
                  onTap: () => onOptionSelected(option),
                ),
              )),
        ],
      ),
    );
  }
}

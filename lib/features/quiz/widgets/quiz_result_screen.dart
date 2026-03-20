import 'package:flutter/material.dart';
import '../quiz_state.dart';

/// Displays the final wine recommendations from the quiz.
/// Shows a prose recommendation and individual wine cards with staggered animation.
class QuizResultScreen extends StatefulWidget {
  final QuizResult result;
  final VoidCallback onRestart;

  const QuizResultScreen({
    super.key,
    required this.result,
    required this.onRestart,
  });

  @override
  State<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends State<QuizResultScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _staggerController;

  @override
  void initState() {
    super.initState();
    _staggerController = AnimationController(
      vsync: this,
      duration: Duration(
          milliseconds: 400 + (widget.result.wines.length * 200)),
    )..forward();
  }

  @override
  void dispose() {
    _staggerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final wines = widget.result.wines;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Success Header ──────────────────────────────────
          _buildAnimatedChild(0, child: Center(
            child: Column(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.wine_bar_rounded,
                    color: theme.colorScheme.tertiary,
                    size: 30,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Η Πρότασή μας',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          )),

          const SizedBox(height: 24),

          // ── Prose Recommendation ────────────────────────────
          _buildAnimatedChild(1, child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.colorScheme.tertiary.withOpacity(0.04),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.colorScheme.tertiary.withOpacity(0.15),
              ),
            ),
            child: Text(
              widget.result.prose,
              style: TextStyle(
                fontSize: 15,
                color: theme.colorScheme.onSurface.withOpacity(0.8),
                height: 1.6,
              ),
            ),
          )),

          const SizedBox(height: 28),

          // ── Wine Cards ──────────────────────────────────────
          if (wines.isNotEmpty) ...[
            Text(
              'Προτεινόμενα Κρασιά',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 14),
            ...wines.asMap().entries.map((entry) {
              final index = entry.key;
              final wine = entry.value;
              return _buildAnimatedChild(
                index + 2,
                child: _WineCard(wine: wine, rank: index + 1),
              );
            }),
          ],

          const SizedBox(height: 32),

          // ── Restart Button ──────────────────────────────────
          _buildAnimatedChild(
            wines.length + 2,
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: widget.onRestart,
                icon: const Icon(Icons.refresh_rounded, size: 20),
                label: const Text(
                  'Ξεκινήστε Ξανά',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: theme.colorScheme.tertiary,
                  side: BorderSide(
                    color: theme.colorScheme.tertiary.withOpacity(0.3),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildAnimatedChild(int index, {required Widget child}) {
    final totalItems = widget.result.wines.length + 3;
    final begin = (index / totalItems).clamp(0.0, 0.8);
    final end = ((index + 1) / totalItems).clamp(begin + 0.1, 1.0);

    final animation = CurvedAnimation(
      parent: _staggerController,
      curve: Interval(begin, end, curve: Curves.easeOutCubic),
    );

    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.15),
          end: Offset.zero,
        ).animate(animation),
        child: child,
      ),
    );
  }
}

/// Individual wine recommendation card.
class _WineCard extends StatelessWidget {
  final QuizRecommendedWine wine;
  final int rank;

  const _WineCard({required this.wine, required this.rank});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: rank == 1
              ? theme.colorScheme.tertiary.withOpacity(0.3)
              : theme.colorScheme.outline.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: rank == 1
                ? theme.colorScheme.tertiary.withOpacity(0.08)
                : Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: rank badge + name + price
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Rank badge
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: rank == 1
                      ? theme.colorScheme.tertiary
                      : theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '#$rank',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: rank == 1
                          ? Colors.white
                          : theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Name
              Expanded(
                child: Text(
                  wine.name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),

              // Price
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '€${wine.price.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.tertiary,
                  ),
                ),
              ),
            ],
          ),

          // Why it fits
          if (wine.whyItFits.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              wine.whyItFits,
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

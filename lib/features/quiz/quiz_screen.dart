import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'quiz_provider.dart';
import 'quiz_state.dart';
import 'widgets/quiz_welcome.dart';
import 'widgets/quiz_step_card.dart';
import 'widgets/quiz_result_screen.dart';
import '../../core/widgets/dev_console_overlay.dart';

/// Main Quiz Expert screen.
/// Orchestrates the dynamic quiz flow: welcome → questions → result.
class QuizScreen extends StatelessWidget {
  const QuizScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DevConsoleOverlay(
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Consumer<QuizProvider>(
          builder: (context, provider, _) {
            return Column(
              children: [
                // ── Header ─────────────────────────────────
                _QuizHeader(
                  phase: provider.phase,
                  answerCount: provider.answerCount,
                  canGoBack: provider.canGoBack,
                  onBack: provider.goBack,
                  onReset: provider.resetQuiz,
                ),

                // ── Content ────────────────────────────────
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 350),
                    switchInCurve: Curves.easeOutCubic,
                    switchOutCurve: Curves.easeIn,
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.05, 0),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: _buildContent(context, provider),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, QuizProvider provider) {
    switch (provider.phase) {
      case QuizPhase.welcome:
        return QuizWelcome(
          key: const ValueKey('welcome'),
          onStart: provider.startQuiz,
        );

      case QuizPhase.loading:
      case QuizPhase.submitting:
        return _QuizLoading(
          key: ValueKey('loading_${provider.answerCount}'),
          isSubmitting: provider.phase == QuizPhase.submitting,
        );

      case QuizPhase.questioning:
        if (provider.currentQuestion == null) {
          return const SizedBox.shrink(key: ValueKey('empty'));
        }
        return SingleChildScrollView(
          key: ValueKey('q_${provider.currentQuestion!.id}'),
          child: QuizStepCard(
            question: provider.currentQuestion!,
            onOptionSelected: (option) {
              provider.submitAnswer(option);
            },
          ),
        );

      case QuizPhase.result:
        if (provider.result == null) {
          return const SizedBox.shrink(key: ValueKey('no_result'));
        }
        return QuizResultScreen(
          key: const ValueKey('result'),
          result: provider.result!,
          onRestart: provider.resetQuiz,
        );

      case QuizPhase.error:
        return _QuizError(
          key: const ValueKey('error'),
          message: provider.errorMessage,
          onRetry: provider.startQuiz,
          onReset: provider.resetQuiz,
        );
    }
  }
}

// ─── Header ─────────────────────────────────────────────────────────

class _QuizHeader extends StatelessWidget {
  final QuizPhase phase;
  final int answerCount;
  final bool canGoBack;
  final VoidCallback onBack;
  final VoidCallback onReset;

  const _QuizHeader({
    required this.phase,
    required this.answerCount,
    required this.canGoBack,
    required this.onBack,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isActive = phase == QuizPhase.questioning ||
        phase == QuizPhase.submitting ||
        phase == QuizPhase.loading;

    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 8,
        right: 8,
        bottom: 12,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Back button
          if (canGoBack)
            IconButton(
              onPressed: onBack,
              icon: Icon(Icons.arrow_back_ios_rounded,
                  size: 20, color: theme.colorScheme.onSurface),
              tooltip: 'Πίσω',
            )
          else
            const SizedBox(width: 48),

          // Title
          Expanded(
            child: Column(
              children: [
                Text(
                  'Βοηθός Επιλογής',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                    letterSpacing: -0.3,
                  ),
                ),
                if (isActive && answerCount > 0) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Ερώτηση ${answerCount + 1}',
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.tertiary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Reset button (only when active)
          if (phase != QuizPhase.welcome)
            IconButton(
              onPressed: onReset,
              icon: Icon(Icons.refresh_rounded,
                  size: 22, color: theme.colorScheme.onSurface.withOpacity(0.5)),
              tooltip: 'Ξεκινήστε ξανά',
            )
          else
            const SizedBox(width: 48),
        ],
      ),
    );
  }
}

// ─── Loading State ──────────────────────────────────────────────────

class _QuizLoading extends StatelessWidget {
  final bool isSubmitting;

  const _QuizLoading({super.key, this.isSubmitting = false});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor:
                  AlwaysStoppedAnimation(theme.colorScheme.tertiary),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isSubmitting
                ? 'Ο Sommelier σκέφτεται...'
                : 'Προετοιμασία ερωτήσεων...',
            style: TextStyle(
              fontSize: 15,
              color: theme.colorScheme.onSurface.withOpacity(0.5),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Error State ────────────────────────────────────────────────────

class _QuizError extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  final VoidCallback onReset;

  const _QuizError({
    super.key,
    required this.message,
    required this.onRetry,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded,
                size: 48,
                color: theme.colorScheme.error.withOpacity(0.6)),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                fontSize: 15,
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Δοκιμάστε ξανά'),
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.tertiary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: onReset,
              child: Text(
                'Επιστροφή στην αρχή',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

/// Animated welcome screen for the Quiz Expert.
/// Tap CTA to begin — no typing required.
class QuizWelcome extends StatefulWidget {
  final VoidCallback onStart;

  const QuizWelcome({super.key, required this.onStart});

  @override
  State<QuizWelcome> createState() => _QuizWelcomeState();
}

class _QuizWelcomeState extends State<QuizWelcome>
    with TickerProviderStateMixin {
  late AnimationController _glowController;
  late AnimationController _entranceController;
  late Animation<double> _scaleFade;

  @override
  void initState() {
    super.initState();

    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _scaleFade = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOutCubic,
    );
    _entranceController.forward();
  }

  @override
  void dispose() {
    _glowController.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return FadeTransition(
      opacity: _scaleFade,
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.92, end: 1.0).animate(_scaleFade),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // ── Animated Icon ───────────────────────────────
                Stack(
                  alignment: Alignment.center,
                  children: [
                    AnimatedBuilder(
                      animation: _glowController,
                      builder: (context, child) {
                        return Container(
                          width: 110,
                          height: 110,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: theme.colorScheme.tertiary.withOpacity(
                                0.12 + (_glowController.value * 0.2)),
                            boxShadow: [
                              BoxShadow(
                                color: theme.colorScheme.tertiary
                                    .withOpacity(0.2),
                                blurRadius:
                                    30 * _glowController.value + 10,
                                spreadRadius:
                                    5 * _glowController.value,
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.tertiary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                theme.colorScheme.tertiary.withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.quiz_outlined,
                            color: Colors.white, size: 36),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 36),

                // ── Title ──────────────────────────────────────
                Text(
                  'Βρείτε το Ιδανικό Κρασί',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                    color: theme.colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 14),

                // ── Subtitle ───────────────────────────────────
                Text(
                  'Απαντήστε σε λίγες ερωτήσεις και ο Sommelier μας θα βρει το τέλειο κρασί για εσάς.',
                  style: TextStyle(
                    fontSize: 15,
                    color: theme.colorScheme.onSurface.withOpacity(0.55),
                    height: 1.55,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12),

                Text(
                  'Χωρίς πληκτρολόγηση — απλά πατήστε!',
                  style: TextStyle(
                    fontSize: 13,
                    color: theme.colorScheme.tertiary.withOpacity(0.7),
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 40),

                // ── CTA Button ─────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: widget.onStart,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.tertiary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 4,
                      shadowColor:
                          theme.colorScheme.tertiary.withOpacity(0.3),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.play_arrow_rounded, size: 22),
                        SizedBox(width: 8),
                        Text(
                          'Ξεκινήστε',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

/// Animated welcome screen for the expert sommelier.
/// Port of reference WelcomeScreen.tsx — mobile-only, with animated glow icon.
class WelcomeScreen extends StatefulWidget {
  final bool visible;

  const WelcomeScreen({super.key, required this.visible});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _glowController;
  late AnimationController _entranceController;
  late Animation<double> _scaleFade;

  @override
  void initState() {
    super.initState();

    // Glow pulse loop
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    // Entrance scale + fade
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleFade = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
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
    if (!widget.visible) return const SizedBox.shrink();

    final theme = Theme.of(context);

    return FadeTransition(
      opacity: _scaleFade,
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.95, end: 1.0).animate(_scaleFade),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // ── Animated Glow Icon ─────────────────────────
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Glow behind
                    AnimatedBuilder(
                      animation: _glowController,
                      builder: (context, child) {
                        return Transform.rotate(
                          angle: _glowController.value * 0.2,
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: theme.colorScheme.tertiary.withOpacity(
                                  0.15 + (_glowController.value * 0.25)),
                              boxShadow: [
                                BoxShadow(
                                  color: theme.colorScheme.tertiary
                                      .withOpacity(0.25),
                                  blurRadius:
                                      30 * _glowController.value + 10,
                                  spreadRadius:
                                      5 * _glowController.value,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    // Icon circle
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
                        child: Icon(Icons.auto_awesome,
                            color: Colors.white, size: 36),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // ── Title ──────────────────────────────────────
                Text(
                  'Καλωσήρθατε στον Sommelier',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.5,
                    color: theme.colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12),

                // ── Subtitle ───────────────────────────────────
                Text(
                  'Περιγράψτε τι κρασί ψάχνετε, για ποια περίσταση ή φαγητό, και θα λάβετε εξατομικευμένες προτάσεις.',
                  style: TextStyle(
                    fontSize: 15,
                    color: theme.colorScheme.onSurface.withOpacity(0.55),
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 20),

                // ── Ready badge ────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _PulsingDot(color: Colors.green.shade500),
                    const SizedBox(width: 8),
                    Text(
                      'Έτοιμος για ανάλυση',
                      style: TextStyle(
                        fontSize: 12,
                        color: theme.colorScheme.onSurface.withOpacity(0.45),
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Small pulsing green dot
class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: widget.color.withOpacity(0.6 + _controller.value * 0.4),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.color.withOpacity(0.3 * _controller.value),
                blurRadius: 4 * _controller.value,
                spreadRadius: 1 * _controller.value,
              ),
            ],
          ),
        );
      },
    );
  }
}

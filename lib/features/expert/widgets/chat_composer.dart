import 'dart:ui';
import 'package:flutter/material.dart';

/// Floating glassmorphic chat composer.
/// Port of the reference ChatComposer.tsx — mobile-only version.
class ChatComposer extends StatefulWidget {
  final ValueChanged<String> onSend;
  final bool isLoading;

  const ChatComposer({
    super.key,
    required this.onSend,
    required this.isLoading,
  });

  @override
  State<ChatComposer> createState() => _ChatComposerState();
}

class _ChatComposerState extends State<ChatComposer>
    with SingleTickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  late AnimationController _entranceController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnim = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
    ));
    _entranceController.forward();

    _controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _entranceController.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    final text = _controller.text.trim();
    if (text.isEmpty || widget.isLoading) return;
    widget.onSend(text);
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasContent = _controller.text.trim().isNotEmpty;

    return Positioned(
      bottom: 16,
      left: 12,
      right: 12,
      child: SafeArea(
        child: SlideTransition(
          position: _slideAnim,
          child: FadeTransition(
            opacity: _fadeAnim,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ── Glassmorphic container ──────────────────
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.88),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: hasContent
                              ? theme.colorScheme.tertiary.withOpacity(0.4)
                              : theme.colorScheme.outline.withOpacity(0.5),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                          if (hasContent)
                            BoxShadow(
                              color:
                                  theme.colorScheme.tertiary.withOpacity(0.08),
                              blurRadius: 30,
                              spreadRadius: 2,
                            ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          // Text input
                          Expanded(
                            child: TextField(
                              controller: _controller,
                              maxLines: 4,
                              minLines: 1,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (_) => _handleSubmit(),
                              style: const TextStyle(
                                  fontSize: 14, height: 1.4),
                              decoration: InputDecoration(
                                hintText: 'Περιγράψτε τι κρασί ψάχνετε...',
                                hintStyle: TextStyle(
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.4),
                                  fontSize: 14,
                                ),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 12),
                              ),
                            ),
                          ),

                          // Send button
                          Padding(
                            padding: const EdgeInsets.only(right: 4, bottom: 2),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              decoration: BoxDecoration(
                                color: hasContent && !widget.isLoading
                                    ? theme.colorScheme.tertiary
                                    : theme.colorScheme.tertiary
                                        .withOpacity(0.3),
                                shape: BoxShape.circle,
                                boxShadow: hasContent
                                    ? [
                                        BoxShadow(
                                          color: theme.colorScheme.tertiary
                                              .withOpacity(0.3),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : [],
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.send_rounded,
                                    color: Colors.white, size: 18),
                                tooltip: 'Αποστολή',
                                onPressed:
                                    hasContent && !widget.isLoading
                                        ? _handleSubmit
                                        : null,
                                constraints: const BoxConstraints(
                                    minWidth: 40, minHeight: 40),
                                padding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // ── Disclaimer ─────────────────────────────
                const SizedBox(height: 8),
                Text(
                  'Ο Sommelier AI μπορεί να κάνει λάθη. Ελέγχετε πάντα τις προτάσεις.',
                  style: TextStyle(
                    fontSize: 10,
                    color: theme.colorScheme.onSurface.withOpacity(0.35),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

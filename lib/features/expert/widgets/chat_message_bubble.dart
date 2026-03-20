import 'dart:async';
import 'package:flutter/material.dart';
import '../expert_state.dart';
import '../expert_provider.dart';
import 'package:provider/provider.dart';

/// Word-by-word reveal animation constants (matching reference ChatMessage.tsx)
const int _assistantWordIntervalMs = 50;
const int _userWordIntervalMs = 25;
const Duration _wordTransitionDuration = Duration(milliseconds: 300);
const int _activeWindow = 12;

/// Formats a relative timestamp in Greek
String _formatRelativeTime(DateTime timestamp) {
  final diff = DateTime.now().difference(timestamp);
  if (diff.inMinutes < 1) return 'τώρα';
  if (diff.inMinutes < 60) return 'πριν ${diff.inMinutes} λ.';
  if (diff.inHours < 24) return 'πριν ${diff.inHours} ώρ.';
  return '${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}';
}

class ChatMessageBubble extends StatefulWidget {
  final ChatMessage message;
  final bool isLast;
  final bool isTyping;

  const ChatMessageBubble({
    super.key,
    required this.message,
    required this.isLast,
    required this.isTyping,
  });

  @override
  State<ChatMessageBubble> createState() => _ChatMessageBubbleState();
}

class _ChatMessageBubbleState extends State<ChatMessageBubble>
    with SingleTickerProviderStateMixin {
  int _revealedCount = 0;
  bool _isDone = false;
  Timer? _revealTimer;
  late AnimationController _entranceController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  late List<String> _words;

  @override
  void initState() {
    super.initState();

    _words = widget.message.content.split(RegExp(r'\s+'));

    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
    ));

    final provider = context.read<ExpertProvider>();
    final alreadyRevealed = provider.isRevealed(widget.message.id);

    if (alreadyRevealed) {
      _revealedCount = _words.length;
      _isDone = true;
      _entranceController.value = 1.0;
    } else {
      _entranceController.forward();
      _startRevealTimer();
    }
  }

  void _startRevealTimer() {
    final intervalMs = widget.message.isUser
        ? _userWordIntervalMs
        : _assistantWordIntervalMs;

    _revealTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _revealedCount++;
        if (_revealedCount >= _words.length) {
          timer.cancel();
          _isDone = true;
          context.read<ExpertProvider>().markRevealed(widget.message.id);
        }
      });
    });
  }

  @override
  void dispose() {
    _revealTimer?.cancel();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = widget.message.isUser;

    return SlideTransition(
      position: _slideAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Row(
            mainAxisAlignment:
                isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isUser) const Spacer(flex: 1),

              // Assistant avatar
              if (!isUser)
                Container(
                  width: 28,
                  height: 28,
                  margin: const EdgeInsets.only(right: 8, top: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.auto_awesome,
                      color: Colors.white, size: 14),
                ),

              // Bubble content
              Flexible(
                flex: 4,
                child: Container(
                  padding: isUser
                      ? const EdgeInsets.symmetric(
                          horizontal: 16.0, vertical: 12.0)
                      : const EdgeInsets.only(
                          right: 8.0, top: 4.0, bottom: 4.0),
                  decoration: isUser
                      ? BoxDecoration(
                          color: theme.colorScheme.secondary,
                          border: Border.all(
                            color:
                                theme.colorScheme.outline.withOpacity(0.4),
                          ),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(16),
                            bottomLeft: Radius.circular(16),
                            bottomRight: Radius.circular(16),
                            topRight: Radius.circular(4),
                          ),
                        )
                      : null,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Message content with word-by-word reveal
                      _isDone
                          ? SelectableText(
                              widget.message.content,
                              style: TextStyle(
                                color: theme.colorScheme.onSurface,
                                fontSize: 14,
                                height: 1.5,
                                letterSpacing: -0.1,
                              ),
                            )
                          : _buildAnimatedText(theme),

                      // Render recommended wines beautifully
                      if (_isDone && widget.message.wines != null && widget.message.wines!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: widget.message.wines!
                                .map((w) => _buildWineCard(theme, w))
                                .toList(),
                          ),
                        ),

                      // Typing indicator inside last assistant bubble
                      if (widget.isTyping &&
                          widget.isLast &&
                          !isUser &&
                          _isDone)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const _BouncingDots(),
                              const SizedBox(width: 8),
                              Text(
                                'ΑΝΑΛΥΣΗ…',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.4),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Timestamp for assistant
                      if (!isUser)
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            _formatRelativeTime(widget.message.timestamp),
                            style: TextStyle(
                              fontSize: 10,
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.35),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              // User avatar
              if (isUser)
                Container(
                  width: 24,
                  height: 24,
                  margin: const EdgeInsets.only(left: 8, top: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.secondary,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: theme.colorScheme.outline.withOpacity(0.6),
                    ),
                  ),
                ),

              if (!isUser) const Spacer(flex: 1),
            ],
          ),
        ),
      ),
    );
  }

  /// Build text with word-by-word fade-in animation
  Widget _buildAnimatedText(ThemeData theme) {
    return Wrap(
      children: List.generate(_words.length, (i) {
        final isVisible = i < _revealedCount;
        final isSettled = i < _revealedCount - _activeWindow;
        final isUser = widget.message.isUser;

        // Far behind edge — plain text
        if (isSettled || !isVisible && _isDone) {
          return Text(
            '${_words[i]} ',
            style: TextStyle(
              color: theme.colorScheme.onSurface,
              fontSize: 14,
              height: 1.5,
              letterSpacing: -0.1,
            ),
          );
        }

        return AnimatedOpacity(
          opacity: isVisible ? 1.0 : 0.0,
          duration: isUser
              ? const Duration(milliseconds: 200)
              : _wordTransitionDuration,
          curve: Curves.easeOut,
          child: AnimatedSlide(
            offset: isVisible ? Offset.zero : const Offset(0, 0.3),
            duration: isUser
                ? const Duration(milliseconds: 200)
                : _wordTransitionDuration,
            curve: Curves.easeOut,
            child: Text(
              '${_words[i]} ',
              style: TextStyle(
                color: theme.colorScheme.onSurface,
                fontSize: 14,
                height: 1.5,
                letterSpacing: -0.1,
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildWineCard(ThemeData theme, RecommendedWine wine) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(Icons.wine_bar, size: 16, color: theme.colorScheme.primary),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      wine.name,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '€${wine.price.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            wine.whyItFits,
            style: TextStyle(
              fontSize: 12,
              color: theme.colorScheme.onSurface.withOpacity(0.7),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Bouncing Dots Typing Indicator ──────────────────────────────────

class _BouncingDots extends StatefulWidget {
  const _BouncingDots();

  @override
  State<_BouncingDots> createState() => _BouncingDotsState();
}

class _BouncingDotsState extends State<_BouncingDots>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) {
      return AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      )..repeat(reverse: true);
    });

    // Stagger the animations
    Future.delayed(const Duration(milliseconds: 150), () {
      if (mounted) _controllers[1].repeat(reverse: true);
    });
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _controllers[2].repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        return AnimatedBuilder(
          animation: _controllers[i],
          builder: (context, child) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 1.5),
              child: Transform.translate(
                offset: Offset(0, -4 * _controllers[i].value),
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withOpacity(i < 2 ? 0.5 : 0.3),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          },
        );
      }),
    );
  }
}

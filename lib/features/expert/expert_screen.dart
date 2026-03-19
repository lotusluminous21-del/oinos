import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'expert_provider.dart';
import 'expert_state.dart';
import 'widgets/chat_header.dart';
import 'widgets/chat_message_bubble.dart';
import 'widgets/chat_composer.dart';
import 'widgets/welcome_screen.dart';
import 'widgets/typing_indicator.dart';
import 'widgets/sidebar_content.dart';
import '../../core/widgets/dev_console_overlay.dart';

/// Main Expert Sommelier screen.
/// Composes ChatHeader, WelcomeScreen/message list, ChatComposer,
/// and sidebar (as bottom sheet on mobile).
class ExpertScreen extends StatefulWidget {
  const ExpertScreen({super.key});

  @override
  State<ExpertScreen> createState() => _ExpertScreenState();
}

class _ExpertScreenState extends State<ExpertScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isAtBottom = true;

  @override
  void initState() {
    super.initState();

    // Seed already-revealed messages so they don't re-animate on rebuild
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExpertProvider>().seedRevealedMessages();
    });

    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final atBottom = _scrollController.position.maxScrollExtent -
            _scrollController.offset <
        100;
    if (atBottom != _isAtBottom) {
      _isAtBottom = atBottom;
    }
  }

  void _scrollToBottom({bool force = false}) {
    if (!_scrollController.hasClients) return;
    if (force || _isAtBottom) {
      Future.delayed(const Duration(milliseconds: 80), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  void _openSidebar() {
    final provider = context.read<ExpertProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.3,
        maxChildSize: 0.85,
        expand: false,
        builder: (context, scrollController) {
          return ChangeNotifierProvider.value(
            value: provider,
            child: Consumer<ExpertProvider>(
              builder: (context, prov, _) {
                return SidebarContent(
                  sidebarState: prov.sidebarState,
                  isGenerating: prov.isGenerating,
                  pipelineStage: prov.pipelineStage,
                );
              },
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DevConsoleOverlay(
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Consumer<ExpertProvider>(
          builder: (context, provider, _) {
            final hasMessages = provider.hasMessages;
            final messages = provider.messages;
            final isTyping = provider.isTyping;
            final isGenerating = provider.isGenerating;
            final showSolutionCTA = provider.showSolutionCTA;
            final pipelineStage = provider.pipelineStage;

            // Auto-scroll on new messages
            if (hasMessages) {
              final lastMsg = messages.last;
              if (lastMsg.isUser || _isAtBottom || isTyping) {
                _scrollToBottom(force: lastMsg.isUser);
              }
            }

            return Column(
              children: [
                // ── Header ─────────────────────────────────────
                ChatHeader(
                  hasMessages: hasMessages,
                  onReset: provider.resetSession,
                  onOpenSidebar: _openSidebar,
                ),

                // ── Chat Area ──────────────────────────────────
                Expanded(
                  child: Stack(
                    children: [
                      // Welcome Screen (empty state)
                      if (!hasMessages)
                        WelcomeScreen(visible: !hasMessages),

                      // Message thread
                      if (hasMessages)
                        ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.only(
                            left: 16, right: 16, top: 8, bottom: 160,
                          ),
                          itemCount: messages.length +
                              (isTyping &&
                                      messages.isNotEmpty &&
                                      messages.last.isUser
                                  ? 1
                                  : 0) +
                              (showSolutionCTA ? 1 : 0) +
                              (isGenerating ? 1 : 0),
                          itemBuilder: (context, index) {
                            // Regular messages
                            if (index < messages.length) {
                              return ChatMessageBubble(
                                message: messages[index],
                                isLast: index == messages.length - 1,
                                isTyping: isTyping,
                              );
                            }

                            int extraIndex = index - messages.length;

                            // Typing indicator (when last msg is user)
                            if (isTyping &&
                                messages.isNotEmpty &&
                                messages.last.isUser) {
                              if (extraIndex == 0) {
                                return const TypingIndicatorBubble();
                              }
                              extraIndex--;
                            }

                            // Solution CTA
                            if (showSolutionCTA && extraIndex == 0) {
                              return _buildSolutionCTA(context, provider);
                            }

                            // Pipeline generating indicator
                            if (isGenerating) {
                              return _buildPipelineIndicator(
                                  context, pipelineStage);
                            }

                            return const SizedBox.shrink();
                          },
                        ),

                      // Gradient fade above composer
                      if (hasMessages)
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: IgnorePointer(
                            child: Container(
                              height: 80,
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Color(0x00FFFFFF),
                                    Colors.white,
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                      // Floating Composer
                      ChatComposer(
                        onSend: (text) {
                          provider.sendMessage(text);
                          _scrollToBottom(force: true);
                        },
                        isLoading: isTyping,
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  /// "Generate Wine Recommendation" CTA button
  Widget _buildSolutionCTA(BuildContext context, ExpertProvider provider) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Center(
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: provider.generateSolution,
            borderRadius: BorderRadius.circular(20),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                color: theme.colorScheme.tertiary,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.tertiary.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.auto_awesome,
                      color: Colors.white, size: 18),
                  const SizedBox(width: 10),
                  const Text(
                    'Δημιουργία Πρότασης Κρασιού',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Pipeline generating indicator bubble in the chat
  Widget _buildPipelineIndicator(
      BuildContext context, PipelineStage pipelineStage) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            margin: const EdgeInsets.only(right: 8, top: 2),
            decoration: BoxDecoration(
              color: theme.colorScheme.tertiary,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.auto_awesome,
                color: Colors.white, size: 14),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: theme.colorScheme.tertiary.withOpacity(0.05),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
              border: Border.all(
                color: theme.colorScheme.tertiary.withOpacity(0.2),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor:
                        AlwaysStoppedAnimation(theme.colorScheme.tertiary),
                  ),
                ),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    'Ο Sommelier αναλύει και ετοιμάζει την πρότασή σας...',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

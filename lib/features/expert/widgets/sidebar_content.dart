import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../expert_state.dart';
import '../../auth/auth_service.dart';

/// Sidebar content showing interview progress and pipeline status.
/// Port of reference SidebarContent — adapted as a mobile bottom sheet.
class SidebarContent extends StatelessWidget {
  final SidebarState? sidebarState;
  final bool isGenerating;
  final PipelineStage pipelineStage;

  const SidebarContent({
    super.key,
    required this.sidebarState,
    required this.isGenerating,
    required this.pipelineStage,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentPhase = sidebarState?.overallPhase ?? 'interviewing';
    final phaseLabel = sidebarState?.overallPhaseLabel ??
        overallPhaseLabels[currentPhase] ??
        'Συνέντευξη';
    final briefReadiness = sidebarState?.briefReadiness ?? 0.0;
    final interviewProgress = sidebarState?.interviewProgress;
    final dimensions = sidebarState?.knowledgeDimensions ?? [];
    final logs = sidebarState?.logs ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Drag handle ──────────────────────────────────
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: theme.colorScheme.outline.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // ── 1. Phase Header ──────────────────────────────
          _PhaseHeader(
            theme: theme,
            isGenerating: isGenerating,
            currentPhase: currentPhase,
            phaseLabel: phaseLabel,
            pipelineStage: pipelineStage,
            briefReadiness: briefReadiness,
            domain: sidebarState?.domain,
          ),

          const SizedBox(height: 24),

          // ── 2. Interview Dimensions ──────────────────────
          if (interviewProgress != null && !isGenerating) ...[
            _SectionLabel(label: 'ΠΛΗΡΟΤΗΤΑ ΣΥΝΕΝΤΕΥΞΗΣ'),
            const SizedBox(height: 12),
            ...interviewDimensionLabels.entries.map((entry) {
              final dim = interviewProgress.dimensions[entry.key];
              if (dim == null) return const SizedBox.shrink();
              return _InterviewDimensionTile(
                theme: theme,
                label: entry.value,
                dimension: dim,
              );
            }),
            const SizedBox(height: 20),
          ],

          // ── 3. Technical Knowledge Dimensions ────────────
          if (dimensions.isNotEmpty && !isGenerating) ...[
            _GradientDivider(theme: theme),
            const SizedBox(height: 12),
            _SectionLabel(label: 'ΤΕΧΝΙΚΑ ΣΤΟΙΧΕΙΑ'),
            const SizedBox(height: 12),
            ...dimensions.map((dim) => _KnowledgeDimensionTile(
                  theme: theme,
                  dimension: dim,
                )),
            const SizedBox(height: 20),
          ],

          // ── 4. Pipeline Status (during generation) ──────
          if (isGenerating) ...[
            _PipelineStatusCard(
              theme: theme,
              currentStage: pipelineStage,
            ),
            const SizedBox(height: 20),
          ],

          // ── 5. AI Log Strip ──────────────────────────────
          if (logs.isNotEmpty) ...[
            _GradientDivider(theme: theme),
            const SizedBox(height: 12),
            _LogStrip(theme: theme, logs: logs),
          ],

          const SizedBox(height: 32),

          // ── 6. Logout Button ──────────────────────────────
          Center(
            child: TextButton.icon(
              onPressed: () {
                Navigator.of(context).pop(); // Close sidebar
                context.read<AuthService>().signOut();
              },
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Αποσύνδεση', style: TextStyle(fontWeight: FontWeight.w600)),
              style: TextButton.styleFrom(
                foregroundColor: theme.colorScheme.error,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// ─── Sub-components ──────────────────────────────────────────────────

class _PhaseHeader extends StatelessWidget {
  final ThemeData theme;
  final bool isGenerating;
  final String currentPhase;
  final String phaseLabel;
  final PipelineStage pipelineStage;
  final double briefReadiness;
  final String? domain;

  const _PhaseHeader({
    required this.theme,
    required this.isGenerating,
    required this.currentPhase,
    required this.phaseLabel,
    required this.pipelineStage,
    required this.briefReadiness,
    this.domain,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            // Status icon
            if (isGenerating)
              SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation(
                      theme.colorScheme.tertiary),
                ),
              )
            else if (currentPhase == 'complete')
              Icon(Icons.check_circle,
                  size: 14, color: theme.colorScheme.tertiary)
            else
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiary,
                  shape: BoxShape.circle,
                ),
              ),

            const SizedBox(width: 8),

            // Phase label
            Expanded(
              child: Text(
                isGenerating
                    ? (pipelineStageLabels[pipelineStage] ??
                        'Επεξεργασία...')
                    : phaseLabel,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ),

            // Domain badge
            if (domain != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: theme.colorScheme.tertiary.withOpacity(0.15),
                  ),
                ),
                child: Text(
                  domain!.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                    color: theme.colorScheme.tertiary,
                  ),
                ),
              ),
          ],
        ),

        // Readiness bar
        if (currentPhase != 'complete') ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: isGenerating ? null : briefReadiness,
                    minHeight: 4,
                    backgroundColor:
                        theme.colorScheme.secondary.withOpacity(0.6),
                    valueColor: AlwaysStoppedAnimation(
                        theme.colorScheme.tertiary),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                isGenerating
                    ? '⚡'
                    : '${(briefReadiness * 100).round()}%',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: theme.colorScheme.tertiary,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.5,
        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.35),
      ),
    );
  }
}

class _InterviewDimensionTile extends StatelessWidget {
  final ThemeData theme;
  final String label;
  final InterviewDimension dimension;

  const _InterviewDimensionTile({
    required this.theme,
    required this.label,
    required this.dimension,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status icon
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: _dimensionIcon(),
          ),
          const SizedBox(width: 8),
          // Label + value
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.2,
                    color: dimension.status == DimensionStatus.identified
                        ? theme.colorScheme.onSurface
                        : theme.colorScheme.onSurface.withOpacity(0.4),
                  ),
                ),
                if (dimension.value != null &&
                    dimension.status == DimensionStatus.identified)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.tertiary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color:
                            theme.colorScheme.tertiary.withOpacity(0.15),
                      ),
                    ),
                    child: Text(
                      dimension.value!,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.tertiary,
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

  Widget _dimensionIcon() {
    switch (dimension.status) {
      case DimensionStatus.identified:
        return Icon(Icons.check_circle,
            size: 14, color: theme.colorScheme.tertiary);
      case DimensionStatus.pending:
        return Icon(Icons.schedule,
            size: 14, color: theme.colorScheme.primary.withOpacity(0.6));
      case DimensionStatus.unknown:
        return Icon(Icons.circle_outlined,
            size: 14,
            color: theme.colorScheme.onSurface.withOpacity(0.2));
    }
  }
}

class _KnowledgeDimensionTile extends StatelessWidget {
  final ThemeData theme;
  final KnowledgeDimension dimension;

  const _KnowledgeDimensionTile({
    required this.theme,
    required this.dimension,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: dimension.status == DimensionStatus.identified
                  ? theme.colorScheme.tertiary
                  : dimension.status == DimensionStatus.pending
                      ? theme.colorScheme.primary.withOpacity(0.5)
                      : theme.colorScheme.onSurface.withOpacity(0.15),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              dimension.label,
              style: TextStyle(
                fontSize: 11,
                letterSpacing: -0.2,
                fontWeight: dimension.status == DimensionStatus.identified
                    ? FontWeight.w600
                    : FontWeight.normal,
                color: dimension.status == DimensionStatus.identified
                    ? theme.colorScheme.onSurface
                    : theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ),
          if (dimension.value != null &&
              dimension.status == DimensionStatus.identified)
            Text(
              dimension.value!,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.tertiary.withOpacity(0.8),
              ),
            ),
        ],
      ),
    );
  }
}

class _PipelineStatusCard extends StatelessWidget {
  final ThemeData theme;
  final PipelineStage currentStage;

  const _PipelineStatusCard({
    required this.theme,
    required this.currentStage,
  });

  @override
  Widget build(BuildContext context) {
    final stages = [
      PipelineStage.planning,
      PipelineStage.retrieving,
      PipelineStage.synthesizing,
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.tertiary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.tertiary.withOpacity(0.15),
        ),
      ),
      child: Column(
        children: stages.map((stage) {
          final isActive = currentStage == stage;
          final isPast = stages.indexOf(currentStage) > stages.indexOf(stage);

          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                if (isPast)
                  Icon(Icons.check_circle,
                      size: 14, color: theme.colorScheme.tertiary)
                else if (isActive)
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(
                          theme.colorScheme.tertiary),
                    ),
                  )
                else
                  Icon(Icons.circle_outlined,
                      size: 14,
                      color: theme.colorScheme.onSurface.withOpacity(0.2)),
                const SizedBox(width: 10),
                Text(
                  pipelineStageLabels[stage] ?? '',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isPast
                        ? theme.colorScheme.tertiary
                        : isActive
                            ? theme.colorScheme.onSurface
                            : theme.colorScheme.onSurface.withOpacity(0.35),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _GradientDivider extends StatelessWidget {
  final ThemeData theme;
  const _GradientDivider({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.outline.withOpacity(0.3),
            theme.colorScheme.outline.withOpacity(0.1),
            Colors.transparent,
          ],
        ),
      ),
    );
  }
}

class _LogStrip extends StatelessWidget {
  final ThemeData theme;
  final List<LogEntry> logs;

  const _LogStrip({required this.theme, required this.logs});

  @override
  Widget build(BuildContext context) {
    final displayLogs = logs.length > 4 ? logs.sublist(logs.length - 4) : logs;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.tertiary.withOpacity(0.4),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              'LOGS',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                letterSpacing: 2.0,
                color: theme.colorScheme.onSurface.withOpacity(0.3),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...displayLogs.map((log) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                log.message,
                style: TextStyle(
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                  height: 1.4,
                ),
              ),
            )),
      ],
    );
  }
}

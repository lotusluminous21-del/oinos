import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/dev_console_service.dart';

class DevConsoleOverlay extends StatefulWidget {
  final Widget child;

  const DevConsoleOverlay({super.key, required this.child});

  @override
  State<DevConsoleOverlay> createState() => _DevConsoleOverlayState();
}

class _DevConsoleOverlayState extends State<DevConsoleOverlay> {
  bool _isOpen = false;

  void _toggleConsole() {
    setState(() {
      _isOpen = !_isOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(
        children: [
          // The main application widget
          widget.child,
          
          // Floating Button to open/close
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 16,
            child: FloatingActionButton.small(
              heroTag: 'dev_console_btn',
              onPressed: _toggleConsole,
              backgroundColor: _isOpen ? Colors.red.shade600 : Colors.blueGrey.shade800,
              elevation: 4,
              child: Icon(
                _isOpen ? Icons.close : Icons.bug_report,
                color: Colors.white,
              ),
            ),
          ),
          
          // The console panel
          if (_isOpen)
            Positioned(
              left: 10,
              right: 10,
              top: MediaQuery.of(context).padding.top + 60,
              bottom: MediaQuery.of(context).padding.bottom + 20,
              child: Material(
                elevation: 10,
                borderRadius: BorderRadius.circular(12),
                color: Colors.black.withOpacity(0.9),
                child: Column(
                  children: [
                    _buildHeader(),
                    Expanded(
                      child: _buildLogList(),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'DEVELOPER CONSOLE',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
              letterSpacing: 1.2,
            ),
          ),
          TextButton(
            onPressed: () {
              DevConsoleService.instance.clearLogs();
            },
            child: const Text(
              'CLEAR',
              style: TextStyle(color: Colors.redAccent, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogList() {
    return AnimatedBuilder(
      animation: DevConsoleService.instance,
      builder: (context, child) {
        final logs = DevConsoleService.instance.logs;

        if (logs.isEmpty) {
          return const Center(
            child: Text(
              'No logs yet.',
              style: TextStyle(color: Colors.white54),
            ),
          );
        }

        final spans = <TextSpan>[];
        for (int i = 0; i < logs.length; i++) {
          final log = logs[i];
          Color levelColor;
          String levelText;

          switch (log.level) {
            case LogLevel.info:
              levelColor = Colors.lightBlueAccent;
              levelText = 'INFO';
              break;
            case LogLevel.error:
              levelColor = Colors.redAccent;
              levelText = 'ERROR';
              break;
            case LogLevel.system:
              levelColor = Colors.yellowAccent;
              levelText = 'SYSTEM';
              break;
          }

          final time = '${log.timestamp.hour.toString().padLeft(2, '0')}:${log.timestamp.minute.toString().padLeft(2, '0')}:${log.timestamp.second.toString().padLeft(2, '0')}';

          spans.add(TextSpan(
            text: '[$time] ',
            style: const TextStyle(color: Colors.white54, fontSize: 13, fontFamily: 'monospace'),
          ));
          spans.add(TextSpan(
            text: '$levelText ',
            style: TextStyle(color: levelColor, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
          ));
          spans.add(TextSpan(
            text: '${log.message}\n',
            style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
          ));

          if (log.error != null) {
            spans.add(TextSpan(
              text: '    Details: ${log.error}\n',
              style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontFamily: 'monospace'),
            ));
          }
          if (log.stackTrace != null) {
            spans.add(TextSpan(
              text: '    Stack trace: \n${log.stackTrace}\n',
              style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
            ));
          }
          
          if (i < logs.length - 1) {
            spans.add(const TextSpan(text: '\n----------------------------------------\n\n', style: TextStyle(color: Colors.white24, fontSize: 12, fontFamily: 'monospace')));
          }
        }

        return SizedBox(
          width: double.infinity,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(12),
            child: SelectableText.rich(
              TextSpan(children: spans),
            ),
          ),
        );
      },
    );
  }
}

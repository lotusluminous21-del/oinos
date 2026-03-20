import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'lab_service.dart';
import '../auth/auth_service.dart';

class LabScreen extends StatefulWidget {
  const LabScreen({super.key});

  @override
  State<LabScreen> createState() => _LabScreenState();
}

class _LabScreenState extends State<LabScreen> {
  final LabService _labService = LabService();
  bool _isProcessing = false;
  String _statusMessage = '';

  // Mock initial wine catalog
  final List<Map<String, dynamic>> _wines = [
    {'sku': 'WINE-001', 'name': 'Chateau Margaux 2015', 'status': 'RAW'},
    {'sku': 'WINE-002', 'name': 'Oaked Chardonnay', 'status': 'RAW'},
    {'sku': 'WINE-003', 'name': 'Malbec Reserve', 'status': 'RAW'},
  ];

  final Set<String> _selectedSkus = {};

  void _triggerEnrichment() async {
    if (_selectedSkus.isEmpty) return;

    setState(() {
      _isProcessing = true;
      _statusMessage = 'Triggering enrichment pipeline...';
      
      // Update UI to pending optimistically
      for (var w in _wines) {
        if (_selectedSkus.contains(w['sku'])) {
          w['status'] = 'PENDING';
        }
      }
    });

    final skusList = _selectedSkus.toList();
    final response = await _labService.triggerEnrichment(skusList);

    setState(() {
      _isProcessing = false;
      _statusMessage = response;
      _selectedSkus.clear();
    });
    
    // Auto-hide status after 3 secs
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _statusMessage = '');
    });
  }

  void _toggleSelection(String sku) {
    setState(() {
      if (_selectedSkus.contains(sku)) {
        _selectedSkus.remove(sku);
      } else {
        _selectedSkus.add(sku);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Lab - Wine Enrichment', style: TextStyle(color: Colors.white, fontSize: 16)),
        backgroundColor: Theme.of(context).colorScheme.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              context.read<AuthService>().signOut();
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () {
              // Mock refresh
            },
          )
        ],
      ),
      body: Column(
        children: [
          if (_statusMessage.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              color: Theme.of(context).colorScheme.primaryContainer,
              width: double.infinity,
              child: Text(
                _statusMessage, 
                style: TextStyle(color: Theme.of(context).colorScheme.onPrimaryContainer),
                textAlign: TextAlign.center,
              ),
            ),
          
          Expanded(
            child: ListView.builder(
              itemCount: _wines.length,
              itemBuilder: (context, index) {
                final wine = _wines[index];
                final isSelected = _selectedSkus.contains(wine['sku']);
                
                return ListTile(
                  leading: Checkbox(
                    value: isSelected,
                    onChanged: (val) => _toggleSelection(wine['sku']),
                  ),
                  title: Text(wine['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('SKU: ${wine['sku']}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(wine['status'] as String, context),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      wine['status'],
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurface,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  onTap: () => _toggleSelection(wine['sku']),
                );
              },
            ),
          ),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Text('${_selectedSkus.length} selected', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: (_selectedSkus.isEmpty || _isProcessing) ? null : _triggerEnrichment,
                    icon: _isProcessing 
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.auto_awesome),
                    label: const Text('Enrich Selected'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status, BuildContext context) {
    switch (status) {
      case 'RAW': return Colors.grey.shade300;
      case 'PENDING': return Colors.orange.shade200;
      case 'ENRICHED': return Colors.green.shade200;
      default: return Colors.transparent;
    }
  }
}

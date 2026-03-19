import 'package:cloud_functions/cloud_functions.dart';

class LabService {
  final FirebaseFunctions _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  Future<String> triggerEnrichment(List<String> skus) async {
    try {
      final HttpsCallable callable = _functions.httpsCallable('enrich_wine_batch');
      final result = await callable.call(<String, dynamic>{
        'skus': skus,
      });

      if (result.data != null && result.data['status'] == 'success') {
        return result.data['message'] ?? 'Enrichment started successfully.';
      } else {
        return 'Error: ${result.data?['message'] ?? 'Unknown error from server'}';
      }
    } on FirebaseFunctionsException catch (e) {
      return 'Functions Exception: ${e.message}';
    } catch (e) {
      return 'Error: $e';
    }
  }
}

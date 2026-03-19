import 'package:cloud_functions/cloud_functions.dart';
import '../../core/services/dev_console_service.dart';

class ExpertService {
  final FirebaseFunctions _functions = FirebaseFunctions.instanceFor(region: 'europe-west1');

  Future<String> sendMessage({
    required String sessionId,
    required String userId,
    required String message,
  }) async {
    try {
      DevConsoleService.instance.logInfo('Invoking chat_sommelier function for sessionId $sessionId');
      final HttpsCallable callable = _functions.httpsCallable('chat_sommelier');
      final result = await callable.call(<String, dynamic>{
        'sessionId': sessionId,
        'userId': userId,
        'message': message,
      });

      if (result.data != null && result.data['status'] == 'success') {
        DevConsoleService.instance.logInfo('Received successful response from chat_sommelier');
        return result.data['answer'] ?? 'No answer provided.';
      } else {
        final errorMsg = result.data?['message'] ?? 'Unknown error from server';
        DevConsoleService.instance.logError('Function returned an error status: $errorMsg');
        return 'Error: $errorMsg';
      }
    } on FirebaseFunctionsException catch (e, stack) {
      DevConsoleService.instance.logError(
          'Firebase Functions Exception: ${e.code}', 
          e.message, 
          stack);
      return 'Functions Exception: ${e.message}';
    } catch (e, stack) {
      DevConsoleService.instance.logError('Unexpected Error in ExpertService', e, stack);
      return 'Error: $e';
    }
  }
}

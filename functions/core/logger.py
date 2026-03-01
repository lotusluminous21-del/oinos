import logging
import traceback
from firebase_admin import firestore
import datetime

# Setup standard formatting
FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
logging.basicConfig(level=logging.INFO, format=FORMAT)

class SystemLogger:
    """
    A custom logger that outputs to the standard logging stream (for GCP Cloud Logging)
    AND asynchronously writes to a 'system_logs' collection in Firestore for real-time
    in-app UI debugging.
    """
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.db = None # Lazy load to prevent initialization order issues

    def _get_db(self):
        if not self.db:
            try:
                self.db = firestore.client()
            except ValueError: # If default app is not initialized yet
                pass
        return self.db

    def _write_to_firestore(self, level: str, message: str, **kwargs):
        db = self._get_db()
        if not db:
            return # Silent fail if Firestore isn't ready
        
        try:
            log_entry = {
                "timestamp": firestore.SERVER_TIMESTAMP,
                "level": level,
                "source": self.logger.name,
                "message": message,
                **kwargs
            }
            db.collection("system_logs").add(log_entry)
        except Exception as e:
            # We must use standard print here to avoid infinite recursion if logger fails.
            # Output to stderr for better visibility in function logs.
            import sys
            print(f"LOGGER_FIREBASE_FAILURE: {self.logger.name} failed to add to 'system_logs' collection. Error: {e}", file=sys.stderr)
            print(f"MESSAGE_LOST: [{level}] {message}", file=sys.stderr)

    def info(self, message: str, sku: str = None, **kwargs):
        self.logger.info(message)
        context = {"sku": sku} if sku else {}
        context.update(kwargs)
        self._write_to_firestore("INFO", message, **context)
        
    def warning(self, message: str, sku: str = None, **kwargs):
        self.logger.warning(message)
        context = {"sku": sku} if sku else {}
        context.update(kwargs)
        self._write_to_firestore("WARNING", message, **context)

    def error(self, message: str, exc_info=None, sku: str = None, **kwargs):
        """
        Logs an error. If exc_info is provided (True or Exception instance),
        it parses the exact traceback line and exception name to avoid vague errors.
        """
        self.logger.error(message, exc_info=exc_info)
        
        context = {"sku": sku} if sku else {}
        context.update(kwargs)
        
        if exc_info:
            if isinstance(exc_info, BaseException):
                # We got an explicit exception object
                stack = "".join(traceback.format_exception(type(exc_info), exc_info, exc_info.__traceback__))
                error_type = type(exc_info).__name__
            else:
                # We just got exc_info=True, pull from sys config
                import sys
                exc_type, exc_value, exc_tb = sys.exc_info()
                if exc_type:
                    stack = "".join(traceback.format_exception(exc_type, exc_value, exc_tb))
                    error_type = exc_type.__name__
                else:
                    stack = "No traceback available"
                    error_type = "UnknownError"
                    
            context["traceback"] = stack
            context["error_type"] = error_type
            
        self._write_to_firestore("ERROR", message, **context)

def get_logger(name: str) -> SystemLogger:
    return SystemLogger(name)

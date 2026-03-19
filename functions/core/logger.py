import logging
import sys
import json
from datetime import datetime, timezone

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured structured logger.
    """
    logger = logging.getLogger(name)
    
    # Avoid adding multiple handlers if logger is already configured
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    
    class StructuredFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname,
                "name": record.name,
                "message": record.getMessage(),
            }
            if hasattr(record, "kwargs_data"):
                log_data.update(record.kwargs_data)
                
            if record.exc_info:
                log_data["exception"] = self.formatException(record.exc_info)
                
            return json.dumps(log_data)
            
    handler.setFormatter(StructuredFormatter())
    logger.addHandler(handler)
    
    # Patch logger methods to accept kwargs for structured data
    def make_structured_logger(level_method):
        def _log(msg, *args, **kwargs):
            if kwargs and "exc_info" not in kwargs:
                extra = {"kwargs_data": kwargs}
                level_method(msg, *args, extra=extra)
            else:
                level_method(msg, *args, **kwargs)
        return _log

    logger.info = make_structured_logger(logger.info)
    logger.error = make_structured_logger(logger.error)
    logger.warning = make_structured_logger(logger.warning)
    logger.debug = make_structured_logger(logger.debug)
    
    return logger

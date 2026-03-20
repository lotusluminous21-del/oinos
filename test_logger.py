import logging
import sys

def get_logger(name: str):
    logger = logging.getLogger(name)
    if logger.hasHandlers():
        return logger
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    logger.addHandler(handler)
    
    def make_structured_logger(level_method):
        def _log(msg, *args, **kwargs):
            if kwargs and "exc_info" not in kwargs:
                extra = {"kwargs_data": kwargs}
                level_method(msg, *args, extra=extra)
            else:
                level_method(msg, *args, **kwargs)
        return _log

    logger.info = make_structured_logger(logger.info)
    return logger

log = get_logger("test")
log.info("Test message", store_id="default")

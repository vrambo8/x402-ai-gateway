import structlog
import logging
from pythonjsonlogger import jsonlogger
import sys


def setup_logging():
    """Configure structured JSON logging"""

    # # structlog configuration
    # structlog.configure(
    #     processors=[
    #         structlog.stdlib.filter_by_level,
    #         structlog.processors.TimeStamper(fmt="iso"),
    #         structlog.processors.StackInfoRenderer(),
    #         structlog.processors.format_exc_info,
    #         structlog.processors.UnicodeDecoder(),
    #         structlog.processors.Console()
    #     ],
    #     context_class=dict,
    #     logger_factory=structlog.stdlib.LoggerFactory(),
    #     cache_logger_on_first_use=True,
    # )

    # # Standard logging with JSON formatter
    # logHandler = logging.StreamHandler(sys.stdout)
    # formatter = jsonlogger.JsonFormatter()
    # logHandler.setFormatter(formatter)

    # root_logger = logging.getLogger()
    # root_logger.addHandler(logHandler)
    # root_logger.setLevel(logging.INFO)

    logging.basicConfig(level=logging.INFO)
    logging.getLogger("uvicorn").propagate = True
    logging.getLogger("uvicorn.error").propagate = True
    logging.getLogger("uvicorn.access").propagate = True

    structlog.configure(
        processors=[
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer()
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

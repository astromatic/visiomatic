"""
Configure application.
"""
# Copyright CEA/CFHT/CNRS/UParisSaclay
# Licensed under the MIT licence

from sys import exit, modules
from typing import Any

from .config import Config
from .settings import AppSettings

# Initialize global dictionary
# Set up settings by instantiating a configuration object
config = Config(AppSettings())
config_filename = None
settings = config.flat_dict()


def override(key: str, value: Any) -> Any:
    """
    Convenience function that returns the input value unless it is None,
    in which case the settings value from key is returned.

    Examples
    --------
    >>> from . import override, settings
    >>> settings['port'] = 8009
    >>> print(f"{override('port', 8080)}")
    8080

    >>> print(f"{override('port', None)}")
    8009

    Parameters
    ----------
    key: str
        Key to settings value.
    value: Any
        Input value.

    Returns
    -------
    value: Any
        Input value or settings value.
    """
    return settings[key] if value is None else value


config_filename = config.config_filename
image_filename = config.image_filename


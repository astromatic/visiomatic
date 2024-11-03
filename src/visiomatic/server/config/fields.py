"""
Group and define Pydantic-compatible fields.
"""
# Copyright UParisSaclay/CEA/CFHT/CNRS
# Licensed under the MIT licence

from __future__ import annotations

from typing import Any

from pydantic import Field



def SField(short: str | None = None, **kwargs) -> Any:
    """
    Return Pydantic field with augmented JSON schema including a command-line
    "shortcut" keyword.

    Examples
    --------
    >>> from pydantic_settings import BaseSettings

    >>> class Settings(BaseSettings):
    ...     parameter: float = SField(
    ...         short='p',
    ...         description="an arbitrary parameter",
    ...         default=10.,
    ...     )
    
    >>> s = Settings(parameter=3.)
    
    >>> s.model_json_schema()
    {'additionalProperties': False, 'properties': {'parameter': {'default': 10.0,
    'description': 'an arbitrary parameter', 'short': 'p', 'title': 'Parameter',
    'type': 'number'}}, 'title': 'Settings', 'type': 'object'}
    
    Parameters
    ----------
    short: str, optional
        Shortcut for keyword
    **kwargs:
        Additional Field arguments.
    Returns
    -------
        Pydantic Field with augmented JSON schema.
    """
    return Field(**kwargs, json_schema_extra={'short': short})


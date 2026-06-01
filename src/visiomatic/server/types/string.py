"""
Provide Pydantic-compatible annotations and annotated types for enhanced string
validation and serialization.
"""
# Copyright UParisSaclay/CEA/CFHT/CNRS
# Licensed under the MIT licence

from __future__ import annotations

from re import compile
from typing import TYPE_CHECKING, Annotated, Any, Pattern

if TYPE_CHECKING:
    from pydantic import GetCoreSchemaHandler
from pydantic import Field
from pydantic_core import core_schema



class StrAnnotation:
    """
    Pydantic compatible annotation for validating and serializing strings
    (the original Pydantic 2.x string fields only support Rust Regex).

    Examples
    --------
    >>> from typing import Annotated
    >>> from pydantic import BaseModel
    >>> from .string import StrAnnotation

    >>> class Person(BaseModel):
    ...     firstname: Annotated[str, StrAnnotation(pattern=r"[A-Z][a-z]*")]
    ...     lastname: Annotated[str, StrAnnotation(pattern=r"[A-Z][a-z]*")]

    >>> # The following instantiation validates
    >>> user = Person(firstname="Emmanuel", lastname="Bertin")

    >>> # The following instantiation does not validate
    >>> user = Person(firstname="emmanuel", lastname="Bertin")
    Traceback (most recent call last):
    ...
    pydantic_core._pydantic_core.ValidationError: 1 validation error for Person
    firstname
    Value error, string does not match [A-Z][a-z]* pattern
    [type=value_error, input_value='emmanuel', input_type=str]
    For further information visit https://errors.pydantic.dev/2.8/v/value_error

    Parameters
    ----------
    description: str, optional
        Description string.
    min_length: int, optional
        Minimum string length.
    max_length: int, optional
        Maximum string length.
    pattern: Pattern, optional
        Regular expression for validation.
    valid_list: list[str], optional
        List of validating strings.
    """
    description: str = ""
    min_length: int | None = None
    max_length: int | None = None
    pattern: Pattern | None = None
    valid_list: list[str] | None = None
    def __init__(
            self,
            *,
            description: str = "",
            min_length: int | None = None,
            max_length: int | None = None,
            pattern: Pattern | None = None,
            valid_list: list[str] | None = None):

        self.description = description
        self.min_length = min_length
        self.max_length = max_length
        self.pattern = pattern
        if pattern is not None:
            self.compiled = compile(pattern)
        self.valid_list = valid_list


    def validate(
            self,
            s: str,
            info: core_schema.ValidationInfo | None = None) -> str:

        """
        Validate `str`.

        Parameters
        ----------
        s: str
            String that should be validated.
        info: ~pydantic.core_schema.ValidationInfo, optional
            The validation info provided by the Pydantic schema.

        Returns
        -------
        s: str
            Validated string.

        Raises
        ------
        ValueError: exception
            An error occurred validating the specified string.
            It is raised if any of the following occur:
            - the provided string did not match the pattern.
            - An unknown type was provided for the string.
        """
        # Check if it is a string
        if not isinstance(s, str):
            raise ValueError("not a string")

        # Check if it has the right size
        if self.min_length and len(s) < self.min_length:
             raise ValueError(f"String should have at least {self.min_length} characters")
        if self.max_length and len(s) > self.max_length:
             raise ValueError(f"String should have at most {self.max_length} characters")

        # Check if it matches the regular expression if provided
        if self.pattern and not self.compiled.match(s):
             raise ValueError(f"String should match {self.pattern} pattern")

        # Check if it matches any member of the list if provided
        if self.valid_list and not s in self.valid_list:
             raise ValueError(f"String should match any of {self.valid_list}")

        return s


    def serialize(
            self,
            s: str,
            info: core_schema.SerializationInfo | None = None,
            *,
            to_json: bool = False) -> dict | str:
        """
        Serialize string.

        Parameters
        ----------
        s: str
            String that should be serialized.
        info: pydantic.core_schema.SerializationInfo, optional
            Serialization info provided by the Pydantic schema.
        to_json: bool, optional
            Whether or not to serialize to a json convertible object.

        Returns
        -------
        s: str
            The serialized `str`.
        """
        return s


    def __get_pydantic_core_schema__(
            self,
            source_type: Any,
            handler: GetCoreSchemaHandler) -> core_schema.CoreSchema:
        """
        Get the Pydantic core schema.

        Parameters
        ----------
        source_type:
            The source type.
        handler: ~pydantic.GetCoreSchemaHandler
            The `GetCoreSchemaHandler` instance.

        Returns
        -------
            The Pydantic core schema.
        """
        _from_typedict_schema = {
            "value": core_schema.typed_dict_field(
                core_schema.str_schema()
            ),
            "str": core_schema.typed_dict_field(core_schema.str_schema()),
        }

        validate_schema = core_schema.chain_schema(
            [
                core_schema.union_schema(
                    [
                        core_schema.is_instance_schema(str),
                        core_schema.str_schema(
                            min_length=self.min_length,
                            max_length=self.max_length,
                            pattern=self.pattern
                        )
                    ]
                ),
                core_schema.with_info_plain_validator_function(self.validate),
            ]
        )

        validate_json_schema = core_schema.chain_schema(
            [
                core_schema.str_schema(
                    min_length=self.min_length,
                    max_length=self.max_length,
                    pattern=self.pattern
                ),
                core_schema.no_info_plain_validator_function(self.validate)
            ]
        )

        serialize_schema = core_schema.plain_serializer_function_ser_schema(
            self.serialize,
            info_arg=True,
        )

        return core_schema.json_or_python_schema(
            json_schema=validate_json_schema,
            python_schema=validate_schema,
            serialization=serialize_schema,
        )



def AnnotatedStr(
    default: str,
    short: str | None = None,
    description: str = "",
    min_length: int | None = None,
    max_length: int | None = None,
    pattern: Pattern | None = None,
    valid_list: list[str] | None = None) -> Any:
    """
    Pydantic pseudo-field for validating and serializing strings
    (the original Pydantic 2.x string fields only support Rust Regex).

    Examples
    --------
    >>> from pydantic_settings import BaseSettings
    >>> from .string import AnnotatedStr

    >>> class Person(BaseSettings):
    ...     firstname: AnnotatedStr(
    ...         short='f',
    ...         description="First name.",
    ...         default="Unknown",
    ...         min_length=1,
    ...         pattern=r"[A-Z][a-z]*"
    ...     )
    ...     lastname: AnnotatedStr(
    ...        short='l',
    ...        description="Last name.",
    ...        default="Unknown",
    ...        min_length=1,
    ...        pattern=r"[A-Z][a-z]*"
    ...    )

    >>> # The following instantiation validates
    >>> user = Person(firstname="Emmanuel", lastname="Bertin")

    >>> # The following instantiation does not validate
    user = Person(firstname="emmanuel", lastname="Bertin")
    Traceback (most recent call last):
    ...
    pydantic_core._pydantic_core.ValidationError: 1 validation error for Person
    firstname
    Value error, string does not match [A-Z][a-z]* pattern
    [type=value_error, input_value='emmanuel', input_type=str]
    For further information visit https://errors.pydantic.dev/2.8/v/value_error

    Parameters
    ----------
    default: str | ~astropy.units.Quantity
        Default value
    short: str, optional
        shortcut for keyword
    description: str, optional
        Description string.
    min_length: int, optional
        Minimum string length.
    max_length: int, optional
        Maximum string length.
    pattern: Pattern, optional
        Regular expression for validation.
    valid_list: list[str], optional
        List of validating strings.
    """

    json_extra: dict = {}
    if default is not None:
        json_extra['default'] = default
    if max_length is not None:
        json_extra['maxLength'] = str(max_length)
    if min_length is not None:
        json_extra['minLength'] = str(min_length)
    if pattern is not None:
        json_extra['pattern'] = str(pattern)
    if valid_list is not None:
        json_extra['valid_list'] = valid_list
    if short:
        json_extra['short'] = short
    return Annotated[
        str,
        StrAnnotation(
            min_length=min_length,
            max_length=max_length,
            pattern=pattern,
            valid_list=valid_list
        ),
        Field(
            default_factory=lambda: default,
            description=description,
            validate_default=True,
            json_schema_extra=json_extra
        )        
    ]




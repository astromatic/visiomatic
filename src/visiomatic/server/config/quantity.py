"""
Provide Pydantic-compatible annotations and fields for validating and
serializing AstroPy unit-aware "quantities"
"""
# Copyright UParisSaclay/CEA/CFHT/CNRS
# Licensed under the MIT licence

from __future__ import annotations

from numbers import Number
from re import findall
from typing import TYPE_CHECKING, Annotated, Any, Iterable, Literal, Tuple

from astropy import units as u  #type: ignore[import-untyped]
import numpy as np
if TYPE_CHECKING:
    from pydantic import GetCoreSchemaHandler
from pydantic import Field
from pydantic_core import core_schema

# Enable imperial units such as inches
u.imperial.enable()



class QuantityAnnotation:
    """
    Pydantic compatible annotation for validating and serializing AstroPy
    Quantity fields.
    Loosely adapted from pint-quantity by Tyler Hughes <tylerxh111+git@proton.me>

    Examples
    --------
    >>> from typing import Annotated
    >>> from astropy import units as u
    >>> from pydantic import BaseModel
    >>> from .quantity import QuantityAnnotation

    >>> class Coordinates(BaseModel):
    ...    latitude: Annotated[
    ...        u.Quantity, QuantityAnnotation("deg", ge=-90.*u.deg, le=90.*u.deg)
    ...    ]
    ...    longitude: Annotated[u.Quantity, QuantityAnnotation("deg")]
    ...    altitude: Annotated[u.Quantity, QuantityAnnotation("km")]

    # The following instantiation validates
    >>> coord = Coordinates(
    ...    latitude="39.905705 deg",
    ...    longitude="-75.166519 deg",
    ...    altitude="12 m"
    ... )

    >>> coord
    Coordinates(latitude=<Quantity 39.905705 deg>,
    longitude=<Quantity -75.166519 deg>, altitude=<Quantity 0.012 km>)

    >>> f"{coord!r}"
    'Coordinates(latitude=<Quantity 39.905705 deg>,
    longitude=<Quantity -75.166519 deg>, altitude=<Quantity 0.012 km>)'

    >>> coord.model_dump()
    {'latitude': <Quantity 39.905705 deg>, 'longitude': <Quantity -75.166519 deg>,
    'altitude': <Quantity 0.012 km>}

    >>> coord.model_dump(mode="json")
    {'latitude': '39.905705 deg', 'longitude': '-75.166519 deg',
    'altitude': '0.012 km'}

    >>> coord.model_dump_json()
    '{"latitude":"39.905705 deg","longitude":"-75.166519 deg","altitude":"0.012 km"}'

    # The following instantiation does not validate
    >>> coord = Coordinates(
    ...    latitude="99.905705 deg",
    ...    longitude="-75.166519 deg",
    ...    altitude="12 m"
    ... )
    Traceback (most recent call last):
    ...
    pydantic_core._pydantic_core.ValidationError: 1 validation error for Coordinates
    latitude
      Value error, greater than 90.0 deg
      [type=value_error, input_value='99.905705 deg', input_type=str]
        For further information visit https://errors.pydantic.dev/2.7/v/value_error

    Parameters
    ----------
    unit: str
        The unit type of the Pydantic field (e.g., `"m"`, or `"deg"`).
        All input units must be convertible to this unit.
    min_shape: tuple[int], optional
        Minimum number of vector components on each axis.
    max_shape: tuple[int], optional
        Maximum number of vector components on each axis.
    ge: ~astropy.units.Quantity or str, optional
        Lower limit (inclusive).
    gt: ~astropy.units.Quantity or str, optional
        Lower limit (strict).
    le: ~astropy.units.Quantity or str, optional
        Lower limit (inclusive).
    lt: ~astropy.units.Quantity or str, optional
        Lower limit (strict).
    ser_mode: Literal["str", "dict"], optional
        The mode for serializing the field; either `"str"` or `"dict"`.
        By default, in Pydantic's `"python"` serialization mode, fields are
        serialized to a `Quantity`;
        in Pydantic's `"json"` serialization mode, fields are serialized to a `str`.
    strict: bool, optional
        Forces users to specify units; on by default.
        If disabled, a value without units - provided by the user - will be
        treated as the base units of the `QuantityUnit`.
    """
    min_shape: np.ndarray | None = None
    max_shape: np.ndarray | None = None
    ge: u.Quantity | str | None = None
    gt: u.Quantity | str | None = None
    le: u.Quantity | str | None = None
    lt: u.Quantity | str | None = None
    description: str = ""
    def __init__(
            self,
            unit: str,
            *,
            description: str = "",
            min_shape: Tuple[int, ...] | None = None,
            max_shape: Tuple[int, ...] | None = None,
            ge: u.Quantity | str | None = None,
            gt: u.Quantity | str | None = None,
            le: u.Quantity | str | None = None,
            lt: u.Quantity | str | None = None,
            ser_mode: Literal["str", "dict"] | None = None,
            strict: bool = True):

        self.ser_mode = ser_mode.lower() if ser_mode else None
        self.strict = strict

        self.unit = unit
        self.description = description

        self.min_shape = np.array(1 if min_shape is None else min_shape, dtype=np.int32) 
        self.max_shape = np.array(1 if max_shape is None else max_shape, dtype=np.int32)
        # Make sure all shapes match
        self.min_shape += 0 * self.max_shape

        self.ge = u.Quantity(ge) if ge is not None else None
        self.gt = u.Quantity(gt) if gt is not None else None
        self.le = u.Quantity(le) if le is not None else None
        self.lt = u.Quantity(lt) if lt is not None else None

    def validate(
            self,
            v: dict | str | Number | u.Quantity,
            info: core_schema.ValidationInfo | None = None) -> u.Quantity:

        """
        Validate `Quantity`.

        Parameters
        ----------
        v: dict | str | numbers.Number  ~astropy.units.Quantity
            Quantity that should be validated.
        info: ~pydantic.core_schema.ValidationInfo, optional
            The validation info provided by the Pydantic schema.

        Returns
        -------
        v: ~astropy.units.Quantity
            Validated `Quantity` with the correct units.

        Raises
        ------
        ValueError: exception
            An error occurred validating the specified value.
            It is raised if any of the following occur:
            - A `dict` is received and the keys `"value"` and `"units"` do not exist.
            - There are no units provided.
            - Provided units cannot be converted to base units.
            - An unknown unit was provided.
            - An unknown type for value was provided.
        TypeError: exception
              An error occurred from unit registry or unit registry context.
              It is not propagated as a `pydantic.ValidationError` because
              it does not stem from a user error.
        """
        try:
            if isinstance(v, dict):
                v = f"{v['value']} {v.get('unit', '')}"
        except KeyError as e:
            raise ValueError("no `value` or `unit` keys found") from e

        try:
            if isinstance(v, str):
                # relies on units to return a number if no units are present
                # if value is a quantity, then units are present and check on the units being convertible
                # if value is a number, then check on strict mode will happen next
                v = str_to_quantity_array(v)
        except ValueError as e:
            raise ValueError(e) from e

        try:
            if isinstance(v, Number) and not self.strict:
                # check must happen after conversion from string because string might not have any units
                # only applicable if dealing with no units and if in strict mode
                v = u.Quantity(v, self.unit)
            if isinstance(v, u.Quantity):
                v = v.to(self.unit)
 
                # Check array shape if any.
                shape = np.array(np.array(v.value).shape)
                if (len(shape)==0 and np.any(self.min_shape > 1)) \
                	or np.any(shape < self.min_shape):
                    raise ValueError(
                        f"missing components (found {shape}, "
                        f"{self.min_shape} expected)")
                if np.any(shape > self.max_shape):
                    raise ValueError(
                        f"too many components (found {shape}, "
                        f"{self.max_shape} expected)")                    

                # Check limits if any 
                if self.ge is not None and np.any(v < self.ge):
                    raise ValueError(f"less than {self.ge}")
                if self.gt is not None and np.any(v <= self.gt):
                    raise ValueError(f"equal to or less than {self.gt}")
                if self.le is not None and np.any(v > self.le):
                    raise ValueError(f"greater than {self.le}")
                if self.lt is not None and np.any(v >= self.lt):
                    raise ValueError(f"equal to or greater than {self.lt}")
                return v
 
        except AttributeError as e:
            # raises attribute error if value is a number
            # this case only happen when parsing from a string, the units are not present, and not in strict mode
            # see comments above related to ureg returning a number
            raise ValueError("no units found") from e
        except u.UnitConversionError as e:
            raise ValueError(e) from e
        raise ValueError(f"unknown type {type(v)}")


    def serialize(
            self,
            v: u.Quantity,
            info: core_schema.SerializationInfo | None = None,
            *,
            to_json: bool = False) -> dict | str | u.Quantity:
        """
        Serialize `Quantity`.

        Parameters
        ----------
        v: ~astropy.units.Quantity
            Quantity that should be serialized.
        info: pydantic.core_schema.SerializationInfo, optional
            Serialization info provided by the Pydantic schema.
        to_json: bool, optional
            Whether or not to serialize to a json convertible object.
            Useful if using `QuantityUnit` as a utility outside of Pydantic models.

        Returns
        -------
        quantity: str
            The serialized `Quantity`.
        """
        to_json = to_json or (info is not None and info.mode_is_json())

        if self.ser_mode == "dict":
            return {
                "value": v.value,
                "unit": v.unit if not to_json else f"{v.unit}",
            }

        if self.ser_mode == "str" or to_json:
            return f"{v}"

        return v

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
        core_schema: ~pydantic.core_schema.CoreSchema
            The Pydantic core schema.
        """
        _from_typedict_schema = {
            "value": core_schema.typed_dict_field(
                core_schema.str_schema(coerce_numbers_to_str=True)
            ),
            "unit": core_schema.typed_dict_field(core_schema.str_schema()),
        }

        validate_schema = core_schema.chain_schema([
            core_schema.union_schema([
                core_schema.is_instance_schema(u.Quantity),
                core_schema.str_schema(coerce_numbers_to_str=True),
                core_schema.typed_dict_schema(_from_typedict_schema),
            ]),
            core_schema.with_info_plain_validator_function(self.validate)
        ])

        """
        validate_json_schema = core_schema.chain_schema([
            core_schema.union_schema([
                core_schema.str_schema(coerce_numbers_to_str=True),
                core_schema.typed_dict_schema(_from_typedict_schema),
            ]),
            core_schema.no_info_plain_validator_function(self.validate)
        ])
        """
        validate_json_schema = core_schema.chain_schema([
            core_schema.str_schema(coerce_numbers_to_str=True),
            core_schema.no_info_plain_validator_function(self.validate)
        ])

        serialize_schema = core_schema.plain_serializer_function_ser_schema(
            self.serialize,
            info_arg=True,
        )

        return core_schema.json_or_python_schema(
            json_schema=validate_json_schema,
            python_schema=validate_schema,
            serialization=serialize_schema,
        )



def AnnotatedQuantity(
        default: u.Quantity | str,
        short: str | None = None,
        description: str = "",
        min_shape: Tuple[int, ...] | None = None,
        max_shape: Tuple[int, ...] | None = None,
        ge: u.Quantity | str | None = None,
        gt: u.Quantity | str | None = None,
        le: u.Quantity | str | None = None,
        lt: u.Quantity | str | None = None) -> Any:
    """
    Pydantic pseudo-field for validating and serializing AstroPy Quantities.

    Examples
    --------
    >>> from pydantic_settings import BaseSettings
    >>> from .quantity import AnnotatedQuantity

    >>> class Settings(BaseSettings):
    ...    size: AnnotatedQuantity(
    ...        short='S',
    ...        description="an arbitrary length",
    ...        default=10. * u.m,
    ...        ge=1. * u.micron,
    ...        lt=1. * u.km
    ...    )
        
    # The following instantiation validates
    >>> s = Settings(size="3. cm")

    >>> s
    Settings(size=<Quantity 0.03 m>)

    >>> f"{s!r}"
    'Settings(size=<Quantity 0.03 m>)'

    >>> s.model_dump()
    {'size': <Quantity 0.03 m>}

    >>> s.model_dump(mode="json")
    {'size': '0.03 m'}

    >>> s.model_json_schema()
    {'additionalProperties': False, 'properties': {'size': {'default':
    '10.0 m', 'description': 'an arbitrary length', 'exclusiveMaximum':
    '1.0 km', 'minimum': '1.0 micron', 'physType': 'length', 'short': 'S',
    'title': 'Size', 'type': 'string'}}, 'title': 'Settings', 'type':
    'object'}

    # The following instantiation does not validate
    >>> s = Settings(size="4 deg")
    Traceback (most recent call last):
    ...
    pydantic_core._pydantic_core.ValidationError: 1 validation error for Settings
    size
      Value error, 'deg' (angle) and 'm' (length) are not convertible
      [type=value_error, input_value='4 deg', input_type=str]
        For further information visit https://errors.pydantic.dev/2.8/v/value_error

    Parameters
    ----------
    default: ~astropy.units.Quantity or str
        Default value.
    short: str, optional
        shortcut for keyword.
    description: str, optional
        Description string.
    min_shape: tuple[int], optional
        Minimum number of vector components on each axis.
    max_shape: tuple[int], optional
        Maximum number of vector components on each axis.
    ge: ~astropy.units.Quantity or str, optional
        Lower limit (inclusive).
    gt: ~astropy.units.Quantity or str, optional
        Lower limit (strict).
    le: ~astropy.units.Quantity or str, optional
        Lower limit (inclusive).
    lt: ~astropy.units.Quantity or str, optional
        Lower limit (strict).
    """
    default = u.Quantity(default)
    unit = default.unit
    physType = u.get_physical_type(default)
    json_extra: dict = {}
    json_extra['default'] = default.to_string()
    if min_shape is not None:
        min_shape = tuple(min_shape)
        json_extra['minShape'] = str(min_shape)
    if max_shape is not None:
        max_shape = tuple(max_shape)
        json_extra['maxShape'] = str(max_shape)
    if lt is not None:
        lt = u.Quantity(lt)
        json_extra['exclusiveMaximum'] = lt.to_string()
    if gt is not None:
        gt = u.Quantity(gt)
        json_extra['exclusiveMinimum'] = gt.to_string()
    if le is not None:
        le = u.Quantity(le)
        json_extra['maximum'] = le.to_string()
    if ge is not None:
        ge = u.Quantity(ge)
        json_extra['minimum'] = ge.to_string()
    if physType is not None:
        json_extra['physType'] = str(physType)
    if short:
        json_extra['short'] = short
    return Annotated[
        u.Quantity,
        QuantityAnnotation(
            unit=u.Quantity(default).unit,
            min_shape=min_shape,
            max_shape=max_shape,
            ge=ge,
            gt=gt,
            le=le,
            lt=lt
        ),
        Field(
            default_factory=lambda: default,
            description=description,
            validate_default=True,
            json_schema_extra=json_extra
        )        
    ]



def str_to_quantity_array(s: str) -> u.Quantity | None:
    """
    Convert string to Astropy "units" Quantity array

    Notes
    -----
        Currently limited to "well-formed", 1D arrays.

    Examples
    --------
    >>> from .quantity import str_to_quantity_array

    >>> str_to_quantity_array("[3.14, 1e+06] m")
    <Quantity [3.14e+00, 1.00e+06] m>

    Parameters
    ----------
    s: str
        Input string.

    Returns
    -------
    v: ~astropy.units.Quantity
        Astropy units Quantity object.
    """
    found = findall(
        r"^\s*[\(|\[]*([\(\[\)\]\,\;\.eE\+\-\d\s]+)[\)|\]]*\s*"
            r"(\w+[\w\d\s\/\^\*\-\.]*)*$",
        s
    )
    if found is None:
        return None
    # Return result with largest number of components
    value = max(
        [np.fromstring(found[0][0], sep=sep) for sep in [' ', ',', ';']],
        key=lambda x: len(x)
    )
    return u.Quantity(
        value=value if len(value) > 1 else float(value),
        unit=found[0][1]
    )


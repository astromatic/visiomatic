"""
Quantity module tests
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

from typing import Annotated

from astropy import units as u
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import pytest

from visiomatic.server.config import quantity

def test_QuantityAnnotation():
    """
    Test Quantity annotations
    """
    class Coordinates(BaseModel): 
        lat: Annotated[ 
            u.Quantity, quantity.QuantityAnnotation(
                "deg",
                ge=-90.*u.deg,
                le=90.*u.deg
            ) 
        ] 
        lon: Annotated[u.Quantity, quantity.QuantityAnnotation("deg")] 
        alt: Annotated[u.Quantity, quantity.QuantityAnnotation("km")] 
    # The following instantiation should validate 
    coord = Coordinates(lat="39.905 deg", lon="-75.166 deg", alt="12 m")
    assert coord
    assert coord.model_dump()
    assert coord.model_dump(mode="json")
    assert coord.model_dump_json()
    # The following instantiations should NOT validate 
    with pytest.raises(Exception):
        coord = Coordinates(lat="99.905 deg", lon="-75.166 deg", alt="12 m")
    with pytest.raises(Exception):
        coord = Coordinates(lat="-99.905 deg", lon="-75.166 deg", alt="12 m")
    with pytest.raises(Exception):
        coord = Coordinates(lat="-99.905 deg", lon="-75.166 deg", alt="12")
    with pytest.raises(Exception):
        coord = Coordinates(
        lat="[39.905, 38.2] deg",
        lon="-75.166 deg",
        alt="12 m"
    )
    # The following instantiation using dictionaries should validate
    assert Coordinates(
        lat={'value': 39.905, 'unit': "deg"},
        lon={'value': -75.166, 'unit': "deg"},
        alt={'value': 12., 'unit': "m"}
    )
    # The following instantiation using dictionaries should NOT validate
    with pytest.raises(Exception):
        coord = Coordinates(
            lat={'value': 39.905},
            lon={'value': -75.166, 'unit': "deg"},
            alt={'value': 12., 'unit': "m"}
        )


def test_AnnotatedQuantity():
    """
    Test annotated quantity pseudo Pydantic-field
    """
    class Settings(BaseSettings): 
        size: quantity.AnnotatedQuantity( 
            short='S', 
            description="an arbitrary length", 
            default=10. * u.m,
            gt=1. * u.micron, 
            lt=1. * u.km,
            min_shape=(2,),
            max_shape=(2,)
        ) 
    # The following instantiation should validate 
    assert Settings(size="[3., 4.] cm")
    # The following instantiations should NOT validate 
    with pytest.raises(Exception):
        s = Settings(size="[3., 4.] deg")
    with pytest.raises(Exception):
        s = Settings(size="[0.001, 4.] mm")
    with pytest.raises(Exception):
        s = Settings(size="[3., 4.] au")
    with pytest.raises(Exception):
        s = Settings(size="3. cm")
    with pytest.raises(Exception):
        s = Settings(size="[3., 4., 5.] cm")


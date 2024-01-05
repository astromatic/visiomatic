"""
Image module tests
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

import pytest

from visiomatic.server import config

from visiomatic.server import image


def test_ImageModel():
    assert image.ImageModel(
        size = [2000, 1024, 3],
        dataslice = [[1, 2000, 1], [1, 1024, 1]],
        detslice = [[1, 2000, 1], [1, 1024, 1]],
        min_max = [[0.123,3.21],[-5.4321,100.],[0., 10.]],
        header = {
            "SIMPLE": True,
            "BITPIX": -32,
            "NAXIS": 2,
            "NAXIS1": 2000,
            "NAXIS2": 1024,
            "NAXIS3": 3,
            "EXTEND": True
        }
    ) 
    with pytest.raises(Exception):
        image.ImageModel(size=[2000, 1024, 3])


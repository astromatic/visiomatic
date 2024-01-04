"""
Image tiling module tests
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

import pytest

from visiomatic.server import config

from visiomatic.server import tiled

def test_Pixel():
    assert tiled.Pixel(128, 129, (1.1, 2.2))
    assert tiled.Pixel(x=128, y=129, values=(1.1, 2.2))
    with pytest.raises(Exception):
        assert tiled.Pixel(x=128, values=(1.1, 2.2))


def test_ProfileModel():
    assert tiled.ProfileModel(profile=((128, 129, (1.1, 2.2)),))
    assert tiled.ProfileModel(profile=tuple((tiled.Pixel(128, 129, (1.1, 2.2)),)))
    with pytest.raises(Exception):
        tiled.ProfileModel(profile=((128, 129, (1.1, 2.2))))

def test_get_data_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_data_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.data.np"


def test_get_object_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_object_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.pkl"
    

def test_get_tiles_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_tiles_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.tiles.np"


def test_get_image_filename():
    prefix = "/cache/%2Ftmp%2Ftest.fits"
    assert tiled.get_image_filename(prefix) == "/tmp/test.fits"



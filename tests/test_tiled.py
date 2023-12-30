"""
Image tiling module tests
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

from visiomatic.server import config

from visiomatic.server.tiled import (
    get_data_filename,
    get_image_filename,
    get_object_filename,
    get_tiles_filename
)

def test_get_data_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = get_data_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.data.np"


def test_get_object_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = get_object_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.pkl"
    

def test_get_tiles_filename():
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = get_tiles_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.tiles.np"


def test_get_image_filename():
    prefix = "/cache/%2Ftmp%2Ftest.fits"
    assert get_image_filename(prefix) == "/tmp/test.fits"


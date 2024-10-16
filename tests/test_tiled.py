"""
Image tiling module tests
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

from os.path import join

from astropy.io import fits
import numpy as np
import pytest

from visiomatic.server import config

from visiomatic.server import tiled

from .fixures import tmp_cachedir, tmp_image

def test_PixelValueModel():
    """
    Test instantiation and validation of the PixelValueModel pydantic model.
    """
    assert tiled.PixelValueModel(values=[1.1, 2.2])
    assert tiled.PixelValueModel(values=[-0.1, None])
    with pytest.raises(Exception):
        assert tiled.PixelValueModel(values=1.1)


def test_PixelModel():
    """
    Test instantiation and validation of the PixelModel pydantic model.
    """
    assert tiled.PixelModel(x=128, y=129, values=[1.1, 2.2])
    assert tiled.PixelModel(x=128, y=129, values=[-0.1, None])
    with pytest.raises(Exception):
        assert tiled.PixelModel(x=128, values=[1.1, 2.2])


def test_ProfileModel():
    """
    Test instantiation and validation of the ProfileModel pydantic model.
    """
    assert tiled.ProfileModel(
        profile=[
            tiled.PixelModel(x=128, y=129, values=[1.1, 2.2])
        ]
    )
    assert tiled.ProfileModel(
        profile=[
            tiled.PixelModel(x=128, y=129, values=[-0.1, None])
        ]
    )
    with pytest.raises(Exception):
        tiled.ProfileModel(
            profile=[
                tiled.PixelModel(y=129, values=[1.1, 2.2])
            ]
        )


def test_get_data_filename():
    """
    Test retrieval of data mosaic from original image filename.
    """
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_data_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.data.np"


def test_get_object_filename():
    """
    Test retrieval of tiled object from original image filename.
    """
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_object_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.pkl"
    

def test_get_tiles_filename():
    """
    Test retrieval of tiled multiresolution mosaic filename
    from original image filename.
    """
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_tiles_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert  result == "/cache/%2Ftmp%2Ftest.fits.tiles.np"


def test_get_image_filename():
    """
    Test retrieval of original image filename from encoded prefix.
    """
    prefix = "/cache/%2Ftmp%2Ftest.fits"
    assert tiled.get_image_filename(prefix) == "/tmp/test.fits"


def test_tiled(tmp_image, tmp_cachedir):
    """
    Test tile object and data initialization.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    data = tiled_image.get_data()
    # Check that the standard deviation of the data is close to 1.
    assert 0.9 < np.std(data) < 1.1
    # A second time to pick up data from the cached object
    assert np.all(
        tiled_image.get_data() == tiled.pickledTiled(tmp_image).get_data()
    )


def test_get_tile_raster(tmp_image, tmp_cachedir):
    """
    Test tile raster retrieval at two different resolution levels.
    """
    tiled_image = tiled.pickledTiled(tmp_image)
    raster = tiled_image.get_tile_raster(0, 0, channel=1)
    assert np.any(raster != tiled_image.get_tile_raster(1, 0, channel=1))


def test_get_encoded_tile(tmp_image, tmp_cachedir):
    """
    Test tile raster retrieval and encoding.
    """
    tiled_image = tiled.pickledTiled(tmp_image)
    tile = tiled_image.get_encoded_tile(0, 0)
    # A second time to pick up the cached encoded tile
    assert np.all(tiled_image.get_encoded_tile(0, 0) == tile)
    # Check that it differs from another  encoded tile
    assert np.any(tiled_image.get_encoded_tile(1, 0) != tile)


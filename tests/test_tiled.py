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


def test_get_object_filename():
    """
    Test retrieval of tiled object from original image filename.
    """
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_object_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert result == "/cache/%2Ftmp%2Ftest.fits.pkl"
    

def test_get_data_filename():
    """
    Test retrieval of data mosaic from original image filename.
    """
    cache_dir = config.settings["cache_dir"]
    config.settings["cache_dir"] = "/cache"
    filename = "/tmp/test.fits"
    result = tiled.get_data_filename(filename)
    config.settings["cache_dir"] = cache_dir
    assert result == "/cache/%2Ftmp%2Ftest.fits.data.np"


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
    assert result == "/cache/%2Ftmp%2Ftest.fits.tiles.np"


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
    # Wrong filename
    with pytest.raises(Exception):
        assert tiled.pickledTiled("do_not_exist")


def test_delTiled(tmp_image, tmp_cachedir):
    """
    Test tiling of tiled object and data.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    assert tiled.delTiled(tmp_image) is None


def test_get_iipheaderstr(tmp_image, tmp_cachedir):
    """
    Test legacy IIP header retrieval.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    assert "IIP:1.0" in tiled_image.get_iipheaderstr()


def test_get_tile_raster(tmp_image, tmp_cachedir):
    """
    Test tile raster retrieval at two different resolution levels.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    # First tile with default settings
    raster = tiled_image.get_tile_raster(0, 0, channel=1)
    assert np.any(raster != tiled_image.get_tile_raster(1, 0, channel=1))
    # Non-gray colormap should generate RGB data (3 channels)
    raster = tiled_image.get_tile_raster(0, 0, channel=1, colormap='jet')
    assert raster.shape[2] == 3
    # Color mix should generate RGB data (3 channels)
    raster = raster = tiled_image.get_tile_raster(0, 0, mix=((1, 0.5, 0.5, 0.5),))
    assert raster.shape[2] == 3


def test_get_encoded_tile(tmp_image, tmp_cachedir):
    """
    Test encoded tile (e.g., JPEG) retrieval and encoding.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    tile = tiled_image.get_encoded_tile(0, 0)
    # A second time to pick up the cached encoded tile
    assert np.all(tiled_image.get_encoded_tile(0, 0) == tile)
    # Check that it differs from another  encoded tile
    assert np.any(tiled_image.get_encoded_tile(1, 0) != tile)


def test_get_encoded_region(tmp_image, tmp_cachedir):
    """
    Test encoded region (e.g., JPEG) retrieval and encoding.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    # Use overflowed coordinates to test for clipping
    region = tiled_image.get_encoded_region([(-1,-3), (2261,3255)], binning=1)
    # Check that it differs from another  encoded tile
    assert np.any(
        tiled_image.get_encoded_region([(4,11), (264,263)], binning=2) != region)
    # Check that inconsistent coordinates trigger exception
    with pytest.raises(Exception):
        assert tiled_image.get_encoded_region([(500,11), (26,263)], binning=1)


def test_get_pixel_values(tmp_image, tmp_cachedir):
    """
    Test pixel value retrieval.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    # Get pixel value at the first image pixel
    val = tiled_image.get_pixel_values((1), (1,1)).values[0]
    # Check that the pixel value is different at a different position
    assert tiled_image.get_pixel_values((1), (1,2)).values[0] != val
    # Check that pixel values outside the raster area are None
    assert tiled_image.get_pixel_values((1), (-1, 10)).values[0] == None
    assert tiled_image.get_pixel_values((1), (10000,20000)).values[0] == None


def test_get_profiles(tmp_image, tmp_cachedir):
    """
    Test image profile retrieval.
    """
    config.settings["cache_dir"] = tmp_cachedir
    tiled_image = tiled.pickledTiled(tmp_image)
    assert tiled_image.get_profiles((1,), (1,4), (101,420))


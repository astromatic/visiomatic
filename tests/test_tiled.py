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

def test_PixelValueModel():
    assert tiled.PixelValueModel(values=[1.1, 2.2])
    assert tiled.PixelValueModel(values=[-0.1, None])
    with pytest.raises(Exception):
        assert tiled.PixelValueModel(values=1.1)


def test_PixelModel():
    assert tiled.PixelModel(x=128, y=129, values=[1.1, 2.2])
    assert tiled.PixelModel(x=128, y=129, values=[-0.1, None])
    with pytest.raises(Exception):
        assert tiled.PixelModel(x=128, values=[1.1, 2.2])


def test_ProfileModel():
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


@pytest.fixture(scope='session')
def tmp_cachedir(tmp_path_factory) -> str:
    """
    Generate a tempory cache directory for the whole testing session.

    Returns
    -------
    cache_dir: str
        Temporary cache directory name.
    """
    return str(tmp_path_factory.mktemp('cache'))


@pytest.fixture(scope='session')
def tmp_image(tmp_path_factory) -> str:
    """
    Generate a tempory test image for the whole testing session.

    Returns
    -------
    image_filename: str
        Test image filename.
    """
    # A pair of prime numbers as image dimensions make things more fun!
    shape = (983, 1061)
    data = np.random.random(shape)
    hdu = fits.PrimaryHDU(data)
    image_filename = str(join(tmp_path_factory.getbasetemp(), 'test.fits'))
    hdu.writeto(image_filename)
    return image_filename


def test_tiled(tmp_image, tmp_cachedir):
    config.settings["cache_dir"] = tmp_cachedir
    assert tiled.pickledTiled(tmp_image)


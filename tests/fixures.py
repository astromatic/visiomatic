"""
Global fixures for tests.
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

from os.path import join

from astropy.io import fits
import numpy as np
import pytest


@pytest.fixture(scope='session', autouse=True)
def tmp_cachedir(tmp_path_factory) -> str:
    """
    Generate a tempory cache directory for the whole testing session.

    Returns
    -------
    cache_dir: str
        Temporary cache directory name.
    """
    return str(tmp_path_factory.mktemp('cache'))


@pytest.fixture(scope='session', autouse=True)
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
    rng = np.random.default_rng()
    data = rng.normal(size=shape)
    hdu = fits.PrimaryHDU(data)
    image_filename = str(join(tmp_path_factory.getbasetemp(), 'test.fits'))
    hdu.writeto(image_filename)
    return image_filename


@pytest.fixture(autouse=True)
def tmp_config_filename(tmp_path_factory) -> str:
    """
    Generate a tempory configuration filename.

    Returns
    -------
    config_dir: str
        Temporary configuration directory name.
    """
    return str(join(tmp_path_factory.mktemp('config'), 'test.conf'))



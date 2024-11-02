"""
App module tests
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

from fastapi.testclient import TestClient
import pytest

from visiomatic.server import app, config
from .fixures import tmp_cachedir, tmp_image


def test_create_app():
    """
    Test creation of the app.
    """
    assert app.create_app()


def test_api(tmp_cachedir, tmp_image):
    """
    Test web API endpoints.
    """
    config.settings["cache_dir"] = tmp_cachedir
    config.image_filename = tmp_image
    appli = app.create_app()
    client = TestClient(appli)

    # Banner
    response = client.get("/api")
    assert response.status_code == 200 and "VisiOmatic" in response.text

    # Image info
    response = client.get("/api?FIF=test.fits&INFO")
    assert response.status_code == 200 \
        and response.json()['header']['NAXIS1'] == 1061

    # Image obj info (deprecated)
    response = client.get("/api?FIF=test.fits&obj")
    assert response.status_code == 200 and "Max-size:1061" in response.text

    # Image pixel value should be 0. within 10 sigma
    response = client.get("/api?FIF=test.fits&CHAN=1&VAL=101,99")
    assert response.status_code == 200 \
        and -10. < response.json()['values'][0] < 10.

    # Image pixel value should be 0. within 10 sigma
    response = client.get("/api?FIF=test.fits&CHAN=1&VAL=101,99")
    assert response.status_code == 200 \
        and -10. < response.json()['values'][0] < 10.

    # Image profile
    response = client.get("/api?FIF=test.fits&CHAN=1&PFL=7,4:106,34")
    assert response.status_code == 200 \
        and len(response.json()['profile']) == 100

    # Image tile with default settings
    response = client.get("/api?FIF=test.fits&CHAN=1&JTL=1,0")
    assert response.status_code == 200

    # Image tile in color mode
    response = client.get("/api?FIF=test.fits&MIX=1:0.5,0.5,0.5&JTL=1,0")
    assert response.status_code == 200

    # Image region with MINMAX settings
    response = client.get(
        "/api?FIF=test.fits&MINMAX=1:-3.,3.&RGN=10,20:109,89&BIN=1"
    )
    assert response.status_code == 200


def test_web_client(tmp_cachedir, tmp_image):
    """
    Test web client endpoint.
    """
    config.settings["cache_dir"] = tmp_cachedir
    config.image_filename = tmp_image
    appli = app.create_app()
    client = TestClient(appli)
    response = client.get("/")
    assert response.status_code == 200 and "VisiOmatic" in response.text


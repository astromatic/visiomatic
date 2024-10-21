"""
Tests for the "visiomatic" command script
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

import subprocess
import pytest


def test_cmd():
    """
    Test command output (very basic right now).
    """
    # Version output
    out = subprocess.Popen(
        ["visiomatic", "--version"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    assert "VisiOmatic" in str(out.stdout.read())

    # Help output
    out = subprocess.Popen(
        ["visiomatic", "--help"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    assert "FITS image filename" in str(out.stdout.read())


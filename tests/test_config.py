"""
Tests for the configuration module
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

from typing import Annotated

import pytest

from visiomatic.server.config import Config, AppSettings

from .fixures import tmp_config_filename

def test_Config(tmp_config_filename):
    """
    Test Config instantiation and methods.
    We skip argument parsing for now, which causes issues with pytest.
    """
    conf = Config(AppSettings(), config_file=tmp_config_filename)
    # Save a configuration file
    conf.save_config(tmp_config_filename)
    # Load it
    assert conf.parse_config(tmp_config_filename)
    # Grouped output should be a dict and should contain at least one group.    
    g = conf.grouped_dict()
    assert isinstance(g, dict) and len(g) > 0
    # Flat output should be a dict and should contain at least one pair.
    f = conf.flat_dict()
    assert isinstance(f, dict) and len(f) > 0
    # Schema output should be a dict and should contain at least one pair.
    s = conf.schema()
    assert isinstance(s, dict) and len(s) > 0
    # JSON Schema output should be a string and should contain at least one pair.
    j = conf.schema_json()
    assert isinstance(j, str) and len(j) > 0


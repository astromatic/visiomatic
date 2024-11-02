"""
Package-wide definitions
"""
# Copyright UParisSaclay/CEA/CFHT/CNRS
# Licensed under the MIT license

from re import match
from os import path
from pathlib import Path
from importlib.metadata import metadata
from importlib.resources import files
import sys

import platformdirs

# Package information
# Get the current package name, quick and (very) dirty
name = __name__.split(".")[-2]
meta = metadata(name)
title = meta['Name']
version = meta['Version']
summary = meta['Summary']
description = meta['Description']
url = meta['Project-URL'].rsplit(", ")[-1]

# Contact
authors = meta['Author-email'].split(", ")
if authors:
    m = match(
        r'\"?\s*(?P<name>[A-Za-zÀ-ÖØ-öø-ÿ\s]*?)\s*(?:\(\s*'
        r'(?P<affiliation>[^)]+?)\s*\))?\"?\s*<\s*(?P<email>[^>]+?)\s*>?\s*$',
        authors[0]
    )
    contact = m.groupdict() if m is not None else {
        'name': '', 'affiliation': '', 'email': ''
    }

# License
#license = meta['License']
license_name = "MIT"
license_url = "https://spdx.org/licenses/MIT.html"

# Package source directory
src_dir = path.dirname(path.abspath(__file__))

# Package root directory
root_dir = Path(str(files(name)))

# Default configuration file
config_file = path.join(platformdirs.user_config_dir(name), f"{name}.conf")

# Default cache dir
cache_dir = platformdirs.user_cache_dir(name)

# Platform
platform  = sys.platform
isonlinux = sys.platform.startswith('lin')


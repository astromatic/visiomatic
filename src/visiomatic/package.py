"""
Package-wide definitions
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT license

from os import path
from pathlib import Path
from importlib.metadata import metadata
import sys

import platformdirs

# Package information
# Get the current package name, quick and (very) dirty
name = __name__.split(".")[-2]
title = "VisiOmatic"
meta = metadata(name)
version = meta["Version"]
summary = meta["Summary"]
description = meta["Description"]
url = meta["Project-URL"].rsplit(", ")[-1]

# Contact
contact_name = "Emmanuel Bertin"
contact_affiliation = "CFHT/CNRS/IAP/SorbonneU"
contact_email = "bertin@cfht.hawaii.edu"

# License
license_name = "MIT"
license_url = "https://spdx.org/licenses/MIT.html"

# Package source directory
src_dir = path.dirname(path.abspath(__file__))

# Package root directory
root_dir = Path(src_dir).parent.parent

# Default configuration file
config_file = path.join(platformdirs.user_config_dir(name), "visiomatic.conf")

# Default cache dir
cache_dir = platformdirs.user_cache_dir(name)

# Platform
platform  = sys.platform
isonlinux = sys.platform.startswith('lin')


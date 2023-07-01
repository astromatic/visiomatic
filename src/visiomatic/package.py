"""
Package-wide definitions
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT license

from importlib.metadata import metadata

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

# This is where the Python code is
root_dir = "src/visiomatic"


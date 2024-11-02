"""
Data caching module tests
"""
# Copyright CFHT/CNRS/CEA/UParisSaclay
# Licensed under the MIT licence

import pytest

from visiomatic.server import cache

def test_LRUCache():
    """
    Test instantiation and calls to LRUCache.
    """
    cached = cache.LRUCache(lambda x: x + 10., maxsize=2)
    assert cached(1.) == 11.
    assert cached(2.) == 12.
    assert cached(3.) == 13.
    del cached[0]
    del cached


def test_LRUSharedRWCache():
    """
    Test instantiation and calls to LRUSharedRWCache.
    """
    # First, the shared version (if supported on the platform)
    cached = cache.LRUSharedRWCache(lambda x: x + x, maxsize=2)
    assert cached("a")[0] == "aa"
    assert cached("b")[0] == "bb"
    assert cached("c")[0] == "cc"
    del cached
    # Unshared version
    cached = cache.LRUSharedRWCache(lambda x: x + x, shared=False, maxsize=2)
    assert cached("a")[0] == "aa"
    assert cached("b")[0] == "bb"
    assert cached("c")[0] == "cc"
    cached.remove()
    del cached


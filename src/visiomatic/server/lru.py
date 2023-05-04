"""
Custom, shared LRU cache modules
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import os
from collections import OrderedDict
from multiprocessing import RLock
#from prwlock import RWLock

class LRUCache:
    """
    Simple, custom Least Recently Used (LRU) cache Class
    
    Parameters
    ----------
    func: class or func
        Function result or class instantiation to be cached.
    maxsize: int, optional
        Maximum size of the cache.
    """
    def __init__(self, func, maxsize=8):
        self.cache = OrderedDict()
        self.func = func
        self.maxsize = maxsize

    def __call__(self, *args):
        """
        Cache or recover earlier cached result/object.
        If the number of cached items exceeds maxsize then the least recently
        used item is dropped from the cache.

        Parameters
        ----------
        args: any
            Hashable arguments to the function/constructor.

        Returns
        -------
        result: any
            Cached item.

        :meta public:
        """
        if args in self.cache:
            self.cache.move_to_end(args)
            return self.cache[args]
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        result = self.func(*args)
        self.cache[args] = result
        return result



class LockedLRUCache:
    """
    Custom Least Recently Used (LRU) cache Class with locking mechanism.
    
    Parameters
    ----------
    func: class or func
        Function result or class instantiation to be cached.
    maxsize: int, optional
        Maximum size of the cache.
    call: bool, optional
        If True, caching is done by calling the function or class constructor
        with the cache=True option.
    """
    def __init__(self, func, maxsize=8):
        self.cache = OrderedDict()
        self.func = func
        self.maxsize = maxsize
        self.call = call
        self.lock = Rlock()

    def __call__(self, *args):
        """
        Cache or recover earlier cached result/object.
        If the number of cached items exceeds maxsize then the least recently
        used item is dropped from the cache.

        Parameters
        ----------
        args: any
            Hashable arguments to the function/constructor.

        Returns
        -------
        result: any
            Cached item.

        :meta public:
        """
        self.lock.acquire()
        if args in self.cache:
            self.cache.move_to_end(args)
            return self.func(*args, cache=True, lock=self.lock)
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        result = self.func(*args, cache=False, lock=self.lock)
        self.cache[args] = result
        return result

    

"""
Custom LRU cache module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from collections import OrderedDict
import os

worker_id = os.getpid()

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
        result = self.func(*args)
        self.cache[args] = result
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        return result


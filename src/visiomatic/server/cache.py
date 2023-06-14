"""
Custom caches and utilities
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import os
from collections import OrderedDict
from time import time_ns
from typing import Union

from posix_ipc import Semaphore, O_CREAT
from UltraDict import UltraDict

from .. import package

class LRUMemCache:
    """
    Custom Least Recently Used (LRU) memory cache.

    Parameters
    ----------
    func: class or func
        Function result or class instantiation to be cached.
    maxsize: int, optional
        Maximum size of the cache.
    """
    def __init__(self, func, maxsize: int=8):
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


class LRUSharedRWLockCache:
    """
    Custom, dictionary-based, Least Recently Used (LRU) reader-writer lock cache
    shareable across processes.

    Parameters
    ----------
    name: str, optional
        Name of the lock cache.
    maxsize: int, optional
        Maximum size of the cache.
    """
    def __init__(self, name: Union[str, None]=None, maxsize: int=8):
        self.name = name if name else f"lrucache_{os.getppid()}"
        self.cache = UltraDict(name=self.name, create=None, shared_lock=True)
        self.maxsize = maxsize


    def __call__(self, *args):
        """
        Create or recover a shared reader-writer lock (e.g., Raynal 2012).

        Parameters
        ----------
        args: any
            Hashable arguments to the cache dictionary.

        Returns
        -------
        result: lock
            Reader-Writer lock associated with args.

        :meta public:
        """
        hargs = hex(0xffffffffffffffff & hash(args))
        with self.cache.lock:
            if hargs in self.cache:
                lock, time = self.cache[hargs]
                lock.acquire_read()
            else:
                # Test if we're reaching the cache limit
                if len(self.cache) >= self.maxsize:
                    # Find least recently used
                    oldest = min(self.cache, key=lambda k: self.cache[k][1])
                lock = SharedRWLock(hargs)
                lock.acquire_write()
            # Finally update the shared version
            self.cache[hargs] = lock, time_ns()
            return lock


class SharedRWLock:
    """
    Custom reader-writer lock shareable across processes

    See Raynal, Michel (2012), Concurrent Programming: Algorithms, Principles,
    and Foundations, Springer.    
    
    Parameters
    ----------
    name: str, optional
        Name of the lock.
    """
    def __init__(self, name="RWLock"):
        self.name = name
        self._rlock_name = f"{package.title}_{name}.r.lock"
        self._glock_name = f"{package.title}_{name}.g.lock"
        rlock = Semaphore(self._rlock_name, O_CREAT, initial_value=1)
        glock = Semaphore(self._glock_name, O_CREAT, initial_value=1)
        self.b = 0
        self.write = False


    def acquire_read(self):
        """
        Acquire lock in read mode.
        """
        with Semaphore(self._rlock_name) as rlock:
            self.b += 1
            if self.b == 1:
                Semaphore(self._glock_name).acquire()
        self.write = False


    def acquire_write(self):
        """
        Acquire lock in write mode.
        """
        Semaphore(self._glock_name).acquire()
        self.write = True


    def release(self):
        """
        Release acquired lock.
        """
        glock = Semaphore(self._glock_name)
        if self.write:
            glock.release()
        else:
            with Semaphore(self._rlock_name) as rlock:
                self.b -= 1
                if self.b == 0:
                    glock.release()


    def __delete__(self, instance):
        """
        Destroy semaphores used by the RW lock.

        :meta public:
        """
        Semaphore(self._glock_name).unlink()
        Semaphore(self._rlock_name).unlink()



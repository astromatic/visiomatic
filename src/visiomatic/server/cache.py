"""
Custom caches and utilities
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import os
from collections import OrderedDict
from typing import Union

from posix_ipc import Semaphore, O_CREAT
from UltraDict import UltraDict

from .. import package

class MemCache:
    """
    Simple, custom Least Recently Used (LRU) cache Class
    
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


class SharedDictRWLock:
    """
    Custom, dictionary-based reader-writer locks shareable across processes
    Raynal, Michel (2012). Concurrent Programming: Algorithms, Principles, and Foundations. Springer.    
    Parameters
    ----------
    name: str, optional
        Name of the lock dictionary.
    maxsize: int, optional
        Maximum size of the dictionary.
    """
    def __init__(self, name: Union[str, None]=None, maxsize: int=8):
        self.name = name if name else f"lrucache_{os.getppid()}"
        self.dict = UltraDict(name=self.name)
        self.maxsize = maxsize


    def __call__(self, *args):
        """
        Create or recover a shared reader-writer lock (e.g., Raynal 2012).

        Parameters
        ----------
        args: any
            Hashable arguments to the dictionary

        Returns
        -------
        result: lock
            Reader-Writer lock associated with args.

        :meta public:
        """
        with self.dict.lock:
            if args in self.dict:
                lock = self.dict[args]
                lock.acquire_read()
            else:
                lock = SharedRWLock(args)
                lock.acquire_write()
            # Finally update the shared version
            self.dict[args] = lock
            return lock


class SharedRWLock:
    """
    Custom reader-writer lock shareable across processes
    
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



"""
Custom caches and utilities
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from collections import OrderedDict
from hashlib import md5
from os import getppid
from signal import (
    signal,
    SIGABRT,
    SIGILL,
    SIGINT,
    SIGKILL,
    SIGSEGV,
    SIGTERM
)
from time import time_ns
from typing import Callable, Union

from posix_ipc import Semaphore, O_CREAT
from UltraDict import UltraDict

from .. import package


class LRUCache:
    """
    Custom Least Recently Used (LRU) memory cache.

    Parameters
    ----------
    func: class or func
        Function result or class instantiation to be cached.
    maxsize: int, optional
        Maximum size of the cache.
    """
    def __init__(self, func: Callable, maxsize: int=8):
        self.cache = OrderedDict()
        self.func = func
        self.maxsize = maxsize

    def __call__(self, *args, **kwargs) -> any:
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
        print(args)
        if args in self.cache:
            self.cache.move_to_end(args)
            return self.cache[args]
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        result = self.func(*args, **kwargs)
        self.cache[args] = result
        return result


class LRUSharedCache:
    """
    Custom Least Recently Used (LRU) memory cache shareable across processes.

    Parameters
    ----------
    func: class or func
        Function result or class instantiation to be cached.
    maxsize: int, optional
        Maximum size of the cache.
    """
    def __init__(self, func: Callable, maxsize: int=8):
        self.cache = OrderedDict()
        self.func = func
        self.maxsize = maxsize

    def __call__(self, *args, **kwargs) -> any:
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
        print(args)
        if args in self.cache:
            self.cache.move_to_end(args)
            return self.cache[args]
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        result = self.func(*args, **kwargs)
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
    removecall: func, optional
        Callback function for removing cached data.
    """
    def __init__(
            self,
            name: Union[str, None]=None,
            maxsize: int=8,
            removecall: Callable=None):
        self.name = name if name else f"rwlockcache_{getppid()}"
        self._lock_name = self.name + ".lock"
        lock = Semaphore(self._lock_name, O_CREAT, initial_value=1)
        with Semaphore(self._lock_name) as lock:
            self.cache = UltraDict(name=self.name, create=None, shared_lock=True)
        # Delete semaphores when process is aborted.
        for sig in (
            SIGABRT,
            SIGILL,
            SIGINT,
            SIGSEGV,
            SIGTERM):
            signal(sig, self.remove)
        self.removecall = removecall
        self.maxsize = maxsize


    def __call__(self, *args) -> 'SharedRWLock':
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
        # We use MD5 instead of hash() as output is consistent across processes
        m = md5()
        for s in args:
            m.update(s.encode())
        hargs = m.hexdigest()
        with self.cache.lock:
            if hargs in self.cache:
                # Reference already in cache: lock in read mode
                lock, firstarg, time = self.cache[hargs]
                lock.acquire_read()
            else:
                # Reference not in cache: lock in write mode
                # after testing if we're reaching the cache limit
                if len(self.cache) >= self.maxsize and self.removecall:
                    # Find LRU cache entry
                    oldest = min(self.cache, key=lambda k: self.cache[k][2])
                    lock = SharedRWLock(oldest)
                    lock.acquire_write()
                    # Apply remove callback to first argument stored in cache
                    self.removecall(self.cache[oldest][1])
                    del self.cache[oldest]
                    lock.release()
                lock = SharedRWLock(hargs)
                lock.acquire_write()
                firstarg = args[0]
            # Finally update the shared version
            self.cache[hargs] = lock, firstarg, time_ns()
            return lock


    def remove(self, *args) -> None:
        """
        Remove semaphores.
        """
        try:
            Semaphore(self._lock_name).unlink()
        except:
            pass



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
        self._rlock_name = f"{package.name}_{name}.r.lock"
        self._glock_name = f"{package.name}_{name}.g.lock"
        rlock = Semaphore(self._rlock_name, O_CREAT, initial_value=1)
        glock = Semaphore(self._glock_name, O_CREAT, initial_value=1)
        self.b = 0
        self.write = False
        for sig in (
            SIGABRT,
            SIGILL,
            SIGINT,
            SIGSEGV,
            SIGTERM):
            signal(sig, self.remove)


    def acquire_read(self) -> None:
        """
        Acquire lock in read mode.
        """
        with Semaphore(self._rlock_name) as rlock:
            self.b += 1
            if self.b == 1:
                Semaphore(self._glock_name).acquire()
        self.write = False


    def acquire_write(self) -> None:
        """
        Acquire lock in write mode.
        """
        Semaphore(self._glock_name).acquire()
        self.write = True


    def release(self) -> None:
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


    def __delete__(self, instance) -> None:
        """
        Clean up leftovers from the RW lock.

        :meta public:
        """
        self.remove()


    def remove(self, *args) -> None:
        """
        Remove files used by the RW lock semaphores.
        """
        try:
            Semaphore(self._glock_name).unlink()
            Semaphore(self._rlock_name).unlink()
        except:
            pass


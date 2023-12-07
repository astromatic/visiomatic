"""
Custom caches and utilities
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from collections import OrderedDict
from hashlib import md5
from multiprocessing.shared_memory import SharedMemory
from os import getpid, getppid
from signal import (
    signal,
    SIGABRT,
    SIGILL,
    SIGINT,
    SIGKILL,
    SIGSEGV,
    SIGTERM
)
from sys import platform
from time import time_ns
from typing import Callable, Union

import numpy as np

from .. import package

# Shared version of cache only available on Linux
if package.isonlinux:
    from posix_ipc import Semaphore, O_CREAT
    from UltraDict import UltraDict


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
        if args in self.cache:
            self.cache.move_to_end(args)
            return self.cache[args]
        if len(self.cache) > self.maxsize:
            self.cache.popitem(0)
        result = self.func(*args, **kwargs)
        self.cache[args] = result
        return result

    def __delitem__(self, key) -> None:
        """
        Delete a specific cache entry.

        :meta public:
        """
        if key in self.cache:
            del self.cache[key]



class LRUSharedRWCache:
    """
    Custom, dictionary-based, Least Recently Used (LRU) reader-writer lockable
    cache, shareable across processes.

    Parameters
    ----------
    func: Callable
        Function to be cached.
    name: str, optional
        Name of the lock cache.
    maxsize: int, optional
        Maximum size of the cache.
    removecall: func, optional
        Callback function for removing cached data.
    """
    def __init__(
            self,
            func: Callable,
            name: Union[str, None] = None,
            maxsize: int = 8,
            shared: bool = True,
            removecall: Callable = None):
        self.func = func
        # Shared cache option only available on Linux
        self.shared = shared and package.isonlinux
        self.name = name if name else f"rwlockcache_{getppid()}"
        self._lock_name = self.name + ".lock"
        if self.shared:
            with Semaphore(self._lock_name, O_CREAT, initial_value=1) as lock:
                self.cache = UltraDict(name=self.name, create=None, shared_lock=True)
            self.locks = LRUCache(func=SharedRWLock, maxsize=maxsize)
        else:
            self.cache = {}
        self.results = LRUCache(func=func, maxsize=maxsize)
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


    def __call__(self, *args, **kwargs):
        """
        Get or recover a cached entry.

        Parameters
        ----------
        args: any
            Hashable arguments to the cache dictionary.
        kwargs: any
            Hashable keyworded arguments to the cache dictionary.

        Returns
        -------
        result: 
            Cached output.
        lock: :class:`SharedRWLock` or None
            Reader-Writer lock associated with args, or None if cache is
            unshared.
        msg:
            "OK" or error string in case of an exception.

        :meta public:
        """
        return self.call_shared(*args, **kwargs) if self.shared \
            else self.call_unshared(*args, **kwargs)


    def call_unshared(self, *args, **kwargs):
        """
        Get or recover a cached entry, not shared with other processes.

        Parameters
        ----------
        args: any
            Hashable arguments to the cache dictionary.
        kwargs: any
            Hashable keyworded arguments to the cache dictionary.

        Returns
        -------
        result:
            Cached output.
        lock:
            Reader-Writer lock associated with args, set to None.
        msg:
            "OK" or error string in case of an exception.

        :meta public:
        """
        # We use MD5 instead of hash() as output is consistent across processes
        m = md5()
        for s in args:
            m.update(s.encode())
        hargs = m.hexdigest()
        write = False
        remove = False
        if hargs in self.cache:
            # Reference already in cache: get time
            self.cache[hargs] = [None, time_ns()]
        else:
            # Reference not in cache: test if we're reaching the cache limit
            if len(self.cache) >= self.maxsize:
                # Find LRU cache entry
                oldest = min(self.cache, key=lambda k: self.cache[k][1])
                ofirstarg = self.cache[oldest][0]
                # Delete cache entry
                del self.cache[oldest]
                # Will have to do remove call if callback function available
                remove = self.removecall
                # Cache an empty content just to mark territory
                write = True
                firstarg = args[0]
                self.cache[hargs] = [firstarg, time_ns()]
                # Prepare write operation on new data
        if remove:
            # Apply remove callback to first argument stored in cache (filename)
            self.removecall(ofirstarg)
        # Finally try to update the shared version
        if write:
            try:
                result = self.func(*args, **kwargs)
            except Exception as e:
                # Uh-oh! things went wrong: remove cache entry and lock
                # and return None
                del self.cache[hargs]
                result = None
                msg = e.args[0]
            else:
                self.cache[hargs] = [firstarg, time_ns()]
                msg = "OK"
        else:
            try:
                result = self.results(*args, **kwargs)
            except Exception as e:
                result = None
                msg = e.args[0]
            else:
                self.cache[hargs] = [None, time_ns()]              
                msg = "OK"

        return result, msg, None


    def call_shared(self, *args, **kwargs):
        """
        Get or recover a cached entry, not shared with other processes.

        Parameters
        ----------
        args: any
            Hashable arguments to the cache dictionary.
        kwargs: any
            Hashable keyworded arguments to the cache dictionary.

        Returns
        -------
        result:
            Cached output.
        lock:
            Reader-Writer lock associated with args.
        msg:
            "OK" or error string in case of an exception.

        :meta public:
        """
        # We use MD5 instead of hash() as output is consistent across processes
        m = md5()
        for s in args:
            m.update(s.encode())
        hargs = m.hexdigest()
        write = False
        remove = False
        lock = self.locks(hargs)
        with self.cache.lock:
            if hargs in self.cache:
                # Reference already in cache: lock in read mode
                self.cache[hargs][1] = time_ns()
            else:
                # Reference not in cache: lock in write mode
                # after testing if we're reaching the cache limit
                if len(self.cache) >= self.maxsize:
                    # Find LRU cache entry
                    oldest = min(self.cache, key=lambda k: self.cache[k][1])
                    olock = self.locks(oldest[1])
                    ofirstarg = self.cache[oldest][0]
                    # Acquire write lock on (now defunct) LRU cache entry
                    olock.acquire_write()
                    # Delete cache entry
                    del self.cache[oldest]
                    # Will have to do remove call if callback function available
                    remove = self.removecall
                lock.acquire_write()
                write = True
                # Cache an empty content just to mark territory
                firstarg = args[0]
                self.cache[hargs] = [firstarg, time_ns()]
                # Prepare write operation on new data
        if remove:
            # Apply remove callback to first argument stored in cache (filename)
            self.removecall(ofirstarg)
            olock.release_write()
            del self.locks[oldest]
            del olock
        # Finally try to update the shared version
        if write:
            try:
                result = self.func(*args, **kwargs)
            except Exception as e:
                # Uh-oh! things went wrong: remove cache entry and lock
                # and return None
                with self.cache.lock:
                    del self.cache[hargs]
                del self.locks[hargs]
                result = None
                msg = e.args[0]
            else:
                with self.cache.lock:
                    self.cache[hargs] = [firstarg, time_ns()]
                msg = "OK"
            lock.release_write()
            lock.acquire_read()
        else:
            lock.acquire_read()
            try:
                result = self.results(*args, **kwargs)
            except Exception as e:
                result = None
                msg = e.args[0]
            else:
                with self.cache.lock:
                    self.cache[hargs][1] = time_ns()                
                msg = "OK"

        return result, msg, lock


    def remove(self, *args) -> None:
        """
        Remove semaphores.
        """
        try:
            Semaphore(self._lock_name).close()
        except:
            pass
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
        with Semaphore(self._rlock_name) as rlock:
            # We use a try block and SharedMemory flags O_CREX
            # to initialize the shared variable only once
            try:
                self.shared_mem = SharedMemory(
                    name=f"{package.name}_{name}.b.shm",
                    create=True,
                    size=np.array([0], dtype=np.int32).nbytes
                )
                self.b = np.ndarray(
                    [1],
                    dtype=np.int32,
                    buffer=self.shared_mem.buf
                )
                b.fill(0)
            except:
                self.shared_mem = SharedMemory(
                    name=f"{package.name}_{name}.b.shm",
                    create=False,
                    size=np.array([0], dtype=np.int32).nbytes
                )
                self.b = np.ndarray(
                    [1],
                    dtype=np.int32,
                    buffer=self.shared_mem.buf
                )

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
            self.b[0] += 1
            if self.b[0] == 1:
                Semaphore(self._glock_name).acquire()


    def acquire_write(self) -> None:
        """
        Acquire lock in write mode.
        """
        Semaphore(self._glock_name).acquire()


    def release_read(self) -> None:
        """
        Release acquired read lock.
        """
        with Semaphore(self._rlock_name) as rlock:
            self.b[0] -= 1
            if self.b[0] == 0:
                Semaphore(self._glock_name).release()


    def release_write(self) -> None:
        """
        Release acquired write lock.
        """
        Semaphore(self._glock_name).release()


    def __delete__(self, instance) -> None:
        """
        Clean up leftovers from the RW lock.

        :meta public:
        """
        self.remove()


    def remove(self, *args) -> None:
        """
        Remove files used by the RW lock semaphores and shared memory.
        """
        try:
            Semaphore(self._glock_name).unlink()
            Semaphore(self._rlock_name).unlink()
            self.shared_mem.close()
            self.shared_me
        except:
            pass
        try:
            self.shared_mem.close()
            self.shared_mem.unlink()
        except:
            pass




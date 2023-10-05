"""
Custom caches and utilities
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from collections import OrderedDict
from hashlib import md5
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
            func: Callable,
            name: Union[str, None]=None,
            maxsize: int=8,
            removecall: Callable=None):
        self.func = func
        self.name = name if name else f"rwlockcache_{getppid()}"
        self._lock_name = self.name + ".lock"
        with Semaphore(self._lock_name, O_CREAT, initial_value=1) as lock:
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


    def __call__(self, *args, **kwargs):
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
        write = False
        remove = False
        with self.cache.lock:
            print(getpid(), ": Entering dict lock ......")
            if hargs in self.cache:
                # Reference already in cache: lock in read mode
                print(getpid(), ": Reading cached data")
                result, lock, firstarg, time = self.cache[hargs]
                self.cache[hargs] = result, lock, firstarg, time
                print(getpid(), ": Done reading cached data")
            else:
                # Reference not in cache: lock in write mode
                # after testing if we're reaching the cache limit
                print(getpid(), ": Acquiring write lock")
                lock = SharedRWLock(hargs)
                lock.acquire_write()
                print(getpid(), ": Entering write lock ......")
                # Cache an empty content just to mark territory
                firstarg = args[0]
                self.cache[hargs] = None, lock, firstarg, time_ns()
                write = True
                if len(self.cache) >= self.maxsize:
                    # Find LRU cache entry
                    print(getpid(), ": Managing cache limit")
                    oldest = min(self.cache, key=lambda k: self.cache[k][2])
                    olock = SharedRWLock(oldest)
                    oref = self.cache[oldest][1]
                    # Delete cache entry
                    del self.cache[oldest]
                    # Acquire write lock on (now defunct) LRU cache entry
                    olock.acquire_write()
                    # Will have to do remove call if callback function available
                    remove = self.removecall
                    print(getpid(), ": Done managing cache limit")
                # Prepare write operation on new data
            print(getpid(), ": ...... Leaving dict lock")
        if remove:
            # Apply remove callback to first argument stored in cache (filename)
            self.removecall(oref)
            olock.release_write()
            del olock
        # Finally update the shared version
        if write:
            print(getpid(), ": Writing...")
            result = self.func(*args, **kwargs)
            print(getpid(), ": Writing done!")
            with self.cache.lock:
                print(getpid(), ": Re-entering dict lock ......")
                print(getpid(), ": Caching...")
                print(result, lock, firstarg, time_ns())
                self.cache[hargs] = result, lock, firstarg, time_ns()
                print(getpid(), ": Caching done!")
            print(getpid(), ": ...... Re-leaving dict lock")
            lock.release_write()
            print(getpid(), ": ...... Leaving write lock")
            lock.acquire_read()
            print(getpid(), ": Re-acquiring read lock ......")
        else:
            lock.acquire_read()
            print(getpid(), ": Re-acquiring read lock ......")
            if result is None:
                with self.cache.lock:
                    print(getpid(), ": Re-entering dict lock ......")
                    print(getpid(), ": Re-reading cache")
                    result, lock, firstarg, time = self.cache[hargs]
                    self.cache[hargs] = result, lock, firstarg, time_ns()                  
                print(getpid(), ": ...... Re-leaving dict lock")
            print(getpid(), ": ...... Re-releasing read lock")

        return result, lock


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
            glock = Semaphore(self._glock_name)
            print("Semaphore read value:", glock.value)
            if glock.value == 0:
                glock.acquire()


    def acquire_write(self) -> None:
        """
        Acquire lock in write mode.
        """
        print("Semaphore write value:", Semaphore(self._glock_name).value)
        Semaphore(self._glock_name).acquire()


    def release_read(self) -> None:
        """
        Release acquired read lock.
        """
        with Semaphore(self._rlock_name) as rlock:
            glock = Semaphore(self._glock_name)
            print("Semaphore read release value:", glock.value)
            if glock.value == 0:
                glock.release()


    def release_write(self) -> None:
        """
        Release acquired write lock.
        """
        print("Semaphore write release value:", Semaphore(self._glock_name).value)
        Semaphore(self._glock_name).release()


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


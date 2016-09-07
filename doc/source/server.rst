.. _server_installation:

=====================================
Server installation and configuration
=====================================

|IIPImage| is a FastCGI application and as such it requires a web server to run.

This section describes how to install and configure the |IIPImage| server from scratch. Further information can be found on the official `IIPImage webpage <http://iipimage.sourceforge.net/documentation/server/>`_. 

Pre-requisites
==============

Hardware
--------

The |IIPImage| server (|iipsrv|) is meant to run on one or several server machines, with multiple CPU cores. The "astronomy-oriented" version of |iipsrv| is largely vectorized but it is single threaded; multiple CPU cores are taken advantage of through multiple instances spawned by the web server.

|iipsrv|  operates on large data files (image data cubes), which can be as large as several Terabytes. The performance of the ``astro`` version is often I/O-limited, especially when it comes to latency. It is therefore important that the data files be located on a fast storage system, with low access times. Ideally this will be an enterprise-level array of SSDs. The lower performance of slower devices, such as spinning disks, can partially be compensated with random access memory by taking advantage of the operating system caching of file operations, as well as the built-in |iipsrv| caching mechanisms. In all cases, the more memory available for caching there is on the system, the more responsive the server will be under heavy load.

In what follows, we will assume that the image data reside in the
``/raid/array/`` directory.

Operating System
----------------

This installation guide focuses on Linux. Nevertheless |IIPImage| has been designed to be cross-platform and has been successfully tested on Linux, Sun Solaris, Mac OS X and Windows. 

Software
--------

Before starting the installation, one should make sure that "development packages" (coming with header files) of the following libraries have been installed on the server:

* `LibFCGI v2.4+ <http://www.fastcgi.com/>`_
* `LibJPEG Turbo v1.2+ <http://libjpeg-turbo.virtualgl.org/>`_, or `libJPEG <http://libjpeg.sourceforge.net/>`__
* `LibTIFF v4.0+ <http://www.libtiff.org/>`_
* `zLib v1.2+ <http://www.zlib.net/>`_

Note that |iipsrv| relies on the `BigTIFF <http://www.bigtiff.org>`_ format for managing image data files larger than 2GB. If BigTIFF support is not included in the |LibTIFF| packages available for your Linux distribution (e.g., because it is too old), a manual installation of |LibTIFF| v4.0+ may be necessary.

Downloading |iipsrv|
====================

The source package for this version is available on `GitHub <https://github.com/cmarmo/iipsrv-astro>`_. We strongly recommend against installing `the master version of IIPImage <http://github.com/ruven/iipsrv>`_ at this stage, as it has not yet been optimized for working with the |VisiOmatic| client.

Installing |iipsrv|
===================

1. Clone the project:

  .. code-block:: console

    $ git clone https://github.com/cmarmo/iipsrv-astro.git

2. Enter the project directory:

  .. code-block:: console

    $ cd iipsrv-astro

3. Generate configuration files for compilation and installation:

  .. code-block:: console

    $ sh autogen.sh
    $ ./configure

  * Although the command above should work in most cases, the configure script offers many customization options (see ``./configure --help``), including the possibility to change the paths where include and library files are located. For instance for managing manual installations of the TIFF library:

  .. code-block:: console

     $ ./configure --with-tiff-includes=<DIR> --with-tiff-libraries=<DIR>

  * The Intel compiler, :program:`icc`,  is able to vectorize loops containing transcendental functions and generally provides superior performance in |iipsrv|, compared to the GNU compiler. If :program:`icc` is installed on your system, the following configuration line will generate an executable optimized for a wide range of machines based on INTEL processors:

  .. code-block:: console

      $ ./configure CXX=icc CXXFLAGS="-O3 -axSSSE3,SSE4.1,SSE4.2,AVX,CORE-AVX2,CORE-AVX-I -no-prec-div -unroll -static-intel"

4. Compile and install:

  .. code-block:: console

    $ make
    $ sudo cp src/iipsrv.fcgi /<your>/<fcgi-bin>/<directory>

Web server configuration
========================

The real life performance of |iipsrv| for serving tiles critically depends on the HTTP web server configuration. It depends even more on the HTTP server itself, especially in high concurrency environments.

Assessing server performance
----------------------------

In :cite:`Bertin2015`, four HTTP server packages --- |Apache|_ v2.4.1, |lighttpd|_ v1.4.35, |NGINX|_ v1.4.7 and |OpenLiteSpeed|_ v1.2.7 --- were benchmarked with |iipsrv|. :numref:`iipsrv-servercomp` shows how efficiently each of these servers responds to bursts of tile queries for various levels of concurrency (the number of queries in each burst). Tile queries were simulated using a `modified version <https://github.com/philipgloyne/apachebench-for-multi-url>`_ of the `Apache Benchmarking tool <http://httpd.apache.org/docs/2.4/programs/ab.html>`_ benchmarking tool on a local machine, connected through a 10GbE link.
The result is expressed in terms of throughput (the number of tiles per seconds) and latency (the average time it takes for tiles to be returned). Perfect server behaviour would consist of constant throughput, and latency that increases linearly with concurrency beyond some threshold, as queries are queued inside the server pipeline.

.. _iipsrv-servercomp:

.. figure:: figures/concurrency_vs_server.*
  :width: 100%

  |IIPImage-astro| tile-serving throughput and latency as a function of concurrency for four different HTTP servers running on the same 12-core Linux system.

As can be seen, HTTP server packages behave very differently in this test. If we set the limit for acceptable latency to 1 second, we see that a 12-core system is able to manage bursts of up to 2,000 simultaneous queries with |OpenLiteSpeed|, which corresponds to about 100 users frantically browsing through the image. With |Apache|, these numbers are ten times lower, and both throughput and latency behave much more erratically.

All HTTP server packages were configured so as to maximize tile serving performance. Although some aspects may have not been fully optimized, |OpenLiteSpeed| comes out as the clear winner in this test. This is why we recommend it for running |IIPImage|. Nevertheless, in the sections below we also provide configuration guides for all four packages.

|Apache|
--------
The `mod_fastcgi <http://www.fastcgi.com/mod_fastcgi/docs/mod_fastcgi.html>`_ module must be installed and enabled. A directory containing FastCGI programs should be created and readable by |Apache| processes. Make sure that your |Apache| configuration file (or the configuration file for the FCGI module) contains the following lines
::

  LoadModule fastcgi_module /path/to/apachemodules/mod_fastcgi.so
  # Create a directory for the iipsrv binary
  ScriptAlias /fcgi-bin/ "/path/to/fcgi/directory/fcgi-bin/"
  #
  # Set the options on that directory
  <Directory "/path/to/fcgi/directory/fcgi-bin/">
   AllowOverride None
   Options None
   # Syntax for access is different in Apache 2.4 - uncomment appropriate version
   # Apache 2.2
   #   Order allow,deny
   #   Allow from all
   #
   # Apache 2.4
   Require all granted
  </Directory>

Finally, the |iipsrv| configuration file, ``iipsrv.conf`` must be copied in the |Apache| configuration directory (e.g., ``/etc/httpd/conf.d/``). The following ``iipsrv.conf`` features typical settings for a 12-core machine:
::

  # Set our environment variables for the IIP server
  FcgidInitialEnv VERBOSITY "0"
  FcgidInitialEnv LOGFILE "/tmp/iipsrv.log"
  FcgidInitialEnv MAX_IMAGE_CACHE_SIZE "100"
  FcgidInitialEnv JPEG_QUALITY "90"
  FcgidInitialEnv MAX_CVT "3000"
  FcgidInitialEnv MEMCACHED_SERVERS "localhost"
  FcgidInitialEnv FILESYSTEM_PREFIX "/raid/iip/"
  # Define the idle timeout as unlimited and the number of # processes we want
  FcgidIdleTimeout -1
  FcgidMaxProcessesPerClass 12

|lighttpd|
----------
|lighttpd| comes with built-in FastCGI support. To configure |iipsrv|, add in your |lighttpd| directory an ASCII file ``iipsrv.conf`` containing
::

  fastcgi.server = ( "/fcgi-bin/iipsrv.fcgi" =>
	(( "host" => "127.0.0.1",
		"port" => 9000,
		"check-local" => "disable",
		"min-procs" => 1,
		"max-procs" => 12,
		"bin-path" => server_root + "/fcgi-bin/iipsrv.fcgi",
		"bin-environment" => (
			"LOGFILE" => log_root + "/iipsrv.log",
			"VERBOSITY" => "3",
			"MAX_IMAGE_CACHE_SIZE" => "100",
			"FILENAME_PATTERN" => "_pyr_",
			"JPEG_QUALITY" => "90",
			"MAX_CVT" => "3000",
			"MEMCACHED_SERVERS" => "localhost",
			"FILESYSTEM_PREFIX" => "/raid/iip/"
		)
	))
  )

For best performances edit the |lighttpd| server settings in ``/etc/lighttpd/lighttpd.conf``::

  server.use-ipv6 = "disable" 
  server.document-root = server_root + "/html" 
  server.max-fds = 300000
  server.stat-cache-engine = "fam" 
  server.max-connections = 100000
  server.max-keep-alive-idle = 4
  server.max-keep-alive-requests = 4

Then restart the |lighttpd| server.

|NGINX|
-------

|OpenLiteSpeed|
---------------
The latest stable version of the |OpenLiteSpeed| web server (|lsws|) can be downloaded from http://open.litespeedtech.com/. On most machines, installing |lsws| from the source package is as simple as
::

  $ ./configure
  $ make
  $ sudo make install

On RedHat-like systems (e.g., RedHat, Fedora, CentOS,...), the |OpenLiteSpeed| web server is started with
::

  $ service lsws start

|OpenLiteSpeed| comes with a graphical web interface which is by default accessible on port 7080 of the server. The default administrator login and password are ``admin`` and ``123456``.
Any change to the server configuration made in the interface requires applying a "Graceful Restart" (follow instructions on the web page).

Configuring |OpenLiteSpeed| for |iipsrv| starts by adding a new "virtual host", or modifying the default one that comes with |OpenLiteSpeed| (:numref:`iipsrv-vhost`).

.. _iipsrv-vhost:

.. figure:: figures/iipsrv-vhost.*
  :width: 100%

  A single "virtual host" is sufficient for operating |iipsrv|.

The virtual host menu has several tabs. For this FastCGI application we are mostly concerned with the ``Basic``, ``External App`` and ``Context`` tabs.

In the ``Basic`` tab,  one should change the ``Virtual Host Name`` field to, e.g., *iipsrv-vhost*, and set ``ExtApp Set UID Mode`` to ``DocRoot UID`` (see :numref:`iipsrv-basic`).

.. _iipsrv-basic:

.. figure:: figures/iipsrv-basic.*
  :width: 100%

  Example of a configuration for the ``Basic`` tab in the ``Virtual Host`` section.

The ``External App`` tab is where the FastCGI executable must be defined and where it can be fine-tuned. :numref:`iipsrv-app` shows an example of a configuration which is appropriate for a 12-core server (``Max Connections`` = 12 and ``Instances`` = 12) with high throughput (``Connection Keepalive Timout`` = 5).

.. _iipsrv-app:

.. figure:: figures/iipsrv-app.*
  :width: 100%

  Example of a configuration for the ``External App`` tab in the ``Virtual Host`` section.

Finally, an FCGI entry should be added in the ``Context`` tab (:numref:`iipsrv-context`).

.. _iipsrv-context:

.. figure:: figures/iipsrv-context.*
  :width: 100%

  Example of a FastCGI entry in the ``Context`` tab of the ``Virtual Host`` section.


|iipsrv| configuration and testing
==================================

The `IIPImage webpage <http://iipimage.sourceforge.net/documentation/server/>`_ gives a description of all the configuration parameters known to |iipsrv|. The following parameters require particular attention:

* ``FILESYSTEM_PREFIX`` is a prefix added by ``ipsrv`` to the image data path for all queries. **For security reasons, it is strongly advised** to set ``FILESYSTEM_PREFIX`` to a path which does not directly or indirectly lead to a system or user directory, or to any file data that must remain unaccessible to the users.

* ``VERBOSITY`` should be set to 0 for performance reasons.

* ``CORS`` manages `Cross Origin Resource Sharing <http://en.wikipedia.org/wiki/Cross-origin_resource_sharing>`_. It must be set to ``*`` if the tiles are to be accessible to any client (such as 3rd party applications) outside of those provided by the web server itself.

* ``MAX_IMAGE_CACHE_SIZE`` sets the size of the |iipsrv| JPEG image cache (in MB), which is allocated in memory for every instance. Typical values range from 100 to 2000, depending on the amount of memory in the server, and the number of |iipsrv| instances.

* ``MEMCACHED_SERVERS`` can be used to specify a comma-separated list of IP addresses with optional port numbers (e.g., ``127.0.0.1:8888``) that provide caching capabilities using the `Memcached <http://memcached.org>`_ protocol. It is strongly advised to use Memcached in all cases where high traffic loads involving majoritarily identical tile queries are to be expected, e.g., for public outreach applications.

Once the server installed and configured, pointing a web browser to the |iipsrv| FCGI URL without any argument (e.g.,``http://myurl/fcgi-bin/iipsrv.fcgi``) should return a web page similar to that of :numref:`iipsrv-page`.

.. _iipsrv-page:

.. figure:: figures/iipsrv-page.*
  :width: 100%

  Web page returned by the |iipsrv| FCGI in the absence of arguments.

System configuration
====================

Server performance also depends on system settings. For maximizing server responsiveness under high concurrency, we recommend following the prescriptions of :cite:`Veal2007`. Some appropriate ``sysctl.conf`` are given on the `G-WAN website <http://gwan.com/en_apachebench_httperf.html>`_ and were used with great success during |iipsrv| tests. They are reproduced below::

  fs.file-max = 300000
  net.core.netdev_max_backlog = 400000
  net.core.optmem_max = 10000000
  net.core.rmem_default = 10000000
  net.core.rmem_max = 10000000
  net.core.somaxconn = 100000
  net.core.wmem_default = 10000000
  net.core.wmem_max = 10000000
  net.ipv4.conf.all.rp_filter = 1
  net.ipv4.conf.default.rp_filter = 1
  net.ipv4.ip_local_port_range = 1024 65535
  net.ipv4.tcp_congestion_control = bic
  net.ipv4.tcp_ecn = 0
  net.ipv4.tcp_max_syn_backlog = 12000
  net.ipv4.tcp_max_tw_buckets = 2000000
  net.ipv4.tcp_mem = 30000000 30000000 30000000
  net.ipv4.tcp_rmem = 30000000 30000000 30000000
  net.ipv4.tcp_sack = 1
  net.ipv4.tcp_syncookies = 1
  net.ipv4.tcp_timestamps = 1
  net.ipv4.tcp_wmem = 30000000 30000000 30000000    

  # optionally, avoid TIME_WAIT states on localhost no-HTTP Keep-Alive tests:
  #    "error: connect() failed: Cannot assign requested address (99)"
  # On Linux, the 2MSL time is hardcoded to 60 seconds in /include/net/tcp.h:
  # #define TCP_TIMEWAIT_LEN (60*HZ)
  # The option below is safe to use:
  net.ipv4.tcp_tw_reuse = 1

  # The option below lets you reduce TIME_WAITs further
  # but this option is for benchmarks, NOT for production (NAT issues)
  # net.ipv4.tcp_tw_recycle = 1

  # Increase nf_conntrack
  net.netfilter.nf_conntrack_max = 262144

.. include:: refs.rst


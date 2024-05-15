.. File setup.rst

.. include:: global.rst

.. _Section-Installation:

=====
Setup
=====

Installation and configuration are necessary only if you intend to run |VisiOmatic| locally or as a web server.
If you are only interested in using the default web client as a remote user, you may jump directly to the :ref:`web interface section <Section-HowToUse>`.

Installation
============

The easiest way to install |VisiOmatic| is through |pip|_:

.. code-block:: console

    $ pip install visiomatic

If the command above does not work and your operating system still comes with Python 2, try :program:`pip3` instead of |pip|.

On recent systems, the vanilla ``pip install`` command may trigger an "externally managed environment" error, due to `a change in policy <https://peps.python.org/pep-0668/#implementation-notes>`_ to avoid conflicts between the Python package manager and that of your own operating system.
In this case, you should first `set a virtual environment <https://docs.python.org/3/library/venv.html>`_ to run |VisiOmatic|, or even better, use the |pipx|_ package that will automatically do it for you:

.. code-block:: console

    $ pipx install visiomatic


Configuration
=============

|VisiOmatic| can operate in a wide variety of environments and is highly configurable.

The command

.. code-block:: console

    $ visiomatic --help

returns a list of all the available options and their default values.
There are three successive levels at which the settings are applied (and overridden) :

#. Built-in default configuration.
#. The configuration file.
#. Command line options.

Default configuration
---------------------

The default configuration is defined `within the code itself <https://github.com/astromatic/visiomatic/blob/main/src/visiomatic/server/settings.py>`_.
The default values are those returned by the ``visiomatic --help`` command.
They are generally appropriate for local use on a "regular" machine.
 
The configuration file
----------------------

A configuration file may be used to store settings that will be applied anytime |VisiOmatic| is started.
The default location of the configuration file depends on the platform and is defined by the |platformdirs|_ library: ``~/.config/visiomatic/visiomatic.conf`` (Linux), ``~/Library/Application Support/visiomatic/visiomatic.conf`` (macOS), or ``C:\Documents and Settings\<User>\Application Data\Local Settings\visiomatic\visiomatic.conf`` (Windows).
The path to the configuration file may be changed using the ``-c`` / ``--config`` command line argument, for example:

.. code-block:: console

    $ visiomatic --config /etc/visiomatic.conf

Editing an existing configuration file is easier than writing one from scratch.
To this aim, the command

.. code-block:: console

    $ visiomatic -s

may be used to write (or replace) a default configuration file at the default location.

Command line options
--------------------

All configuration file settings may also be changed using arguments to the :program:`visiomatic` command; however the command line syntax differs slightly from that of the configuration file.
For instance, to set the port number to 8010 from the config file one would use the line :param:`port = 8010`, whereas from the command line one could type

.. code-block:: console

    $ visiomatic --port=8010

or

.. code-block:: console

    $ visiomatic --port 8010

or even

.. code-block:: console

    $ visiomatic -p 8010

and boolean command line options do not require to be followed by the :param:`True` value.
For example, the following command runs |VisiOmatic| with the cache cleared at startup:

.. code-block:: console

    $ visiomatic --clear_cache

The same option may be abbreviated

.. code-block:: console

    $ visiomatic -C


Configuration settings
----------------------

Configuration settings are grouped into five sections: `host`, `image`, `server`, `engine`, and `cache`.

Host options
~~~~~~~~~~~~

The Host options allow you to specify how and where the Visiomatic service runs.

:param:`host` `host`
  This option sets the host name or IP address where the service will run.
  If not specified, it defaults to :param:`localhost`.

:param:`port` `integer`
  Define the port number for the service (<65536).
  The default port number is :param:`8009`.
  Note that without administrator priviledges, only values equal to or above 1024 are allowed.

:param:`root_path` `path`
  Configure the |ASGI|_ root path, which is an advanced setting for specific deployment environments.
  The default value is the empty string.

:param:`access_log`
  Set this option to :param:`True` to display the access log, which can be useful for monitoring requests to the server.

:param:`reload`
  This option enables auto-reloading of the server when code changes are detected, which can be convenient for development purposes.
  Note that enabling this option turns off multiple workers.

:param:`workers` `integer`
  Specify the number of worker processes to handle requests.
  By default, this is set to :param:`4`.

Image options
~~~~~~~~~~~~~

Image options control the default settings for image processing and presentation.

:param:`brightness` `float`
  Set the default brightness for images (between -100.0 and +100.0).
  The default value is :param:`0.0`, indicating no change from the original brightness.

:param:`contrast` `float`
  Adjust the default contrast of images (between 0.01 and 10.0).
  The default value is :param:`1.0`, meaning no change from the original contrast.

:param:`color_saturation` `float`
  Define the default color saturation level (between 0.0 and 5.0).
  The default is :param:`1.5`, which increases the saturation.

:param:`gamma` `float`
  Set the default `gamma correction <https://en.wikipedia.org/wiki/Gamma_correction>`_ value (between 0.1 and 5.0).
  The default is `2.2`, which is appropriate for `sRGB <https://en.wikipedia.org/wiki/SRGB>`_ displays.

:param:`quality` `integer`
  Determine the default compression quality for images, expressed as a percentage.
  The default value is `97%`, balancing quality and bandwidth requirements.

:param:`tile_size` `shape`
  Specify the shape of image tiles used for processing, in pixels (between 1 and 4096 per axis).
  Note that the vertical size comes first, following the Python convention for image arrays.
  The default tile size is :param:`256,256`.

Server options
~~~~~~~~~~~~~~

Server options configure various aspects of the web server and its endpoints.

:param:`api_path` `path`
  Set the endpoint URL for the web service API.
  The default path is :param:`/api`.

:param:`banner_template` `filename`
  Specify the HTML template file for the service banner.
  The default template is `banner.html`.

:param:`base_template` `filename`
  Define the HTML template file for the web client interface.
  The default is `base.html`.

:param:`client_dir` `directory`
  Point to the directory containing the web client code, including styles and media files.
  By default, this is set to :param:`<install_dir>/client`.

:param:`data_dir` `directory`
  Set the root directory for data storage.
  The default is the current directory (:param:`.`).

:param:`doc_dir` `directory`
  Specify the directory where HTML documentation is built and stored.
  The default is :param:`<install_dir>/doc/build/html`.

:param:`doc_path` `path`
  Set the endpoint URL for accessing HTML documentation.
  The default path is :param:`/manual`.

:param:`extra_dir` `directory`
  Provide an additional directory for storing extra data.
  The default is the current directory (:param:`.`).

:param:`no_browser`
  Use this option to prevent the automatic opening of a web browser when an image filename is provided.

:param:`template_dir` `directory`
  Define the directory containing HTML templates.
  The default is :param:`<install_dir>/templates`.

:param:userdoc_url `URL`
  Set the URL endpoint for user documentation.
  The default URL is :param:`/manual/interface.html`.

Engine options
~~~~~~~~~~~~~~

Engine options configure the internal processing engine.

:param:`thread_count` `integer`
  Specify the number of threads the engine uses.
  The default is :param:`10`, allowing for parallel processing of 10 tasks.

Cache options
~~~~~~~~~~~~~

Cache options manage how image data is cached for improved performance.

:param:`cache_dir` `directory`
  Set the directory where image cache files are stored.
  The default depends on the platform; on Linux, it is :param:`~/.cache/visiomatic`.

:param:`clear_cache`
  Enable this option to clear the image cache on startup, ensuring no cached data from previous runs is used.

:param:`max_cache_image_count` `integer`
  Define the maximum number of images to store in the disk cache.
  The default is :param:`100`.

:param:`max_cache_tile_count` `integer`
  Set the maximum number of image tiles to keep in the memory cache.
  The default is :param:`1000`.

:param:`max_open_files` `integer`:
  Specify the maximum number of files that can be opened simultaneously (between 100 and 1,000,000).
  The default is :param:`10000`.

:param:`ultradict_cache_file` `filename`
  Define the file name for the pickled cache dictionary shared across processes.
  The default depends on the platform; on Linux it is `/dev/shm/visiomatic_cache_dict.pkl`.



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

.. code:: bash

    pip install visiomatic

If the command above does not work and your operating system still comes with Python 2, try :program:`pip3` instead of |pip|.

On recent systems, the vanilla ``pip install`` command may trigger an "externally managed environment" error, due to `a change in policy <https://peps.python.org/pep-0668/#implementation-notes>`_ to avoid conflicts between the Python package manager and that of your own operating system.
In this case, you should first `set a virtual environment <https://docs.python.org/3/library/venv.html>`_ to run |VisiOmatic|, or even better, use the |pipx|_ package that will automatically do it for you:

.. code:: bash

    pipx install visiomatic


Configuration
=============

|VisiOmatic| can operate in a wide variety of environments and is highly configurable.

The command

.. code:: bash

    visiomatic --help

returns a list of all the available settings and their default values.
There are three successive levels at which the settings are applied (and overridden) :

#. Built-in default configuration.
#. The configuration file.
#. Command line arguments.

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

.. code:: bash

    visiomatic --config /etc/visiomatic.conf

Editing an existing configuration file is easier than writing one from scratch.
To this aim, the command

.. code:: bash

    visiomatic -s

may be used to write (or replace) a default configuration file at the default location.

The configuration settings are regrouped in five different sections: `host`, `image`, `server`, `engine`, and `cache`.

host parameters
~~~~~~~~~~~~~~~


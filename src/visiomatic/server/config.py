"""
Configure application.
"""
# Copyright CEA/CFHT/CNRS/UParisSaclay
# Licensed under the MIT licence

from os import makedirs, path
from pathlib import Path
from sys import exit, modules
from time import localtime, strftime
from typing import Tuple
from argparse import ArgumentParser, SUPPRESS
from configparser import ConfigParser
from pydantic import ValidationError

from .. import package
from .settings import AppSettings


class Config(object):
    """
    Manage application settings in groups.

    Settings are stored as Pydantic fields.
    """
    def __init__(self, args: bool=True, config_file: str=package.config_file):

        self.settings = AppSettings()
        self.groups = tuple(self.settings.dict().keys())
        self.image_filename = None
        self.config_filename = config_file

        # Skip argument parsing and stuff if Sphinx or PyTest are involved
        if 'sphinx' in modules or 'pytest' in modules:
            return
        # Parse command line
        if args:
            args_dict = self.parse_args()
            if args_dict['version']:
                print(f"{package.title} {package.version}")
                exit(0)
            # Save configuration file if requested
            if args_dict['save_config']:
                # Create config dir if it does not exist
                makedirs(path.dirname(self.config_filename), exist_ok=True)
                self.save_config(self.config_filename)
                exit(0)
            self.config_filename = args_dict['config']

        # Parse configuration file
        if Path(self.config_filename).exists():
            config_dict = self.parse_config(self.config_filename)
            # Update settings from the config file
            self.update_from_dict(config_dict) 

        # Update settings from the command line (overriding config file values)
        if args:
            self.update_from_dict(args_dict)

        image_filename = args_dict['file']
        if Path(image_filename).exists():
            self.image_filename = image_filename
        else:
            exit(f"*Error*: {image_filename} not found!")


    def grouped_dict(self) -> dict:
        """
        Return a dictionary of all settings, organized in groups.

        Returns
        -------
        gdict: dict
            Dictionary of settings.
        """
        return self.settings.dict()


    def flat_dict(self) -> dict:
        """
        Return a flattened dictionary of all settings.

        Returns
        -------
        fdict: dict
            Dictionary of settings.
        """
        fdict = {}
        for group in self.groups:
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                fdict[setting] = settings[setting]
        return fdict


    def schema(self) -> dict:
        """
        Return a schema of the settings as a dictionary.

        Returns
        -------
        schema: dict
            Schema of the settings, as a dictionary.
        """
        return self.settings.schema()


    def schema_json(self, indent=2) -> str:
        """
        Return a schema of the settings as a JSON string.

        Parameters
        ----------
        indent: int
            Number of indentation spaces.

        Returns
        -------
        schema: str
            JSON schema of the settings.
        """
        return self.settings.schema_json(indent=indent)


    def parse_args(self) -> dict:
        """
        Return a dictionary of all settings, with values updated from the
        command line.

        Extra settings are ignored.

        Returns
        -------
        gdict: dict
            Dictionary of all settings, organized in groups.
        """
        config = ArgumentParser(
            description=f"{package.title} v{package.version} : {package.summary}"
        )
        # Add options not relevant to configuration itself
        config.add_argument(
            "-V", "--version",
            default=False,
            help="Return the version of the package and exit", 
            action='store_true'
        )
        config.add_argument(
            "-c", "--config",
            type=str, default=package.config_file,
            help=f"Configuration filename (default={package.config_file})", 
            metavar="FILE"
        )
        config.add_argument(
            "-s", "--save_config",
            default=False,
            help=f"Save a default {package.title} configuration file and exit",
            action='store_true'
        )
        config.add_argument(
            "file",
            default="",
            type=str,
            help="FITS image filename",
            nargs="?"
        )
        for group in self.groups:
            args_group = config.add_argument_group(group.title())
            settings = getattr(self.settings, group).schema()['properties']
            for setting in settings:
                props = settings[setting]
                arg = ["-" + props['short'], "--" + setting] \
                    if props.get('short') else ["--" + setting]
                default = props['default']
                if props['type']=='boolean':
                    args_group.add_argument(
                        *arg,
                        default=SUPPRESS,
                        help=props['description'], 
                        action='store_true'
                    )
                elif props['type']=='array':
                    deftype = type(default[0])
                    args_group.add_argument(
                        *arg,
                        default=SUPPRESS,
                        type=lambda s: tuple([deftype(val) for val in s.split(',')]),
                        help=f"{props['description']} (default={props['default']})"
                    )
                else:
                    args_group.add_argument(
                        *arg,
                        default=SUPPRESS,
                        type=type(default),
                        help=f"{props['description']} (default={props['default']})"
                    )  
        # Generate dictionary of args grouped by section
        fdict = vars(config.parse_args())
        gdict = {}
        # Command-line specific arguments
        gdict['version'] = fdict['version']
        gdict['config'] = fdict['config']
        gdict['save_config'] = fdict['save_config']
        gdict['file'] = fdict['file']
        for group in self.groups:
            gdict[group] = {}
            gdictg = gdict[group]
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                if setting in fdict:
                    gdictg[setting] = fdict[setting]
        return gdict


    def parse_config(self, filename: str) -> dict:
        """
        Return a dictionary of all settings, with values updated from a
        configuration file in INI format.

        Extra settings are ignored.

        Parameters
        ----------
        filename: str | ~pathlib.Path
            Configuration filename.

        Returns
        -------
        gdict: dict
            Dictionary of all settings, organized in groups.
        """
        config = ConfigParser(converters={})
        config.read(filename)
        gdict: dict = {}
        for group in self.groups:
            gdict[group] = {}
            gdictg = gdict[group]
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                if (value := config.get(group, setting, fallback=None)) is not None:
                    stype = type(settings[setting])
                    gdictg[setting] = tuple(
                        type(settings[setting][i])(val.strip()) \
                            for i, val in enumerate(value[1:-1].split(','))
                    )  if stype == tuple \
                        else value.lower() in ("yes", "true", "t", "1") if stype == bool \
                        else stype(value)
        return gdict


    def save_config(self, filename) -> None:
        """
        Save all settings as a configuration file in INI format.

        Extra settings are ignored.

        Parameters
        ----------
        filename: str | ~pathlib.Path
            Configuration filename.
        """
        config = ConfigParser()
        for group in self.groups:
            config[group] = {}
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                props = f"{settings[setting]}"
                config[group][setting] = props

        # Ask confirmation if file already exists
        if Path(filename).exists():
            user_input = input(
                f"This will overwrite {filename}! Continue? [y/N]"
            )
            if user_input.lower() not in ('y', 'yes'):
                return

        with open(filename, 'w') as config_file:
            config_file.write(f"; Default {package.title} configuration file\n")
            nowstr = strftime("%a, %d %b %Y %H:%M:%S %z", localtime())
            config_file.write(f"; {nowstr}\n")
            config.write(config_file)


    def update_from_dict(self, settings_dict) -> None:
        """
        Update internal settings based on a dictionary (in groups)

        Parameters
        ----------
        settings_dict: dict
            Input dictionary.
        """
        for group in self.groups:
            groupsettings = getattr(self.settings, group)
            groupsettings_dict = groupsettings.dict()
            settings = settings_dict[group]
            for setting in settings:
                vars(groupsettings).update({setting: settings_dict[group][setting]})
            try:
                groupsettings.model_validate(groupsettings.dict())
            except ValidationError as valid_exception:
                print(valid_exception)
                exit(1)
            except Exception as other_exception:
                print(other_exception)
                exit(1)

# Initialize global dictionary
# Set up settings by instantiating a configuration object
config = Config()
config_filename = None
image_filename = None
settings = config.flat_dict()
if 'sphinx' not in modules and 'pytest' not in modules:
    config_filename = config.config_filename
    image_filename = config.image_filename


"""
Manage application settings.
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from pathlib import Path
from argparse import ArgumentParser
from configparser import ConfigParser

from .. import package
from .config import AppSettings


class Settings(object):
    """
    Manage application settings in groups.

    Settings are stored as Pydantic fields.
    """
    def __init__(self):

        self.settings = AppSettings()
        self.groups = tuple(self.settings.dict().keys())
        # Parse command line
        args_dict = self.parse_args()
        # Parse config file
        config_filename = args_dict['config']
        if Path(config_filename).exists():
            config_dict = self.parse_config(config_filename)
        # Update settings
        # First, from the config file
        self.update_from_dict(config_dict) 
        # Second, from the command line
        self.update_from_dict(args_dict) 


    def dict(self) -> dict:
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
        config = ArgumentParser(description=package.description)
        config.add_argument(
            "-c", "--config",
            type=str, default="config/visiomatic.conf",
            help="Name of the VisiOmatic configuration file", 
            metavar="FILE"
        )
        for group in self.groups:
            args_group = config.add_argument_group(group.title())
            settings = getattr(self.settings, group).schema()['properties']
            for setting in settings:
                props = settings[setting]
                arg = ["-" + props['short'], "--" + setting] \
                    if props.get('short') else ["--" + setting]
                if props['type']=='boolean':
                    args_group.add_argument(
                        *arg,
                        default=props['default'],
                        help=props['description'], 
                        action='store_true'
                    )
                else:
                    args_group.add_argument(
                        *arg,
                        type=str,
                        default=props['default'],
                        help=f"{props['description']} (default={props['default']})"
                    )  
        # Generate dictionary of args grouped by section
        fdict = vars(config.parse_args())
        gdict = {}
        gdict['config'] = fdict['config']
        for group in self.groups:
            gdict[group] = {}
            gdictg = gdict[group]
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                gdictg[setting] = fdict[setting]
        return gdict


    def parse_config(self, filename) -> dict:
        """
        Return a dictionary of all settings, with values updated from a
        configuration file in INI format.

        Extra settings are ignored.

        Parameters
        ----------
        filename: str or Path
            Configuration filename.

        Returns
        -------
        gdict: dict
            Dictionary of all settings, organized in groups.
        """
        config = ConfigParser()
        config.read(filename)
        gdict = {}
        for group in self.groups:
            gdict[group] = {}
            gdictg = gdict[group]
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                if (value := config.get(group, setting, fallback=None)) != None:
                    gdictg[setting] = value
        return gdict


    def save_config(self, filename) -> None:
        """
        Save all settings as a configuration file in INI format.

        Extra settings are ignored.

        Parameters
        ----------
        filename: str or Path
            Configuration filename.
        """
        config = ConfigParser()
        for group in self.groups:
            config[group] = {}
            settings = getattr(self.settings, group).dict()
            for setting in settings:
                props = f"{settings[setting]}"
                config[group][setting] = props
        with open(filename, 'w') as config_file:
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
            settings = getattr(self.settings, group)
            settings = settings.parse_obj(settings_dict[group])


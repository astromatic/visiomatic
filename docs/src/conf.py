# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(1, os.path.abspath('../../src'))
import sphinx_rtd_theme
import adsarxiv

# -- Project information -----------------------------------------------------

project = 'VisiOmatic'
copyright = '2024 CEA/CFHT/CNRS/UParisSaclay'
author = 'Emmanuel Bertin, Hervé Bouy'

# The full version, including alpha/beta/rc tags
release = '3.0.5'


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.napoleon',
    'sphinx.ext.autodoc',
    'sphinx_js',
    'sphinx.ext.githubpages',
    'sphinx.ext.ifconfig',
    'sphinx.ext.intersphinx',
    'sphinx.ext.mathjax',
    'sphinx.ext.todo',
    'sphinx.ext.viewcode',
    'sphinxcontrib.autodoc_pydantic',
    'sphinxcontrib.bibtex'
]

# Add any paths that contain templates here, relative to this directory.
templates_path = ['../theme']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['global.rst', 'keys.rst', 'roles.rst']

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

numfig = True

smartquotes = False

# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'sphinx_rtd_theme'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['../theme']

# Trick for having ReadTheDocs read custom theme changes
def setup(app):
    app.add_css_file("css/custom.css")

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.
#
html_show_sphinx = False

# If true, "(C) Copyright ..." is shown in the HTML footer. Default is True.
#
html_show_copyright = True

mathjax3_config = {
    'tex': {
        'macros': {
            'trans': ['{#1}^\\intercal',1],
             'vec': ['\\boldsymbol{#1}',1],
             'oper': ['\\mathbf{#1}',1],
             'dvol': ['{\\rm d}^{#1}\\hspace{-2pt}#2', 2],
             'sinc': ['\\mbox{sinc}'],
             'esp': ['\\mbox{E}\\left\\{#1\\right\\}', 1]
        }
    }
}

# -- Options for LaTeX output ------------------------------------------------


latex_elements = {
    # The paper size ('letterpaper' or 'a4paper').
    #
    # 'papersize': 'letterpaper',
'papersize': 'letterpaper',

    # The font size ('10pt', '11pt' or '12pt').
    #
    # 'pointsize': '10pt',

    # Additional stuff for the LaTeX preamble.
    #
    # 'preamble': '',
'preamble': r'''
\newcommand{\DUrolecredits}{\footnotesize\color{lightgray}\newline}

\def\trans#1{{#1}^\intercal}
\def\vec#1{{\boldsymbol{#1}}}
\def\oper#1{\mathbf{#1}}
\def\dvol#1#2{{\rm d}^{#1}\hspace{-2pt}#2}
\def\sinc{\mbox{sinc}}
\def\esp#1{\mbox{E}\left\{#1\right\}}
''',
    # Latex figure (float) alignment
    #
    # 'figure_align': 'htbp',
}

# -- Extension configuration -------------------------------------------------

# -- Autodoc options ---------------------------------------------------------
# If true, the current module name will be prepended to all description
# unit titles (such as .. function::).
add_module_names = False
autodoc_member_order = 'bysource'
#autodoc_mock_imports = ['', '']

# -- Napoleon options---------------------------------------------------------
# Set return type to "inline".
napoleon_use_rtype = False

# -- Options for todo extension ----------------------------------------------

# If true, `todo` and `todoList` produce output, else they produce nothing.
todo_include_todos = True

# -- Options for intersphinx extension ---------------------------------------
intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
    'astropy': ('https://docs.astropy.org/en/stable', None),
    'numpy': ('https://numpy.org/doc/stable', None),
    'scipy': ('https://docs.scipy.org/doc/scipy', None)
}

# -- Options for Sphinx-JS ---------------------------------------------------
js_source_path = '../../src/visiomatic/client/js'
jsdoc_config_path = './api/client/conf.json'

# -- Options for pybtex ------------------------------------------------------
bibtex_bibfiles = ['references.bib']



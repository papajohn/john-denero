# Instructions for recreating this environment:
# - Install anaconda full from pkg (next time try mini...)
# - Create a Python 3 environment: conda create -n vision python=3 anaconda
# - Activate it: source activate vision
# - Install Python-3-compatible version of pydot: pip install pydot2
# - Install graphviz: sudo port selfupdate && sudo port install graphviz

source activate vision
ipython notebook --pylab inline

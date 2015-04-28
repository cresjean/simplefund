import os, sys
root = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(root, 'site-packages'))


import sae
from simplefund import app
application = sae.create_wsgi_app(app)
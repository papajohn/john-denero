# Pelican configuration for denero.org

AUTHOR = 'John DeNero'
SITENAME = 'John DeNero'
SITEURL = 'http://denero.org'

TIMEZONE = 'America/Los_Angeles'
DEFAULT_LANG = 'en'
DEFAULT_DATE = 'fs'

# Mark everything but blog as static content
PATH = 'content'
PAGE_DIR = 'pages'
ARTICLE_DIR = 'blog'
STATIC_SAVE_AS = 'content/{path}'
STATIC_PATHS = ['cv', 'misc', 'pubs', 'talks', 'zier']

# Configure non-content paths
OUTPUT_PATH = 'published/'
PLUGINS = ['plugins.publication']
THEME = 'theme'

# Site structure
DIRECT_TEMPLATES = ('index', 'blog')
MENUITEMS = (('About', ''),
             ('Publications', 'pages/publications.html'),
             ('Teaching', 'pages/teaching.html'),
             ('Blog', 'blog.html'))
LINKS =  ()
ARTICLE_URL = 'blog/{slug}.html'
ARTICLE_SAVE_AS = 'blog/{slug}.html'
AUTHOR_SAVE_AS = False
CATEGORY_SAVE_AS = False

# Options
NEWEST_FIRST_ARCHIVES = False
DEFAULT_PAGINATION = False
RELATIVE_URLS = True

# External links
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
SOCIAL = tuple()

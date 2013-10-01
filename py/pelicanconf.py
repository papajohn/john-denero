AUTHOR = 'John DeNero'
SITENAME = 'John DeNero'
SITEURL = 'http://denero.org'

TIMEZONE = 'America/Los_Angeles'
DEFAULT_LANG = 'en'
DEFAULT_DATE = 'fs'

STATIC_PATHS = ['../content']
DEFAULT_PAGINATION = False
OUTPUT_PATH = '../published/'
PLUGINS = ['publication']

NEWEST_FIRST_ARCHIVES = False
THEME = 'theme'
DIRECT_TEMPLATES = ('index',)

MENUITEMS = (('About', ''),
             ('Publications', 'pages/publications.html'))
LINKS =  (('CS 61A Course', 'http://inst.eecs.berkeley.edu/~cs61a'),)

# For development
RELATIVE_URLS = True

# Mark all content as static pages, rather than chronological articles
PAGE_DIR = '.'
ARTICLE_DIR = 'None'

# External links
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
SOCIAL = tuple()

# Name of the blog
blog_name = 'John DeNero'

# Your name (used for copyright info)
author_name = 'John DeNero'

# (Optional) slogan
slogan = ''

# The hostname this site will primarially serve off (used for Atom feeds)
host = 'www.denero.org'

# Selects the theme to use. Theme names correspond to directories under
# the 'themes' directory, containing templates and static content.
theme = 'coolblue'

# Defines the URL organization to use for blog postings. Valid substitutions:
#   slug - the identifier for the post, derived from the title
#   year - the year the post was published in
#   month - the month the post was published in
#   day - the day the post was published in
post_path_format = '/%(year)d/%(month)02d/%(slug)s'

# A nested list of sidebar menus, for convenience. If this isn't versatile
# enough, you can edit themes/default/base.html instead.
sidebars = [
  ('External Links', [
    ('Google Translate Blog', 'http://googletranslate.blogspot.com'),
    ('Google Research Blog', 'http://googleresearch.blogspot.com'),
    ('Berkeley NLP Group', 'http://nlp.cs.berkeley.edu'),
    ('My Wife Jessica', 'http://jessicawan.com'),
  ]),
  ('Recent Publications', [
    ('Inducing Sentence Structure from Parallel Corpora for Reordering',
     'http://www.denero.org/content/pubs/emnlp11_denero_stir.pdf'),
    ('Model-Based Aligner Combination Using Dual Decomposition',
     'http://www.denero.org/content/pubs/acl11_denero_dual.pdf'),
    ('Phrase Alignment Models for Statistical Machine Translation',
     'http://www.denero.org/content/pubs/denero_thesis.pdf'),
    ('Discriminative Modeling of Extraction Sets for Machine Translation',
     'http://www.denero.org/content/pubs/acl10_denero_extraction.pdf'),
    ('Model Combination for Machine Translation',
     'http://www.denero.org/content/pubs/naacl10_denero_combination.pdf')
  ])
]

# Which post to feature on the home page
feature = '/2011/02/The-Pac-Man-Projects'

# Number of entries per page in indexes.
posts_per_page = 5

# The mime type to serve HTML files as.
html_mime_type = "text/html; charset=utf-8"

# To use disqus for comments, set this to the 'short name' of the disqus forum
# created for the purpose.
disqus_forum = 'johndenero'

# Length (in words) of summaries, by default
summary_length = 100

# If you want to use Google Analytics, enter your 'web property id' here
analytics_id = 'UA-20813292-1'

# If you want to use PubSubHubbub, supply the hub URL to use here.
hubbub_hub_url = 'http://pubsubhubbub.appspot.com/'

# If you want to ping Google Sitemap when your sitemap is generated change this to True, else False
# see: http://www.google.com/support/webmasters/bin/answer.py?hl=en&answer=34609 for more information
google_sitemap_ping = True

# If you want to use Google Site verification, go to
# https://www.google.com/webmasters/tools/ , add your site, choose the 'upload
# an html file' method, then set the NAME of the file below.
# Note that you do not need to download the file provided - just enter its name
# here.
google_site_verification = 'google00fbe0efbf08ee9f.html'

# Default markup language for entry bodies (defaults to html).
default_markup = 'html'

# Syntax highlighting style for RestructuredText and Markdown,
# one of 'manni', 'perldoc', 'borland', 'colorful', 'default', 'murphy',
# 'vs', 'trac', 'tango', 'fruity', 'autumn', 'bw', 'emacs', 'pastie',
# 'friendly', 'native'.
highlighting_style = 'friendly'

# Absolute url of the blog application use '/blog' for host/blog/
# and '' for host/.Also remember to change app.yaml accordingly
url_prefix = ''

# Defines where the user is defined in the rel="me" of your pages.
# This allows you to expand on your social graph.
rel_me = None

# For use a feed proxy like feedburne.google.com
feed_proxy = None

# To use Google Friends Connect.                                          
# If you want use Google Friends Connect, go to http://www.google.com/friendconnect/ 
# and register your domain for get a Google Friends connect ID.
google_friends_id = None
google_friends_comments = True # For comments.
google_friends_members  = True # For a members container.

# To format the date of your post.
# http://docs.djangoproject.com/en/1.1/ref/templates/builtins/#now
date_format = "d F, Y"

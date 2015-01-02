# Pelican plug-in to render Example directives using the Online Python Tutor.

from docutils import nodes
from docutils.parsers.rst import Directive, directives, roles
from docutils.core import publish_string
from pelican import signals

def register():
    signals.generator_init.connect(register_publication_directive)

def register_publication_directive(sender):
        directives.register_directive("publication", PublicationDirective)

template = '''
<div class="publication">
  {author}. <i>{paper}</i>. {venue}, {year}. {slides}
</div>
'''
class PublicationDirective(Directive):
    """Render a publication."""
    required_arguments = 0
    optional_arguments = 0
    final_argument_whitespace = False
    option_spec = {
            "title": str,
            "author": unicode,
            "venue": str,
            "year": int,
            "tag": str,
            "paperlink": str,
            "slideslink": str,
            "biblink": str,
            }
    has_content = True
    next_id = 0

    def run(self):
        spec = {k: v for k, v in self.options.items()}
        authors = self.options['author'].split(' and ')
        if len(authors) > 1:
            spec['author'] = ', '.join(authors[:-1]) + ' and ' + authors[-1]
        if self.options.get('paperlink'):
            spec['paper'] = '<a href="{paperlink}">{title}</a>'.format(**spec)
        else:
            spec['paper'] = spec['title']
        spec['slides'] = ''
        if self.options.get('slideslink'):
            spec['slides'] = '(<a href="{slideslink}">slides</a>)'.format(**self.options)
        node = nodes.raw('', template.format(**spec), format='html')
        return [node]

"""
Formatter for publication blog entries
"""

import urllib

def format(content):
  '''Looks for publications and formats them like an ACL bibtex entry'''
  html = ''
  entry = []
  for line in content.split('\n'):
    if line.strip() == '' and len(entry) > 0:
      html += format_entry(entry)
      entry = []
    elif line.count(' = ') == 1:
      entry.append(line.strip())
    else:
      html += line
  if len(entry) > 0:
    html += format_entry(entry)
  return html

def format_entry(lines):
  parse_args = dict()
  for line in lines:
    parts = line.split(' = ');
    if len(parts) == 2:
      key = parts[0].lower()
      val = parts[1]
      if key == 'author':
        authors = val.split(' and ')
        if len(authors) > 2:
          val = ', '.join(authors[:-1])
          val += ', and ' + authors[-1]
      parse_args[key] = val.strip()
    else:
      break
  html = '\n<div class="publication">\n'
  view_link = ''
  if 'paperlink' in parse_args:
    if parse_args['paperlink'].endswith('.pdf'):
      view_link += 'http://docs.google.com/viewer?url='
      paper_link = urllib.quote_plus(parse_args['paperlink'])
      if not paper_link.startswith('http'):
        paper_link = 'http://www.denero.org' + paper_link
      view_link += paper_link
    else:
      view_link = parse_args['paperlink']
    html += '<div class="float-left">\n<a href="%s">\n' % view_link
    html += '<img src="/content/misc/view_doc.png" class="float-left" width="36px" />\n'
    html += '</a>\n</div>\n'

  if 'author' in parse_args:
    html += '%(author)s. ' % parse_args
  if 'title' in parse_args:
    html += '<b>%(title)s</b>. ' % parse_args
  if 'venue' in parse_args and 'year' in parse_args:
    html += '%(venue)s, %(year)s. ' % parse_args
  if 'paperlink' in parse_args:
    html += '[<a href="%s">view</a>] ' % view_link
    if parse_args['paperlink'].endswith('.pdf'):
      html += '[<a href="%(paperlink)s">pdf</a>] ' % parse_args
  if 'slideslink' in parse_args:
    html += '[<a href="%(slideslink)s">slides</a>] ' % parse_args
  html += '\n</div>\n'
  return html

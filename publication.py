"""
Formatter for publication blog entries
"""

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
  return html + '<br>'


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
  html = '<div class="publication">\n'
  html += '%(author)s. <b>%(title)s</b>. %(venue)s, %(year)s' % parse_args
  if 'paperlink' in parse_args:
    html += ' [<a href="%(paperlink)s">pdf</a>]' % parse_args
  if 'slideslink' in parse_args:
    html += ' [<a href="%(slideslink)s">slides</a>]' % parse_args
  html += '\n<br>\n'
  return html + '\n</div>\n'

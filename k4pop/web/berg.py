from django.core.urlresolvers import reverse
from django.template.loader import render_to_string

from web.data import *

import requests

def getQRCodeUrl(request, user, size=150):
  relative_url = reverse('viewUser', args=(user.code,))
  absolute_url = 'http://%s%s' % (request.get_host(), relative_url)
  print size
  chs = '{0}x{0}'.format(size)
  params = {
    'cht': 'qr',
    'chs': chs,
    'chl': absolute_url
  }
  qrcode_r = requests.Request('GET', GOOGLE_CHARTS_URL, params=params)
  qrcode_p = qrcode_r.prepare()
  return qrcode_p.url

def getCardHtml(request, user):
  return render_to_string('card.html', {
    'user': user,
    'role': ROLES[user.role],
    'story': ROLE_STORIES[user.role],
    'qrcode_url': getQRCodeUrl(request, user)
  })

def printHtml(html):
  data = {
    'html': html
  }
  return requests.post(BERG_PRINT_URL, data=data)

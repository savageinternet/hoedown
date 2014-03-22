from django.core.context_processors import csrf
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt

from web.data import *
from web.berg import getQRCodeUrl, getCardHtml, printHtml
from web.utils import renderViewUser
from web.http_auth import http_basic_auth
from web.models import User, SharedTask

import json
import requests

HASHTAG = '#k4hoedown'
# TODO: copy access token from Facebook Graph API explorer here
ACCESS_TOKEN = 'XXX'
FACEBOOK_SEARCH_URL = 'https://graph.facebook.com/search'

#@http_basic_auth
def home(request):
    return render(request, 'admin/home.html', {})

#@http_basic_auth
def listUsers(request):
    users = User.objects.order_by('-created')
    for user in users:
        user.role_name = ROLES[user.role]
    return render(request, 'admin/list.html', {
        'users': users
    })

#@http_basic_auth
def viewUser(request, code):
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    return renderViewUser(request, user, is_admin=True)

#@http_basic_auth
def printCard(request, code):
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    card_html = getCardHtml(request, user)
    berg_response = printHtml(card_html)
    print berg_response
    return redirect('adminListUsers')

#@http_basic_auth
def updateUserStats(request, code):
    if request.method != 'POST':
        raise Exception('Cannot GET {0}'.format(request.path))
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    user.cha = request.POST['cha']
    user.con = request.POST['con']
    user.dex = request.POST['dex']
    user.int = request.POST['int']
    user.str = request.POST['str']
    user.wis = request.POST['wis']
    user.save()
    return redirect('adminListUsers')

def updateUserName(request, code):
    if request.method != 'POST':
        raise Exception('Cannot GET {0}'.format(request.path))
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    user.name = request.POST['name']
    user.save()
    return redirect('adminListUsers')

@csrf_exempt
def updateUserPhoto(request, code):
    if request.method != 'POST':
        raise Exception('Cannot GET {0}'.format(request.path))
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    print code
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        raise Exception('missing file')
    local_filepath = 'web/static/images/{0}'.format(uploaded_file.name)
    with open(local_filepath, 'wb+') as local_file:
        for chunk in uploaded_file.chunks():
            local_file.write(chunk)
    user.has_photo = True
    user.save()
    return HttpResponse(json.dumps({'success': True}), content_type='application/json')

def searchFacebook(request):
    """
    Returns a JSON array containing the post ids of the last <limit> posts
    that match query <q>.
    """
    q = request.GET['q']
    limit = int(request.GET.get('limit', 5))
    params = {
        'q': q,
        'limit': limit,
        'access_token': ACCESS_TOKEN
    }
    result = requests.get(FACEBOOK_SEARCH_URL, params=params)
    return HttpResponse(result.text, content_type='application/json')

from django.core.context_processors import csrf
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt

from web.models import User, SharedTask
from web.data import *
from web.berg import getQRCodeUrl, getCardHtml, printHtml
from web.utils import generateRandomCode, renderViewUser, getPhotoCredentials

import datetime
import hashlib
import json
import random
import requests
import string
import sys
import uuid

def home(request):
  viewer_code = request.session.get('viewer_code')
  if viewer_code is None:
    return render(request, 'home.html', {})
  viewer = User.objects.get(code=viewer_code)
  return viewUser(request,viewer_code)

# NOTE: we exempt this method from CSRF, as it is called from the K4.  While we
# could issue a CSRF token via a GET request, that defeats the purpose of CSRF
# anyways, and this is easier than trying to manage that.
@csrf_exempt
def createUser(request):
  if request.method != 'POST':
    raise Exception('Cannot GET {0}'.format(request.path))
  print >> sys.stderr, request.POST
  code = generateRandomCode()
  user = User(
      code = code,
      name = '',
      cha = request.POST['cha'],
      con = request.POST['con'],
      dex = request.POST['dex'],
      int = request.POST['int'],
      str = request.POST['str'],
      wis = request.POST['wis'],
      role = request.POST['role'])
  user.save()

  response = {
    'success': True,
    'id': user.id
  }

  return HttpResponse(json.dumps(response), content_type='application/json')

@csrf_exempt
def completeUserPersona(request, id):
  try:
    id = int(id)
    user = User.objects.get(id=id)
  except User.DoesNotExist:
    raise Exception('no user for id %d' % id)
  except ValueError:
    raise Exception('invalid non-numeric id %s' % id)
  name = request.GET['name']
  user.name = name
  user.has_photo = True
  user.save()
  print 'Set user {0} name to {1}'.format(user.code, name)
  #photo_data = request.read()
  credentials = getPhotoCredentials(user)
  # NOTE: the request is a file-like object, so this should work.
  files = {
    'file': request
  }
  s3_response = requests.post(
          'https://k4hoedown.s3.amazonaws.com',
          files=files,
          data=credentials)
  print s3_response
  response = {
    'success': True,
    'id': user.id
  }
  return HttpResponse(json.dumps(response), content_type='application/json')

def viewUser(request, code):
  try:
    viewee = User.objects.get(code=code)
  except User.DoesNotExist:
    raise Exception('no user for code %s' % code)
  viewer_code = request.session.setdefault('viewer_code', code)
  viewer = User.objects.get(code=viewer_code)

  if viewer.code == viewee.code:
    return renderViewUser(request, viewer)
  else:
    (shared_task_12, created) = SharedTask.objects.get_or_create(
      user_1 = viewer,
      user_2 = viewee)
    if not created and shared_task_12.completed is not None:
      return render(request, 'task-done.html', {
        'viewer': viewer,
        'viewee': viewee
      })
    (shared_task_21, created) = SharedTask.objects.get_or_create(
      user_2 = viewer,
      user_1 = viewee)
    if not created and shared_task_21.completed is not None:
      raise Exception('inconsistent shared task state!')
    task_id = (viewer.role + viewee.role) % 7
    data = {
      'viewer': viewer,
      'viewee': viewee,
      'task_id': task_id,
      'is_custom_task': False
    }
    if task_id == 0:
      phrase_id = random.randrange(len(HANGMAN_PHRASES))
      data['phrase'] = HANGMAN_PHRASES[phrase_id]
      data['letters'] = string.uppercase
      data['is_custom_task'] = True
    elif task_id == 1:
      data['booth'] = random.choice(BOOTHS)
    elif task_id == 5:
      puzzle_id = random.randrange(len(LOGIC_PUZZLES))
      data['puzzle'] = LOGIC_PUZZLES[puzzle_id]
      data['image_filename'] = LOGIC_IMAGES[puzzle_id]
      data['id'] = puzzle_id # so we can get the solution later
      data['is_custom_task'] = True
    error = request.session.get('error')
    if error is not None:
      del request.session['error']
      data['error'] = error
    data.update(csrf(request))
    return render(request, 'task-{0}.html'.format(task_id), data)

def checkLogicPuzzle(request, code):
  if request.method != 'POST':
    raise Exception('Cannot GET {0}'.format(request.path))
  try:
    viewee = User.objects.get(code=code)
  except User.DoesNotExist:
    raise Exception('no user for code %s' % code)
  viewer_code = request.session.get('viewer_code')
  if viewer_code is None:
    raise Exception('must link user before completing tasks')
  viewer = User.objects.get(code=viewer_code)
  if viewer.code == viewee.code:
    raise Exception('cannot complete task with yourself')
  task_id = (viewer.role + viewee.role) % 7
  if task_id != 5:
    raise Exception('this pair of users does not have this task!')
  answer = request.POST['answer']
  puzzle_id = int(request.POST['id'])
  expected = LOGIC_ANSWERS[puzzle_id]
  if answer != expected:
    request.session['error'] = "That's not correct.  Try again!"
    return redirect('viewUser', viewee.code)
  return completeTask(request, code)

def completeTask(request, code):
  if request.method != 'POST':
    raise Exception('Cannot GET {0}'.format(request.path))
  try:
    viewee = User.objects.get(code=code)
  except User.DoesNotExist:
    raise Exception('no user for code %s' % code)
  viewer_code = request.session.get('viewer_code')
  if viewer_code is None:
    raise Exception('must link user before completing tasks')
  viewer = User.objects.get(code=viewer_code)
  if viewer.code == viewee.code:
    raise Exception('cannot complete task with yourself')
  now = datetime.datetime.now()
  try:
    shared_task_12 = SharedTask.objects.get(
      user_1 = viewer,
      user_2 = viewee)
    shared_task_12.completed = now
    shared_task_12.save()
    shared_task_21 = SharedTask.objects.get(
      user_2 = viewer,
      user_1 = viewee)
    shared_task_21.completed = now
    shared_task_21.save()
    return redirect('viewUser', viewer.code)
  except SharedTask.DoesNotExist:
    raise Exception('cannot complete task you have not started')

def viewUserCard(request, code):
  user = User.objects.get(code=code)
  return render(request, 'card.html', {
    'user': user,
    'role': ROLES[user.role],
    'role_layout': ROLES_LAYOUT[user.role],
    'story': ROLE_STORIES[user.role],
    'qrcode_url': getQRCodeUrl(request, user)
  })

def unlinkUser(request, code):
  viewer_code = request.session.get('viewer_code')
  if viewer_code is None:
    raise Exception('must link first!')
  if viewer_code != code:
    raise Exception('cannot unlink other users!')
  del request.session['viewer_code']
  return HttpResponse('Unlinked user %s from this browser.' % code)

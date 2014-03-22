from django.shortcuts import render

from web.data import *
from web.models import User, SharedTask
from web.berg import getQRCodeUrl

import base64
import datetime
import hashlib
import hmac
import json
import random
import string
import uuid

# TODO: add AWS credentials here
AWS_ACCESS_KEY_ID = 'XXX'
AWS_SECRET_KEY = 'XXX'

def _generateRandomName(n):
    C = random.choice(string.uppercase)
    cs = [random.choice(string.lowercase) for i in xrange(n - 1)]
    return C + ''.join(cs)

def generateRandomCode():
    return hashlib.sha256(str(uuid.uuid4())).hexdigest()

def createRandomUser(code=None, name=None):
    if code is None:
        code = generateRandomCode()
    if name is None:
        name = _generateRandomName(10)
    user = User(
        code = code,
        name = name,
        cha = random.randrange(1, 8),
        con = random.randrange(1, 8),
        dex = random.randrange(1, 8),
        int = random.randrange(1, 8),
        str = random.randrange(1, 8),
        wis = random.randrange(1, 8),
        role = random.randrange(7))
    user.save()

def createRandomUsers(n):
    for i in xrange(n):
        createRandomUser()

def renderViewUser(request, user, is_admin = False):
    roles_met = [{
      'role_name': role_name,
      'task_name': TASKS[(user.role + role_id) % 7],
      'completed_with': [],
      'started_with': []
    } for role_id, role_name in enumerate(ROLES)]
    shared_tasks = SharedTask.objects.filter(user_1 = user)
    for shared_task in shared_tasks:
      user_met = shared_task.user_2
      if shared_task.completed is None:
        roles_met[user_met.role]['started_with'].append(user_met)
      else:
        roles_met[user_met.role]['completed_with'].append(user_met)
    completed_all_tasks = True
    for role_met in roles_met:
        if not role_met['completed_with']:
            completed_all_tasks = False
            break
    return render(request, 'view.html', {
      'user': user,
      'is_admin': is_admin,
      'user_role': ROLES[user.role],
      'roles': ROLES,
      'story': ROLE_STORIES[user.role],
      'qrcode_url': getQRCodeUrl(request, user, 300),
      'roles_met': roles_met,
      'completed_all_tasks': completed_all_tasks
    })

def getPhotoCredentials(user):
    key = 'images/{0}.jpg'.format(user.code)
    now = datetime.datetime.utcnow()
    expiration = now + datetime.timedelta(seconds=60)
    policy_object = {
        'expiration': expiration.isoformat() + 'Z',
        'conditions': [
            {'bucket': 'k4hoedown'},
            {'acl': 'public-read'},
            {'Cache-Control': 'max-age=1209600'},
            {'Content-Type': 'image/jpeg'},
            ['starts-with', '$key', key],
            ['content-length-range', 0, 1024 * 1024]
        ]
    }
    policy_document = json.dumps(policy_object)
    policy = base64.b64encode(policy_document)
    signature_hmac = hmac.new(AWS_SECRET_KEY, policy, hashlib.sha1)
    signature = base64.b64encode(signature_hmac.digest())
    response = {
        'AWSAccessKeyId': AWS_ACCESS_KEY_ID,
        'acl': 'public-read',
        'Cache-Control': 'max-age=1209600',
        'Content-Type': 'image/jpeg',
        'key': key,
        'policy': policy,
        'signature': signature
    }
    return response

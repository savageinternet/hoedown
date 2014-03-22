from django.http import HttpResponse

from web.models import User
from web.utils import getPhotoCredentials

import base64
import json
import datetime
import hashlib
import hmac

def photoCredentials(request, code):
    try:
        user = User.objects.get(code=code)
    except User.DoesNotExist:
        raise Exception('no user for code %s' % code)
    credentials = getPhotoCredentials(user)
    # TODO: this is a horrible abuse of a GET request, but whatever.
    user.has_photo = True
    user.save()
    return HttpResponse(json.dumps(credentials), content_type='application/json')

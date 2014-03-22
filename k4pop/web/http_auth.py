from django.http import HttpResponse, HttpResponseForbidden
from django.contrib.auth.models import User, check_password
from functools import wraps

import json
import logging

ADMIN_USERNAME = 'admin'
# TODO: add random admin password for HTTP basic auth here
ADMIN_PASSWORD = 'XXX'

class HttpResponseUnauthorized(HttpResponse):
    status_code = 401
    def __init__(self, realm, *args, **kwargs):
        super(HttpResponseUnauthorized, self).__init__(*args, **kwargs)
        self['WWW-Authenticate'] = 'Basic realm="{0}"'.format(realm)

def http_basic_auth(func):
    """
    Use as a decorator for views that need to perform HTTP basic
    authorisation.

    See https://forrst.com/posts/Django_decorator_for_HTTP_Basic_Auth-52j for
    the original implementation, which does some Django auth magic that we
    don't care about.  Instead, we just authenticate against the hardcoded
    credentials above.
    """
    @wraps(func)
    def _decorator(request, *args, **kwargs):
        if not request.META.has_key('HTTP_AUTHORIZATION'):
            return HttpResponseUnauthorized('admin')
        try:
            authmeth, auth = request.META['HTTP_AUTHORIZATION'].split(' ', 1)
            if authmeth.lower() == 'basic':
                auth = auth.strip().decode('base64')
                username, password = auth.split(':', 1)
                if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                    logging.debug('Authenticated %s:%s' % (username, password))
                    return func(request, *args, **kwargs)
                else:
                    return HttpResponseUnauthorized('admin')
        except ValueError:
            return HttpResponseForbidden('Credentials missing')
    return _decorator

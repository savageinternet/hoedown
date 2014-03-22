from django.db import models

# TODO: record locations of users, shared tasks
class User(models.Model):
    created = models.DateTimeField(auto_now = False, auto_now_add = True)
    has_photo = models.BooleanField(default = False)
    name = models.CharField(max_length = 255)
    code = models.CharField(max_length = 64)
    cha = models.PositiveSmallIntegerField()
    con = models.PositiveSmallIntegerField()
    dex = models.PositiveSmallIntegerField()
    int = models.PositiveSmallIntegerField()
    str = models.PositiveSmallIntegerField()
    wis = models.PositiveSmallIntegerField()
    role = models.PositiveSmallIntegerField()
    met = models.ManyToManyField(
            'self',
            through = 'SharedTask',
            symmetrical = False)

class SharedTask(models.Model):
    user_1 = models.ForeignKey(User, related_name = '+')
    user_2 = models.ForeignKey(User, related_name = '+')
    created = models.DateTimeField(auto_now = False, auto_now_add = True)
    completed = models.DateTimeField(null = True)

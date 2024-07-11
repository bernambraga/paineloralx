from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.core import validators
import re

class User(AbstractBaseUser,PermissionsMixin):
    username = models.CharField(_('username'), max_length=15, unique=True, 
                                help_text=_('Required. 15 characters or fewer. Letters, numbers and @/./+/-/_ characters'), 
                                validators=[ validators.RegexValidator(re.compile('^[\w.@+-]+$'), 
                                                                       _('Enter a valid username.'), 
                                                                       _('invalid'))])
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD =    "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name
    

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance).create(user=instance)


def save_user_profile(sender,instance,**kwargs):
    instance.profile.save()


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)
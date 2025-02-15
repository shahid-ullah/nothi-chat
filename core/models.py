from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import (CASCADE, DateTimeField, ForeignKey, Model,
                              TextField)

AUTH_USER_MODEL = getattr(settings, "AUTH_USER_MODEL", "user_app.UserModel")
# from django.db.models.fields import related
def upload_path(instance,filename):
    return "upload/{user}/{filename}".format(user=instance.user,filename=filename)


class MessageModel(Model):
    """
    This class represents a chat message. It has a owner (user), timestamp and
    the message body.

    """

    user = ForeignKey(
        AUTH_USER_MODEL,
        on_delete=CASCADE,
        verbose_name='user',
        related_name='from_user',
        db_index=True,
    )
    recipient = ForeignKey(
        AUTH_USER_MODEL,
        on_delete=CASCADE,
        verbose_name='recipient',
        related_name='to_user',
        db_index=True,
    )
    timestamp = DateTimeField(
        'timestamp', auto_now_add=True, editable=False, db_index=True
    )
    body = TextField('body',null=True)
    image = models.ImageField(upload_to=upload_path,  null=True)

    def __str__(self):
        return str(self.id)

    def characters(self):
        """
        Toy function to count body characters.
        :return: body's char number
        """
        return len(self.body)

    def notify_ws_clients(self):
        """
        Inform client there is a new message.
        """
        notification = {
            'type': 'recieve_group_message',
            'message': '{}'.format(self.id),
        }

        channel_layer = get_channel_layer()
        # print("user.id {}".format(self.user.id))
        # print("user.id {}".format(self.recipient.id))

        async_to_sync(channel_layer.group_send)("{}".format(self.user.id), notification)
        async_to_sync(channel_layer.group_send)(
            "{}".format(self.recipient.id), notification
        )

    def save(self, *args, **kwargs):
        """
        Trims white spaces, saves the message and notifies the recipient via WS
        if the message is new.
        """
        new = self.id
        self.body = self.body.strip()  # Trimming whitespaces from the body
        super(MessageModel, self).save(*args, **kwargs)
        if new is None:
            self.notify_ws_clients()

    # Meta
    class Meta:
        app_label = 'core'
        verbose_name = 'message'
        verbose_name_plural = 'messages'
        ordering = ('-timestamp',)


class ChatGroup(models.Model):
    name = models.CharField(max_length=50)
    member = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='chat_groups'
    )

    def __str__(self):
        return self.name


class ChatGroupMessage(models.Model):
    group_name = models.ForeignKey(
        ChatGroup, on_delete=models.CASCADE, related_name='messages'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_group_messages',
    )
    message = models.TextField()
    timestamp = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.message}'


class Relationship(models.Model):
    created = models.DateTimeField(auto_now_add=True, editable=False)
    creator = models.ForeignKey(
        AUTH_USER_MODEL, related_name="friendship_creator_set", on_delete=models.CASCADE
    )
    friends = models.ForeignKey(
        AUTH_USER_MODEL, related_name="friend_set", on_delete=models.CASCADE
    )

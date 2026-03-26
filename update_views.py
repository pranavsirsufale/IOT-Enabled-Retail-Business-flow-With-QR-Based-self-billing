from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_cart_updated():
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'cart_updates',
        {
            'type': 'cart_message',
            'message': {'action': 'update'}
        }
    )

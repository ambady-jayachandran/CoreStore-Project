import requests
from django.core.files.base import ContentFile
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from allauth.socialaccount.signals import social_account_updated

@receiver(user_signed_up)
def save_google_profile_picture(request, user, sociallogin=None, **kwargs):
    if sociallogin and sociallogin.account.provider == 'google':
        extra_data = sociallogin.account.extra_data

        # Sync verification status
        user.is_email_verified = True
        user.is_verified = True  # Added this to match your User model
        
        # Default role for social signups
        if not user.role:
            user.role = 'CUSTOMER'

        picture_url = extra_data.get("picture")
        if picture_url and not user.profile_image:
            try:
                response = requests.get(picture_url, timeout=5)
                if response.status_code == 200:
                    # Note: user.id here is a UUID string
                    user.profile_image.save(
                        f"{user.id}.jpg",
                        ContentFile(response.content),
                        save=False
                    )
            except Exception as e:
                print(f"Image download failed: {e}")

        user.save()
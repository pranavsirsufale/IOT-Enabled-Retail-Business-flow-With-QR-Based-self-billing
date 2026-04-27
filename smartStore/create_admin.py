import os
import sys


def _get_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return ""


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartStore.settings")

    username = _get_env("DJANGO_SUPERUSER_USERNAME", "ADMIN_USERNAME")
    password = _get_env("DJANGO_SUPERUSER_PASSWORD", "ADMIN_PASSWORD")
    email = _get_env("DJANGO_SUPERUSER_EMAIL", "ADMIN_EMAIL")

    # If credentials aren't provided, treat as a no-op (useful for local dev or
    # environments that don't want an auto-created admin).
    if not username or not password:
        print("create_admin.py: env vars not set; skipping admin creation.")
        return 0

    reset_password = _get_env("DJANGO_SUPERUSER_RESET_PASSWORD", "ADMIN_RESET_PASSWORD").lower() in {
        "1",
        "true",
        "yes",
    }

    try:
        import django

        django.setup()

        from django.contrib.auth import get_user_model

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email} if email else {},
        )

        # Ensure privilege flags are correct.
        changed = False
        if not getattr(user, "is_staff", False):
            user.is_staff = True
            changed = True
        if not getattr(user, "is_superuser", False):
            user.is_superuser = True
            changed = True

        # Only set password on first create, unless explicitly asked to reset.
        if created or reset_password:
            user.set_password(password)
            changed = True

        # Fill email if missing and provided.
        if email and not getattr(user, "email", ""):
            user.email = email
            changed = True

        if changed:
            user.save()

        print(
            "create_admin.py: admin %s (%s)" % (
                "created" if created else "ensured",
                username,
            )
        )
        return 0
    except Exception as exc:
        # Don't crash the deploy for admin creation; log and move on.
        print("create_admin.py: failed: %s" % (exc,), file=sys.stderr)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())

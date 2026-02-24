from rest_framework import permissions

class IsAdminOrStoreManager(permissions.BasePermission):
    """
    Custom permission to allow only Admins and Store Managers to edit data.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Django Superusers always have access
        if request.user.is_superuser:
            return True

        try:
            # Check if user has a Staff profile
            if hasattr(request.user, 'staff'):
                staff_type = request.user.staff.type.type
                return staff_type in ['admin', 'store_manager']
        except Exception:
            pass
            
        return False

class IsStaffMemberReadOnly(permissions.BasePermission):
    """
    Custom permission to allow Staff Members to view data but not edit.
    Admins and Store Managers can still edit.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # SAFE_METHODS are GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # For write operations (POST, PUT, DELETE), check if Admin or Store Manager
        if request.user.is_superuser:
            return True

        try:
            if hasattr(request.user, 'staff'):
                staff_type = request.user.staff.type.type
                return staff_type in ['admin', 'store_manager']
        except Exception:
            pass
            
        return False

from rest_framework.permissions import BasePermission

class IsInGroup(BasePermission):
    def has_permission(self, request, view):
        required_groups = getattr(view, 'required_groups', [])
        user_groups = request.user.groups.values_list('name', flat=True)
        return all(group in user_groups for group in required_groups)

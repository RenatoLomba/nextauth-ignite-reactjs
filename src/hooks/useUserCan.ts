import { validateUserPermissions } from '../utils/validateUserPermissions';
import { useAuth } from './useAuth';

type UserCanParams = {
  permissions?: string[];
  roles?: string[];
};

function useUserCan({ permissions, roles }: UserCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
}

export { useUserCan };

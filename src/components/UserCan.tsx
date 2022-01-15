import React, { FC } from 'react';
import { useUserCan } from '../hooks/useUserCan';

interface UserCanProps {
  permissions?: string[];
  roles?: string[];
}

const UserCan: FC<UserCanProps> = ({ permissions, roles, children }) => {
  const userCanSeeComponent = useUserCan({ permissions, roles });

  return userCanSeeComponent && <>{children}</>;
};

export { UserCan };

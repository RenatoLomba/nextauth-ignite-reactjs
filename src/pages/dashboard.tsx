import React from 'react';
import { UserCan } from '../components/UserCan';

import { useAuth } from '../hooks/useAuth';
import { useUserCan } from '../hooks/useUserCan';
import { setupAPIClient } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

function Dashboard() {
  const { user, signOut } = useAuth();

  const userCanSeeUsers = useUserCan({ roles: ['editor', 'administrator'] });

  return (
    <div>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

      {userCanSeeUsers && <div>Usuários do sistema</div>}

      <UserCan permissions={['metrics.list']}>
        <div>Métricas</div>
      </UserCan>
    </div>
  );
}

const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get('/me');
  console.log(response.data);

  return {
    props: {},
  };
});

export { getServerSideProps };

export default Dashboard;

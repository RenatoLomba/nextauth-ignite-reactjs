import React from 'react';
import { setupAPIClient } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

function Metrics() {
  return (
    <div>
      <h1>Métricas</h1>
    </div>
  );
}

const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get('/me');
    console.log(response);

    return {
      props: {},
    };
  },
  {
    permissions: ['metrics.list'],
    roles: ['editor', 'administrator'],
  },
);

export { getServerSideProps };

export default Metrics;

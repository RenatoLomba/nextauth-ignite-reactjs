import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';

function withSSRGuest(fn: GetServerSideProps) {
  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { '@nextauth.token': token } = parseCookies(ctx);

    if (token) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };

  return getServerSideProps;
}

export { withSSRGuest };

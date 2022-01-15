import React, { FormEvent, useState } from 'react';

import { useAuth } from '../hooks/useAuth';

import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.main}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {},
  };
});

export { getServerSideProps };

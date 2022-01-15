const createAuthChannel = () => {
  if (process.browser) {
    return new BroadcastChannel('auth');
  }

  return null;
};

const authChannel: BroadcastChannel | null = createAuthChannel();

export { authChannel };

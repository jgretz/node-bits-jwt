import userStrategy from './strategies/user_auth';

const DEFAULT_CONFIG = {
  authorizeUrl: '/api/authorize',
  expiresIn: '1d',
  strategy: userStrategy,
};

export default options => {
  const config = Object.assign(DEFAULT_CONFIG, options);
  const {authorizeUrl, strategy} = config;

  return {
    beforeConfigureRoutes: args => {
      const {router, database} = args;

      router.post(authorizeUrl, strategy.authorize(config, database));
      router.use(strategy.secureRoutes(config, database));
    },
  };
};

// export schemes
export * from './schemes';

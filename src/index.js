import {POST} from 'node-bits';

import {authorize, secureRoutes} from './util';

const DEFAULT_CONFIG = {
  authorizeUrl: '/api/authorize',
  expiresIn: '1d',
};

export default options => {
  const config = Object.assign(DEFAULT_CONFIG, options);

  return {
    beforeConfigureRoutes: args => {
      const {router, database} = args;

      router[POST](config.authorizeUrl, authorize(config, database));
      router.use(secureRoutes(config, database));
    },
  };
};

// export schemes
export * from './schemes';

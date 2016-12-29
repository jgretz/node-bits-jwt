const DEFAULT_CONFIG = {
  authorize: 'api/authorize',
};

export default (config) => {
  const options = Object.assign(DEFAULT_CONFIG, config);

  return {
    beforeConfigureRoutes: (args) => {
    },

    afterConfigureRoutes: (args) => {
    }
  };
};

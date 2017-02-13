import _ from 'lodash';
import murl from 'murl';

const isWildcard = (def) => _.isString(def) && def === '*';


const matchRouteRoleAndDefinition = (route, verb, role, def) => {
  if (isWildcard(def)) {
    return Promise.resolve(true);
  }

  const verbs = _.find(def, (verbs, key) => murl(key)(route) !== null);
  if (!verbs) {
    return Promise.reject(`No access rule defined for role ${role} for route ${route}`);
  }

  if (!_.isArray(verbs)) {
    return Promise.reject('Verbs must be specified in an array for route rules');
  }

  if (!verbs.includes(verb.toLowerCase())) {
    return Promise.reject(`${role} has not been granted access to ${verb} on route ${route}`);
  }

  return Promise.resolve(true);
};

export const secureByRole = (config) => (req, token) => {
  const { roleKey, map } = config;
  if (!roleKey && !map) {
    return Promise.reject('Configuration invalid');
  }

  const role = token[roleKey];
  if (!role) {
    return Promise.reject(`Role Key ${roleKey} not found in token`);
  }

  const def = map[role];
  if (!def) {
    return Promise.reject(`Role ${role} not found in map`);
  }

  return matchRouteRoleAndDefinition(req.url, req.method, role, def);
};

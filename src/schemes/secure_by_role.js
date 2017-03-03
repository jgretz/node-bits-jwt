import _ from 'lodash';
import murl from 'murl';

const isWildcard = def => _.isString(def) && def === '*';

export const secureByRole = config => (req, token) => {
  const {roleKey, map} = config;
  if (!roleKey && !map) {
    return Promise.reject('Configuration invalid');
  }

  const role = token[roleKey];
  if (!role) {
    return Promise.reject(`Role Key ${roleKey} not found in token`);
  }

  // if we weren't given an array, make a singleton
  const roles = _.isArray(role) ? role : [role];

  // make sure at least one role is provided
  if (_.isEmpty(roles)) {
    return Promise.reject('No roles in token');
  }

  const {url, method} = req;

  // map the current roles onto the auth graph against the current verb
  const result = _.map(roles, r => {
    const def = map[r.toLowerCase()];
    const verbs = _.find(def, (verbs, key) => murl(key)(url) !== null) || [];
    return isWildcard(def) || verbs.includes(method.toLowerCase());
  })
  // reduce the array to a single bool, if it exists
  .reduce((m, n) => m || n);

  return result ? Promise.resolve(true) : Promise.reject(`${role} has not been granted access to ${method} on route ${url}`);
};

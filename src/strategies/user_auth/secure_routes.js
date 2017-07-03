import _ from 'lodash';
import jwt from 'jsonwebtoken';
import {logWarning} from 'node-bits';

const getToken = req => {
  const locations = [
    req.body.token,
    req.query.token,
    req.headers['x-access-token'],
    req.headers.authorization,
    req.headers.Authorization,
  ];

  return _.find(locations, loc => _.isString(loc));
};

export const secureRoutes = (config, database) => (req, res, next) => {
  const {secret, restrict, authorizeUrl} = config;

  if (!_.some((restrict || []), pattern => req.url.startsWith(pattern))) {
    next();
    return;
  }

  if (req.url === authorizeUrl) {
    next();
    return;
  }

  const failure = () => {
    res.status(403).send({
      success: false,
      message: 'No valid token provided.',
    });
  };

  const failureOverride = (token, err) => {
    if (config.allowRequestDespiteJwtFailure && config.allowRequestDespiteJwtFailure(req, token, err)) {
      next();
      return true;
    }

    return false;
  };

  const token = getToken(req);
  if (!token) {
    if (failureOverride(token)) {
      return;
    }

    logWarning(`No token specified to access ${req.url}`);
    failure();
    return;
  }

  jwt.verify(token, secret, (err, tokenData) => {
    if (err) {
      if (failureOverride(token, err)) {
        return;
      }

      logWarning(`Token data invalid to access ${req.url}`);
      failure();
      return;
    }

    const schemes = (config.securitySchemes || []).map(scheme => scheme(req, tokenData, database));
    Promise.all(schemes)
      .then(values => {
        if (_.every(values, v => v)) {
          req.tokenData = tokenData;
          next();
          return;
        }

        logWarning(`Access schemes turned down access to ${req.url}`);
        failure();
      })
      .catch(err => {
        logWarning(`Access schemes turned down access to ${req.url}\n${err}`);
        failure();
      });
  });
};

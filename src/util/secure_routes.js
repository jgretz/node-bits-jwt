import _ from 'lodash';
import jwt from 'jsonwebtoken';

export const secureRoutes = (config) => (req, res, next) => {
  const { secret, restrict, authorizeUrl } = config;

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

    return;
  };

  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    failure();
    return;
  }

  jwt.verify(token, secret, (err, tokenData) => {
    if (err) {
      failure();
      return;
    }

    req.tokenData = tokenData;
    next();
  });
};

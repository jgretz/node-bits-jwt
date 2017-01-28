import _ from 'lodash';
import jwt from 'jsonwebtoken';

const getToken = (req) => {
  const locations = [
    req.body.token,
    req.query.token,
    req.headers['x-access-token'],
    req.headers['Authorization'],
  ];

  return _.find(locations, (loc) => _.isString(loc));
};

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

  var token = getToken(req);
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

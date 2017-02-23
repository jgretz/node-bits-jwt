import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logError } from 'node-bits';

const findUserFromConfig = (database, req, config) => {
  return new Promise((resolve, reject) => {
    const { user: { model, key, password } } = config;

    const query = {};
    const username = req.body[key];
    if(!username) {
      reject();
      return;
    }
    query[key] = username.trim();
    database.find(model, query)
      .then((users) => {
        if (users.length !== 1) {
          reject();
          return;
        }

        const user = users[0];
        const hash = user[password];
        if (!hash) {
          logError('User in the database doesnt have a hashed password');
          reject();
          return;
        }

        const check = req.body[password];
        if (!check) {
          logError('Password wasnt supplied by the user');
          reject();
          return;
        }

        bcrypt.compare(check, hash)
          .then((result) => {
            if (!result) {
              reject();
              return;
            }

            resolve(user);
          });
        });
    });
};

const runMap = (object, map) =>
  !map ? 
    object :
    _.isArray(map) ? 
      mapAttrubutes(object, map) :
      _.isFunction(map) ?
        map(object) : 
        {map : object[map]};

const mapAttrubutes = (object, attributes) =>
  _.reduce(attributes || [], (result, key) => {
        return { ...result, [key]: object[key] };
      }, {});

export const authorize = (config, database) => (req, res) => {
  const { secret, expiresIn, findUser = findUserFromConfig } = config;

  findUser(database, req, config)
    .then((user) => {
      // both, or only one can be specified
      let tokenConfig = config.tokenData || config.returnData;
      let returnConfig = config.returnData || config.tokenData;

      // structure can be an array, or a function
      const tokenData = runMap(user, tokenConfig);
      const returnData = runMap(user, returnConfig);

      // make a token, and return
      const token = jwt.sign(tokenData, secret, { expiresIn });
      res.json({
        success: true,
        token,
        returnData,
      });
    })
    .catch((err) => {
      logError(err);
      res.status(403).json({ success: false });
    });
};

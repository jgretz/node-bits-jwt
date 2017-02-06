import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logError } from 'node-bits';

const findUserFromConfig = (database, req, config) => {
  return new Promise((resolve, reject) => {
    const { user: { model, key, password } } = config;

    const query = {};
    query[key] = req.body[key];

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

export const authorize = (config, database) => (req, res) => {
  const { secret, expiresIn, findUser = findUserFromConfig } = config;

  findUser(database, req, config)
    .then((user) => {
      // get token
      const jwtConfig = { expiresIn };
      const token = jwt.sign(user, secret, jwtConfig);

      const data = _.reduce(config.returnData || [], (result, key) => {
        return { ...result, [key]: user[key] };
      }, {});

      // return
      res.json({
        success: true,
        token,
        data,
      });
    })
    .catch((err) => {
      logError(err);
      res.status(400).json({ success: false });
    });
};

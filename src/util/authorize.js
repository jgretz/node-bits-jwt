import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const authorize = (config, database) => (req, res) => {
  const { secret, expiresIn,  user: { model, key, password } } = config;

  const query = {};
  query[key] = req.body[key];

  const failure = () => {
    res.json({ success: false });
  };

  database.find(model, query)
    .then((users) => {
      if (users.length !== 1) {
        return failure();
      }

      const user = users[0];
      bcrypt.compare(req.body[password], user[password])
        .then((result) => {
          if (!result) {
            return failure();
          }

          // get token
          const jwtConfig = { expiresIn };
          const token = jwt.sign(user, secret, jwtConfig);

          const data = {};
          _.forEach(config.returnData || [], key => { data[key] = user[key]; });

          // return
          res.json({
            success: true,
            token,
            data,
          });
        })
        .catch(failure);
    })
    .catch(failure);
};

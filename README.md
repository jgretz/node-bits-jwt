# node-bits-jwt
node-bits-jwt provides json web token security to any node-bits server.

## Install
```
npm install node-bits-jwt --save
```

or

```
yarn add node-bits-jwt
```

## Configuration
node-bits-jwt has one of the larger config objects of all the bits. The bit tries to cut down on this size with intelligent defaults where possible.

will expose the authorization method by default at /api/authorize. The token generated will be expire in a day.


Example Config:
```
import nodeBitsJwt, { secureByRole } from 'node-bits-jwt';

nodeBitsExpress({
  hooks: [
    nodeBitsJwt({
      secret: 'reallylongrandomstring',
      user: {
        model: 'user',
        key: 'email',
        password: 'password',
      },
      restrict: [
        '/api'
      ],
      returnData: [
        'email',
        'role'
      ],
      securitySchemes: [
        secureByRole({
          roleKey: 'role',
          map: {
            admin: '*',
            sales: {
              '/api/customer*': [GET,POST,PUT],
              '/api/order': [GET,POST,PUT],
            },
            it: {
              '/api/*': [GET,POST,PUT,DELETE]
            }
          },
        }),
      ],
    })
  ],
}),
```

### secret
This is the secret key that is used to encrypt the token. I recommend loading this in from an environment variable for production.

### authorizeUrl

### expiresIn


### user or findUser


### Restrict

### Token Data

### Return Data

### Security Schemes

#### Secure By Role

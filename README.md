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
node-bits-jwt can have one of the larger config objects of all the bits. The bit tries to cut down on this size with intelligent defaults where possible.

Simplest Config:
```
import nodeBitsJwt from 'node-bits-jwt';

nodeBitsExpress({
  hooks: [
    nodeBitsJwt({
      secret: 'reallylongrandomstring',
      user: { model: 'user', key: 'email', password: 'password' },
      restrict: ['/api'],
    }),
  ],
}),
```

Complex Config:
```
import nodeBitsJwt, { secureByRole } from 'node-bits-jwt';

nodeBitsExpress({
  hooks: [
    nodeBitsJwt({
      authorizeUrl: '/authorize',
      expiresIn: '1w',
      secret: 'reallylongrandomstring',
      user: (database, request, config) => {
        return database.find({ where: { name: request.query.name }});
      },
      restrict: ['/api'],
      returnData: ['email', 'role'],
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

### authorizeUrl
This is the url to which a caller may post their authorization credentials in order to obtain a token. By default this is /api/authorize.

### expiresIn
The length of time a token is valid. By default this is 1 day. node-bits-jwt uses [momentjs](http://momentjs.com/) notation to express duration.

### secret
This is the secret key that is used to encrypt the token. I recommend loading this in from an environment variable for production.

### user or findUser
This is the model against which the bit needs to authorize the post data.

At its simplest, specify the model name along with the key and password fields:

```
user: {
  model: 'user',
  key: 'email',
  password: 'password',
},
```

Alternatively, you can specify a findUser method that has the signature: ```(database, request, config)```. node-bits-express expects you to return a promise which resolves with a user object if the authorization is successful, or is rejected if the authorization fails.

### restrict
This is an array of routes to which to apply the jwt security. node-bits-jwt will treat each string in this array as value* (i.e. /api will apply to all routes that start with /api such as /api/order or /api/foo).

### tokenData and returnData
tokenData is the data encrypted and stored in the token. Any data needed to apply the selected security scheme should be included in this token.

returnData is the data to be included in the json object that is returned by authorize post to the caller.

If only one of these is supplied, it will be used for both. If neither is specified, node-bits-jwt will use the full user object for both.

Both can be specified one of two ways:
* array: an array of strings that match the properties of the user object to included
* function: a function that accepts the user object and returns the json object to be use

### securitySchemes
An array of schemes to be applied. These are simple functions with the signature: ```(request, token)``` which should return true or false based on the ability of the token to access the route requested.

If not specified, all routes are available to all tokens.

node-bits-jwt provides the following schemes out of the box:

#### secureByRole
secureByRole requires two pieces of data: the field that represents the role on the user object and a map of potential values of that field to routes that role is allowed to access. This scheme is pessimistic meaning that if a role is not explicitly granted access, it will be rejected.

Example configuration:
```
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
```

#### secureManual
secureManual allows you to craft the security check to meet any requirement. It requires as its parameter a function with the signature ```(tokenData, database)``` that returns a Promise. If the promise resolves true, then the check will be considered as passed, if false, then failed.

Example configuration:
```
securitySchemes: [
  secureManual((tokenData, database) => {
    // do some database queries
    return Promise.resolve(true);
  }),
],
```

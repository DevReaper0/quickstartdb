# quickstartdb

QuickStartDB is a simple, easy-to-use library containing the code to quickly setup a basic JSON database and login system with Express.

QuickStartDB should not be used in large production environments on its own! It lacks security and efficiency!

To start, add the following code if you don't have it already:
```js
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

You also need `express-session` with a configured secret. You can use the following as an example:
```js
let secret = '';
if (fs.existsSync('.secret')) {
  secret = fs.readFileSync('.secret', 'utf8');
} else {
  const crypto = require("crypto");
  secret = crypto.randomBytes(20).toString("hex");
  fs.writeFileSync('.secret', secret, { flag: 'w+' });
}
var session = require('express-session');
app.use(session({ secret: secret, resave: false, saveUninitialized: false }));
```

The following code snippet is used to initialize QuickStartDB with a main database (`db.json`) and an authentication database (`authdb.json`):
```js
const { DBClientSync: Client, ExpressAuthSync: Auth } = require('quickstartdb');
const client = new Client();
client.init();

const auth = new Auth(app);
auth.init();
auth.createRoutes();
```

The constructor for both `DBClientSync` and `DBClient` takes in the following parameters:
- `filename` (defaults to `"db.json"`)
- `autoSave` (defaults to `true`)

`DBClientSync` and `DBClient` have the following methods:
- `init()` initializes everything.
- `load(allowAlreadyLoaded = false)`
- `save()`
- `get(key)`
- `set(key, value)`
- `delete(key)`
- `list(prefix = "")`
- `empty()`
- `getAll()`
- `setAll(data)`
- `deleteMultiple(...keys)`

The constructor for both `ExpressAuthSync` and `ExpressAuth` takes in the following parameters:
- `app`
- `db` (optional)
- `loginRoute` (defaults to `"/login"`)
- `loginApiRoute` (defaults to `"/login"`)
- `logoutRoute` (defaults to `"/logout"`)
- `registerRoute` (defaults to `"/register"`)
- `registerApiRoute` (defaults to `"/register"`)

`ExpressAuthSync` and `ExpressAuth` have the following methods:
- `init()` initializes everything.
- `createRoutes()` creates basic authentication routes on the `app` object provided to the constructor.
- `getUserInfo(req)` returns an object containing the user's ID and Username.
- `isAuthenticated(req)` returns whether or not the user is signed in.
- `requireAuth(req, res, redirectUrl)` redirects the user to `redirectUrl` if they are not signed in. `redirectUrl` is not required, and defaults to the configured login route (defaults to '/login').
- `requireUnauth(req, res, redirectUrl)` redirects the user to `redirectUrl` if they are signed in. `redirectUrl` is not required, and defaults to '/'.

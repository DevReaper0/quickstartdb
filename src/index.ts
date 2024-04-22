import * as fs from 'fs';

class DBClientSync {
  readonly filename: string;
  readonly autoSave: boolean;

  protected data: any;

  constructor(filename: string = "db.json", autoSave: boolean = true) {
    this.filename = filename;
    this.autoSave = autoSave;
    this.data = null;
  }

  init(): DBClientSync {
    this.load();
    return this;
  }

  protected load(allowAlreadyLoaded: boolean = false): any {
    if (!allowAlreadyLoaded && this.data) {
      return this.data;
    }

    if (fs.existsSync(this.filename)) {
      this.data = JSON.parse(fs.readFileSync(this.filename, "utf8"));
    } else {
      this.data = {};
    }
    return this.data;
  }

  save(): void {
    fs.writeFileSync(this.filename, JSON.stringify(this.data), { flag: 'w+' });
  }

  get(key: string): any {
    return this.data[key];
  }

  set(key: string, value: any): DBClientSync {
    this.data[key] = value;

    if (this.autoSave) {
      this.save();
    }
    return this;
  }

  delete(key: string): DBClientSync {
    delete this.data[key];

    if (this.autoSave) {
      this.save();
    }
    return this;
  }

  list(prefix: string = ""): string[] {
    return Object.keys(this.data).filter((key) => key.startsWith(prefix));
  }

  empty(): DBClientSync {
    this.data = {};

    if (this.autoSave) {
      this.save();
    }
    return this;
  }

  getAll(): any {
    return this.data;
  }

  setAll(data: any): DBClientSync {
    this.data = data;

    if (this.autoSave) {
      this.save();
    }
    return this;
  }

  deleteMultiple(...keys: string[]): DBClientSync {
    keys.forEach((key) => {
      delete this.data[key];
    });

    if (this.autoSave) {
      this.save();
    }
    return this;
  }
}

class DBClient {
  readonly filename: string;
  readonly autoSave: boolean;

  protected data: any;

  constructor(filename: string = "db.json", autoSave: boolean = true) {
    this.filename = filename;
    this.autoSave = autoSave;
    this.data = null;
  }

  async init(): Promise<DBClient> {
    await this.load();
    return this;
  }

  protected async load(allowAlreadyLoaded: boolean = false): Promise<any> {
    if (!allowAlreadyLoaded && this.data) {
      return this.data;
    }

    try {
      this.data = JSON.parse(await fs.promises.readFile(this.filename, "utf8"));
    } catch (_) {
      this.data = {};
    }
    return this.data;
  }

  async save(): Promise<void> {
    await fs.promises.writeFile(this.filename, JSON.stringify(this.data), { flag: 'w+' });
  }

  async get(key: string): Promise<any> {
    return this.data[key];
  }

  async set(key: string, value: any): Promise<DBClient> {
    this.data[key] = value;

    if (this.autoSave) {
      await this.save();
    }
    return this;
  }

  async delete(key: string): Promise<DBClient> {
    delete this.data[key];

    if (this.autoSave) {
      await this.save();
    }
    return this;
  }

  async list(prefix: string = ""): Promise<string[]> {
    return Object.keys(this.data).filter((key) => key.startsWith(prefix));
  }

  async empty(): Promise<DBClient> {
    this.data = {};

    if (this.autoSave) {
      await this.save();
    }
    return this;
  }

  async getAll(): Promise<any> {
    return this.data;
  }

  async setAll(data: any): Promise<DBClient> {
    this.data = data;

    if (this.autoSave) {
      await this.save();
    }
    return this;
  }

  async deleteMultiple(...keys: string[]): Promise<DBClient> {
    keys.forEach((key) => {
      delete this.data[key];
    });

    if (this.autoSave) {
      await this.save();
    }
    return this;
  }
}

class ExpressAuthSync {
  protected app: any;
  protected db: DBClientSync;

  protected loginRoute: string;
  protected loginApiRoute: string;
  protected logoutRoute: string;
  protected registerRoute: string;
  protected registerApiRoute: string;

  constructor(app: any, db?: DBClientSync, loginRoute: string = "/login", loginApiRoute: string = "/login", logoutRoute: string = "/logout", registerRoute: string = "/register", registerApiRoute: string = "/register") {
    this.app = app;
    this.db = db || new DBClientSync('authdb.json');

    this.loginRoute = loginRoute;
    this.loginApiRoute = loginApiRoute;
    this.logoutRoute = logoutRoute;
    this.registerRoute = registerRoute;
    this.registerApiRoute = registerApiRoute;
  }

  init(): ExpressAuthSync {
    this.db.init();
    return this;
  }

  createRoutes(): ExpressAuthSync {
    this.app.get(this.loginRoute, (req: any, res: any) => {
      if (this.requireUnauth(req, res)) return;

      res.setHeader("Content-Type", "text/html");
      res.send(`
<form action="${this.loginApiRoute}" method="POST">
  <input type="text" name="username" placeholder="Username" />
  <input type="password" name="password" placeholder="Password" />
  <input type="submit" value="Login" />
</form>
      `);
    });

    this.app.post(this.loginApiRoute, (req: any, res: any) => {
      if (this.requireUnauth(req, res)) return;

      if (req.body.username && req.body.password) {
        let user = this.db.get(req.body.username);
        if (user && user.password === req.body.password) {
          req.session.user = req.body.username;
          res.redirect("/");
          return;
        }
      }
      res.redirect(this.loginRoute);
    });

    this.app.all(this.logoutRoute, (req: any, res: any) => {
      if (this.requireAuth(req, res)) return;

      req.session.user = null;
      res.redirect(this.loginRoute);
    });

    this.app.get(this.registerRoute, (req: any, res: any) => {
      if (this.requireUnauth(req, res)) return;

      res.setHeader("Content-Type", "text/html");
      res.send(`
<form action="${this.registerApiRoute}" method="POST">
  <input type="text" name="username" placeholder="Username" />
  <input type="password" name="password" placeholder="Password" />
  <input type="submit" value="Register" />
</form>
      `);
    });

    this.app.post(this.registerApiRoute, (req: any, res: any) => {
      if (this.requireUnauth(req, res)) return;

      if (req.body.username && req.body.password) {
        let user = this.db.get(req.body.username);
        if (!user) {
          this.db.set(req.body.username, {
            id: Math.random().toString(36).substr(2, 9),
            username: req.body.username,
            password: req.body.password,
          });
          req.session.user = req.body.username;
          res.redirect("/");
          return;
        }
        res.redirect(this.loginRoute);
        return;
      }
      res.redirect(this.registerRoute);
    });

    return this;
  }

  getUserInfo(req: any): any {
    if (!req.session.user) {
      return null;
    }

    let user = this.db.get(req.session.user);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  isAuthenticated(req: any): boolean {
    return this.getUserInfo(req) !== null;
  }

  requireAuth(req: any, res: any, redirectUrl?: string): boolean {
    if (!this.isAuthenticated(req)) {
      res.redirect(redirectUrl || this.loginRoute);
      return true;
    }
    return false;
  }

  requireUnauth(req: any, res: any, redirectUrl?: string): boolean {
    if (this.isAuthenticated(req)) {
      res.redirect(redirectUrl || "/");
      return true;
    }
    return false;
  }
}

class ExpressAuth {
  protected app: any;
  protected db: DBClient;

  protected loginRoute: string;
  protected loginApiRoute: string;
  protected logoutRoute: string;
  protected registerRoute: string;
  protected registerApiRoute: string;

  constructor(app: any, db?: DBClient, loginRoute: string = "/login", loginApiRoute: string = "/login", logoutRoute: string = "/logout", registerRoute: string = "/register", registerApiRoute: string = "/register") {
    this.app = app;
    this.db = db || new DBClient('authdb.json');

    this.loginRoute = loginRoute;
    this.loginApiRoute = loginApiRoute;
    this.logoutRoute = logoutRoute;
    this.registerRoute = registerRoute;
    this.registerApiRoute = registerApiRoute;
  }

  async init(): Promise<ExpressAuth> {
    await this.db.init();
    return this;
  }

  createRoutes(): ExpressAuth {
    this.app.get(this.loginRoute, async (req: any, res: any) => {
      if (await this.requireUnauth(req, res)) return;

      res.setHeader("Content-Type", "text/html");
      res.send(`
<form action="${this.loginApiRoute}" method="POST">
  <input type="text" name="username" placeholder="Username" />
  <input type="password" name="password" placeholder="Password" />
  <input type="submit" value="Login" />
</form>
      `);
    });

    this.app.post(this.loginApiRoute, async (req: any, res: any) => {
      if (await this.requireUnauth(req, res)) return;

      if (req.body.username && req.body.password) {
        let user = await this.db.get(req.body.username);
        if (user && user.password === req.body.password) {
          req.session.user = req.body.username;
          res.redirect("/");
          return;
        }
      }
      res.redirect(this.loginRoute);
    });

    this.app.all(this.logoutRoute, async (req: any, res: any) => {
      if (await this.requireAuth(req, res)) return;

      req.session.user = null;
      res.redirect(this.loginRoute);
    });

    this.app.get(this.registerRoute, async (req: any, res: any) => {
      if (await this.requireUnauth(req, res)) return;

      res.setHeader("Content-Type", "text/html");
      res.send(`
<form action="${this.registerApiRoute}" method="POST">
  <input type="text" name="username" placeholder="Username" />
  <input type="password" name="password" placeholder="Password" />
  <input type="submit" value="Register" />
</form>
      `);
    });

    this.app.post(this.registerApiRoute, async (req: any, res: any) => {
      if (await this.requireUnauth(req, res)) return;

      if (req.body.username && req.body.password) {
        let user = await this.db.get(req.body.username);
        if (!user) {
          this.db.set(req.body.username, {
            id: Math.random().toString(36).substr(2, 9),
            username: req.body.username,
            password: req.body.password,
          });
          req.session.user = req.body.username;
          res.redirect("/");
          return;
        }
        res.redirect(this.loginRoute);
        return;
      }
      res.redirect(this.registerRoute);
    });

    return this;
  }

  async getUserInfo(req: any): Promise<any> {
    if (!req.session.user) {
      return null;
    }

    let user = await this.db.get(req.session.user);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  async isAuthenticated(req: any): Promise<boolean> {
    return await this.getUserInfo(req) !== null;
  }

  async redirectUnauth(req: any, res: any, redirectUrl?: string): Promise<void> {
    if (!await this.isAuthenticated(req)) {
      res.redirect(redirectUrl || this.loginRoute);
    }
  }

  async redirectAuth(req: any, res: any, redirectUrl?: string): Promise<void> {
    if (await this.isAuthenticated(req)) {
      res.redirect(redirectUrl || "/");
    }
  }

  async requireAuth(req: any, res: any, redirectUrl?: string): Promise<boolean> {
    if (!await this.isAuthenticated(req)) {
      res.redirect(redirectUrl || this.loginRoute);
      return true;
    }
    return false;
  }

  async requireUnauth(req: any, res: any, redirectUrl?: string): Promise<boolean> {
    if (await this.isAuthenticated(req)) {
      res.redirect(redirectUrl || "/");
      return true;
    }
    return false;
  }
}

module.exports = { DBClientSync, DBClient, ExpressAuthSync, ExpressAuth };

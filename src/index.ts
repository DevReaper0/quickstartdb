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
    fs.writeFileSync(this.filename, JSON.stringify(this.data));
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
    await fs.promises.writeFile(this.filename, JSON.stringify(this.data));
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

module.exports = { DBClientSync, DBClient };

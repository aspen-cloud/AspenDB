import PouchDB from "pouchdb";

PouchDB.plugin(require("pouchdb-adapter-node-websql"));
PouchDB.plugin(require("pouchdb-find"));
const { getDataHome } = require("platform-folders");
const appDirectory = `${getDataHome()}/aspen/`;

export default class AspenDB {
  app: string;
  db: PouchDB.Database;

  static localDBPath = appDirectory + "aspen_local.db";

  constructor(appName: string) {
    this.db = new PouchDB(AspenDB.localDBPath, { adapter: "websql" });
    this.app = appName;
  }

  async add(doc: object) {
    return this.db.post({ ...doc, aspen_app: this.app });
  }

  async addAll(docs: Array<object>) {
    return this.db.bulkDocs(docs.map(doc => ({ ...doc, aspen_app: this.app })));
  }

  async all(options: any) {
    const { rows } = await this.db.allDocs(options);
    return rows;
  }

  async find(query: PouchDB.Find.FindRequest<{}>) {
    return this.db.find(query);
  }
}

import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-upsert"));
const { getDataHome } = require("platform-folders");
const appDirectory = `${getDataHome()}/aspen/`;
const collate = require("pouchdb-collate");
const shortid = require("shortid");

interface iInsertableDoc {
  id?: string;
  type?: string;
  [key: string]: any;
}

export default class AspenDB {
  app: string;
  db: PouchDB.Database;

  static localDBPath = appDirectory + "aspen_local.db";

  constructor(db: PouchDB.Database<{}>, appName: string) {
    this.db = db;
    this.app = appName;
  }

  async add(doc: iInsertableDoc, type?: string) {
    return this.db.putIfNotExists(this.addIdToDoc(doc, type));
  }

  private addIdToDoc(
    doc: iInsertableDoc,
    type?: string,
  ): { _id: string; [key: string]: any } {
    const docId = doc.id || shortid.generate();
    const docType = type || doc.type;
    const indexableAttributes = docType
      ? [this.app, docType, docId]
      : [this.app, docId];
    const fullId = collate.toIndexableString(indexableAttributes);
    return { ...doc, _id: fullId };
  }

  async addAll(docs: Array<object>) {
    return this.db.bulkDocs(docs.map(doc => this.addIdToDoc(doc)));
  }

  async all(type?: string) {
    const indexArray = type ? [this.app, type] : [this.app];
    const startkey = collate.toIndexableString(indexArray);
    const endkey = collate.toIndexableString([...indexArray, "\ufff0"]);
    const { rows } = await this.db.allDocs({
      startkey,
      endkey,
    });
    return rows;
  }

  async find(query: PouchDB.Find.FindRequest<{}>) {
    return this.db.find(query);
  }
}

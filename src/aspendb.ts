import PouchDB from "pouchdb";
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-upsert"));
const collate = require("pouchdb-collate");
import shortid from "shortid";

interface iInsertableDoc {
  id?: string;
  type?: string;
  [key: string]: any;
}

export default class AspenDB {
  db: PouchDB.Database;

  constructor(db: PouchDB.Database<{}>) {
    this.db = db;
  }

  app(appId: string) {
    return new AspenAppScope(this.db, appId);
  }
}

export class AspenAppScope {
  global: PouchDB.Database;
  appId: string;

  constructor(global: PouchDB.Database<{}>, appId: string) {
    this.global = global;
    this.appId = appId;
  }

  async add(doc: iInsertableDoc, type?: string) {
    return this.global.putIfNotExists(this.addIdToDoc(doc, type));
  }

  private createFullId(id: string, docType?: string) {
    const indexableAttributes = docType
      ? [this.appId, docType, id]
      : [this.appId, id];

    return collate.toIndexableString(indexableAttributes);
  }

  private addIdToDoc(
    doc: iInsertableDoc,
    type?: string,
  ): { _id: string; [key: string]: any } {
    const docId = doc.id || shortid.generate();
    const docType = type || doc.type;
    const fullId = this.createFullId(docId, docType);

    return { ...doc, _id: fullId };
  }

  async addAll(docs: Array<object>) {
    return this.global.bulkDocs(docs.map(doc => this.addIdToDoc(doc)));
  }

  async all({
    type,
    fullDocs = false,
  }: { type?: string; fullDocs?: boolean } = {}) {
    const indexArray = type ? [this.appId, type] : [this.appId];
    const startkey = collate.toIndexableString(indexArray);
    const endkey = collate.toIndexableString(indexArray) + "\ufff0";
    const { rows } = await this.global.allDocs({
      startkey,
      endkey,
      include_docs: fullDocs,
    });
    return rows;
  }

  async find(query: PouchDB.Find.FindRequest<{}>) {
    return this.global.find(query);
  }

  async putIndex(index: { fields: string[]; name?: string }) {
    return this.global.createIndex({
      index: { ...index, ddoc: this.appId, type: "json" },
    });
  }

  async get(id: string) {
    return this.global.get(this.createFullId(id));
  }

  async upsert(id: string, diffFunc: PouchDB.UpsertDiffCallback<Object>) {
    return this.global.upsert(this.createFullId(id), diffFunc);
  }

  async putIfNotExits(doc: { _id: string }) {
    return this.global.putIfNotExists(doc);
  }
}

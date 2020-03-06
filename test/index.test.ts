import { expect } from "chai";
import "mocha";
import PouchDB from "pouchdb";
import AspenDB from "../src/aspendb";

PouchDB.plugin(require("pouchdb-adapter-memory"));

let pouchdb = new PouchDB("test", { adapter: "memory" });
let db1 = new AspenDB(pouchdb, "app1");
let db2 = new AspenDB(pouchdb, "app2");

async function resetDB() {
  await pouchdb.destroy();
  pouchdb = new PouchDB("test", { adapter: "memory" });
  db1 = new AspenDB(pouchdb, "app1");
  db2 = new AspenDB(pouchdb, "app2");
}

describe("Multiple adds and one addAll are equivalent", () => {
  let db1Mirror: AspenDB;
  let seedDocs = [
    { val: 123, id: "testId" },
    { val: "test" },
    { field: [1, 2, 3], id: "123", type: "arr" },
  ];
  before(async () => {
    await resetDB();
    db1Mirror = new AspenDB(pouchdb, "app1");

    await Promise.all([
      db1.addAll(seedDocs),
      ...seedDocs.map(doc => db1Mirror.add(doc)),
    ] as Promise<any>[]);
  });

  it("should upsert when id is present and produce new ids when not", async () => {
    const masterDocs = await pouchdb.allDocs();
    const numDocsWithIds = seedDocs.filter(doc => !!doc.id).length;
    const numDocsWithoutIds = seedDocs.length - numDocsWithIds;
    expect(masterDocs.rows.length).to.equal(
      numDocsWithIds + 2 * numDocsWithoutIds,
    );
  });

  it("should produce equivalent docs", async () => {
    const docs1 = await db1.all();
    const docs2 = await db1Mirror.all();
    expect(docs1).to.eql(docs2); // Note: eql does a deep comparison
  });
});

describe("Has properly scoped documents and indexes", () => {
  const db1Docs = [{ val: 123 }, { val: "test" }];
  const db2Docs = [{ val: 123 }, { val: "test" }, { val: 456 }];
  before(async () => {
    await resetDB();
    //Seed databases
    const db1Inserts = db1Docs.map(doc => db1.add(doc));
    const db2Inserts = db2Docs.map(doc => db2.add(doc));
    await Promise.all([...db1Inserts, ...db2Inserts]);
  });
  it("should contain all values in master db", async () => {
    const docs = await pouchdb.allDocs();
    expect(docs.rows.length).to.equal(db1Docs.length + db2Docs.length);
  });

  it("should have the correct docs in db1", async () => {
    const docs = await db1.all();
    expect(docs.length).to.equal(db1Docs.length);
  });

  it("should have the correct docs in db2", async () => {
    const docs = await db2.all();
    expect(docs.length).to.equal(db2Docs.length);
  });
});

describe("Correctly scopes to types", () => {
  before(async () => {
    await resetDB();
    //seed db
    const db1Docs = [
      { val: 123, type: "num" },
      { val: 456, type: "num" },
      { val: "test", type: "msg" },
    ];

    await Promise.all(db1Docs.map(doc => db1.add(doc)));
  });

  it("should return just the type of doc requested", async () => {
    const numDocs = await db1.all("num");
    expect(numDocs.length).to.equal(2);
    const msgDocs = await db1.all("msg");
    expect(msgDocs.length).to.equal(1);
  });
});

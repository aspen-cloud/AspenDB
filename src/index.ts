import PouchDB from "pouchdb";
import AspenDB from "./aspendb";

PouchDB.plugin(require("pouchdb-adapter-node-websql"));

export default AspenDB.bind(
  null,
  new PouchDB(AspenDB.localDBPath, { adapter: "websql" }),
);

import PouchDB from "pouchdb";
import AspenDB from "./aspendb";
import { DefaultDeserializer } from "v8";

PouchDB.plugin(require("pouchdb-adapter-node-websql"));

const LocalAspenDB = AspenDB.bind(
  null,
  new PouchDB(AspenDB.localDBPath, { adapter: "websql" }),
);

export { LocalAspenDB as default, AspenDB };

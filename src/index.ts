import PouchDB from "pouchdb";
import AspenDB, { AspenAppScope } from "./aspendb";

PouchDB.plugin(require("pouchdb-adapter-node-websql"));

const { getDataHome } = require("platform-folders");
const appDirectory = `${getDataHome()}/aspen/`;
const localDBPath = appDirectory + "aspen_local.db";

const LocalAspenDB = AspenDB.bind(
  null,
  new PouchDB(localDBPath, { adapter: "websql" }),
);

export { LocalAspenDB as default, AspenDB, AspenAppScope };

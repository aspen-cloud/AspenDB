import PouchDB from "pouchdb";
import AspenDB, { AspenAppScope } from "./aspendb";

PouchDB.plugin(require("pouchdb-adapter-node-websql"));

const { getDataHome } = require("platform-folders");
const appDirectory = `${getDataHome()}/aspen/`;
const LOCAL_DB_PATH = appDirectory + "aspen_local.db";

const LocalAspenDB = AspenDB.bind(
  null,
  new PouchDB(LOCAL_DB_PATH, { adapter: "websql" }),
);

export { LocalAspenDB as default, AspenDB, AspenAppScope };

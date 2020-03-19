# AspenDB
AspenDB is a database designed to capture the data from the apps and services you use like Spotify, Gmail, and more.

Made by the folks at [Aspen](https://aspen.cloud)

## Key Features
- Multiple apps in one database
- Store any JSON data
- Sync to Aspen Cloud or any CouchDB instance to make your data available anywhere

## Getting started
The fastest way to start using AspenDB for your own data is to use [Aspen CLI](https://github.com/aspen-cloud/aspen-cli)

### Installation
Install with NPM or Yarn

`npm i @aspen.cloud/aspendb`

`yarn add @aspen.cloud/aspendb`

You might also need to install `gcc` for the some of the dependencies. 

### Import Aspen Local

```javascript
import AspenLocalDB from '@aspen.cloud/aspendb';
const aspendb = new AspenLocalDB();
```

### Add data for your apps
```javascript
await aspendb.app('my-notes').add({title: 'Data Ownership', body: 'In the future, users should own and control their data.'})
await aspendb.app('my-notes').add({title: 'Music Library', body: 'I need to make a universal music library that includes Spotify and Soundcloud.'})

await aspendb.app('music').add(aspendb.app('music').add({type: 'track', title: 'Nights', artist: 'Frank Ocean' }););
await aspendb.app('music').add({type: 'album', title: 'Coloring Book', artist: 'Chance the Rapper' });
```

### Get your data 
```javascript
await aspendb.app('music').all();
// Return all documents in 'music'
```
or get *all* of your data
```javascript
// aspendb.global gives you a reference to the underlying PouchDB instance
await aspendb.global.allDocs();
// Returns all documents from 'music' and 'my-notes'
```

### Query your data
```javascript
const trackQuery = { selector: { type: { $eq: "tracks" } } };
await aspendb.app('music').find(trackQuery);
// Returns tracks from your collection 'music'
```

## Technologies used
- Written in **Typescript**
- **PouchDB**, under the hood, to handle syncing and querying.
- **SQLite** as the storage engine used locally. 

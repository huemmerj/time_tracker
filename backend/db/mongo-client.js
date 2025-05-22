const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined in .env');
}

const client = new MongoClient(uri);

const dbName = process.env.MONGO_DB_NAME || 'time_tracker';

const getDb = () => client.db(dbName);

const collections = {
  projects: () => getDb().collection('projects'),
  tags: () => getDb().collection('tags'),
};

module.exports = {
  client,
  getDb,
  collections,
};

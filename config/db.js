const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDb Connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Exit process with failure
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

module.exports = connectDb;

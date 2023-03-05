const mongoose = require('mongoose');

const db = process.env.MONGO_URI;

console.log(process.env.MONGO_URI);

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

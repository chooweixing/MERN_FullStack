const mongoose = require('mongoose');
const config = require('config');

const connectDB = async() => {
  try {
    await mongoose.connect(config.get('DB_url'),
    {useNewUrlParser: true,useCreateIndex:true,useFindAndModify:false}
    );
    console.log("Connected to Mongo DateBase")
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports=connectDB;

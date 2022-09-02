const mongoose = require("mongoose")
const url = process.env.MONGO_DB_CONNECTION_STRING
mongoose.connect(url);


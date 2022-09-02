const mongoose = require("mongoose")
const Schema = mongoose.Schema


const ParibuAccount = new Schema({
	mobile: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
	},
	loginToken: {
		type: String,
		unique: true,
	},
	otpToken: {
		type: String,
		unique: true,
	},
	creator: {
		type: String,
		index: true,
	},
})

module.exports = mongoose.model("ParibuAccount", ParibuAccount)
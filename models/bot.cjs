const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Bot = new Schema({
	sourceParity: {
		type: String,
	},
	targetExchangeAccountID: {
		type: String,
	},
	targetParity: {
		type: String,
	},
	targetCode: {
		type: String,
		unique: true,
	},
	targetParityOrderFrequency: {
		type: Number,
		default: null,
	},
	targetParityOrderAmount: {
		type: Number,
	},
	outerVariable: {
		type: String,
		default: "",
	},
	outerVariableCalcMethodID: {
		type: Number,
		default: 1
	},
	creator: {
		type: String,
		index: true,
	},
	status: {
		type: Boolean,
	},
	created: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model("Bot", Bot)
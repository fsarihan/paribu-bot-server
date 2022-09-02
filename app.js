import appRouter from './routes/appRoutes.mjs';
import {createRequire} from 'module';
import {BotLib} from './lib/bot.js';


const require = createRequire(import.meta.url);


const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const passport = require("passport")

if (process.env.NODE_ENV !== "production") {
	// Load environment variables from .env file in non prod environments
	require("dotenv").config()
}
require("./utils/connectdb.cjs")

require("./strategies/JwtStrategy.cjs")
require("./strategies/LocalStrategy.cjs")
require("./authenticate.cjs")


const app = express()

app.use(bodyParser.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

//Add the client URL to the CORS policy

const whitelist = process.env.WHITELISTED_DOMAINS
	? process.env.WHITELISTED_DOMAINS.split(",")
	: []

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error("Not allowed by CORS"))
		}
	},
	credentials: true,
}
app.use(cors(corsOptions))
app.use(passport.initialize())
app.use("/app", appRouter)
app.get("/", function (req, res) {
	res.send({status: "success"})
})

//Start the server in port 8081

const server = app.listen(process.env.PORT || 8081, function () {
	const port = server.address().port
	console.log("App started at port:", port)
	BotLib.initBots();
})


// import Readline from 'readline';
//
// const readline = Readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// })
// Paribu.login("11", "11");
// readline.question(`Token and code?`, name => {
// 	let splitted = name.split("-");
// 	Paribu.twoFactor(splitted[0], splitted[1]);
// 	readline.close()
// })


// const readline = Readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// })
// Paribu.login("112", "112");
// readline.question(`Token and code?`, name => {
// 	let splitted = name.split("-");
// 	Paribu.twoFactor(splitted[0], splitted[1]);
// 	readline.close()
// })
// 2
// let orderMock = {
// 	authorization: "*****************",
// 	tradeData: {
// 		amount: "1.40",
// 		price: "50",
// 		total: "70",
// 		market: "avax-usdt",
// 		condition: "",
// 		trade: "buy",
// 		type: "limit"
// 	}
// }
// Paribu.newOrder(orderMock.authorization, orderMock.tradeData);

// Paribu.deleteOrders(orderMock.authorization, "avax-usdt");


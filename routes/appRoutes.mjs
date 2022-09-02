import Paribu from '../lib/paribu.js';
import {BotLib}from '../lib/bot.js';
import {createRequire} from 'module';


const require = createRequire(import.meta.url);
const express = require("express")
const router = express.Router()
const User = require("../models/user.cjs")
const passport = require("passport")
const {getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser} = require("../authenticate.cjs")
const jwt = require("jsonwebtoken")
const ParibuAccount = require("../models/paribuAccount.cjs")
const Bot = require("../models/bot.cjs")


router.get("/logout", verifyUser, (req, res, next) => {
	const {signedCookies = {}} = req
	const {refreshToken} = signedCookies
	User.findById(req.user._id).then(
		user => {
			const tokenIndex = user.refreshToken.findIndex(
				item => item.refreshToken === refreshToken
			)

			if (tokenIndex !== -1) {
				user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
			}

			user.save((err, user) => {
				if (err) {
					res.statusCode = 500
					res.send(err)
				} else {
					res.clearCookie("refreshToken", COOKIE_OPTIONS)
					res.send({success: true})
				}
			})
		},
		err => next(err)
	)
})

router.get("/me", verifyUser, (req, res, next) => {
	res.send(req.user)
})
router.post("/add-paribu-account", verifyUser, (req, res, next) => {
	Paribu.login(req.body.mobile, req.body.password).then(r => {
		if (r.data.success === true) {
			let paribuAccount = new ParibuAccount({
				mobile: req.body.mobile,
				password: req.body.password,
				creator: req.user.username,
				otpToken: r.data.data.token
			});
			paribuAccount.save(function (err, data) {
				if (err) {
					res.statusCode = 500
					res.send(err)
				} else {
					res.send(r.data);
				}
			})
		} else {
			res.statusCode = 401
			res.send("Unauthorized")
		}

	}).catch(err => {
		res.statusCode = 422
		res.send(err.data);
	});
})
router.post("/2fa-paribu-account", verifyUser, (req, res, next) => {
	Paribu.twoFactor(req.body.code, req.body.token).then(r => {
		if (r.data.success === true) {
			ParibuAccount.updateOne({otpToken: req.body.token}, {loginToken: r.data.data.token}, function (err, log) {
				if (err) {
					res.statusCode = 500
					res.send(err)
				} else {
					res.send(r.data);
				}
			});
		} else {
			res.statusCode = 402
			res.send("Unauthorized2")
		}

	}).catch(err => {
		res.statusCode = 422
		res.send(err.data);
	});
})

router.post("/refreshToken", (req, res, next) => {
	const {signedCookies = {}} = req
	const {refreshToken} = signedCookies

	if (refreshToken) {
		try {
			const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
			const userId = payload._id
			User.findOne({_id: userId}).then(
				user => {
					if (user) {
						// Find the refresh token against the user record in database
						const tokenIndex = user.refreshToken.findIndex(
							item => item.refreshToken === refreshToken
						)

						if (tokenIndex === -1) {
							res.statusCode = 401
							res.send("Unauthorized")
						} else {
							const token = getToken({_id: userId})
							// If the refresh token exists, then create new one and replace it.
							const newRefreshToken = getRefreshToken({_id: userId})
							user.refreshToken[tokenIndex] = {refreshToken: newRefreshToken}
							user.save((err, user) => {
								if (err) {
									res.statusCode = 500
									res.send(err)
								} else {
									res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
									res.send({success: true, token})
								}
							})
						}
					} else {
						res.statusCode = 401
						res.send("Unauthorized")
					}
				},
				err => next(err)
			)
		} catch (err) {
			res.statusCode = 401
			res.send("Unauthorized")
		}
	} else {
		res.statusCode = 401
		res.send("Unauthorized")
	}
})

//...

router.post("/login", passport.authenticate("local"), (req, res, next) => {
	const token = getToken({_id: req.user._id})
	const refreshToken = getRefreshToken({_id: req.user._id})
	User.findById(req.user._id).then(
		user => {
			user.refreshToken.push({refreshToken})
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500
					res.send(err)
				} else {
					res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
					res.send({success: true, token})
				}
			})
		},
		err => next(err)
	)
})


router.post("/signup", (req, res, next) => {
	// Verify that first name is not empty
	if (!req.body.password) {
		res.statusCode = 500
		res.send({
			name: "passwordError",
			message: "The password is required!",
		})
	} else {
		User.register(
			new User({username: req.body.username}),
			req.body.password,
			(err, user) => {
				if (err) {
					res.statusCode = 500
					res.send(err)
				} else {
					const token = getToken({_id: user._id})
					const refreshToken = getRefreshToken({_id: user._id})
					user.refreshToken.push({refreshToken})
					user.save((err, user) => {
						if (err) {
							res.statusCode = 500
							res.send(err)
						} else {
							res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
							res.send({success: true, token})
						}
					})
				}
			}
		)
	}
})
router.post("/accounts", verifyUser, (req, res, next) => {
	ParibuAccount.find().then(all => {
		console.log(all);
		res.send(all);
	})
})
router.post("/new-bot", verifyUser, (req, res, next) => {

	if (req.body) {
		let sourceParityA = req.body.sourceParity.split("/")[req.body.sourceParity.split("/").length - 1];
		let targetParityA = req.body.targetParity.split("/")[req.body.targetParity.split("/").length - 1];
		let newBot = new Bot({
			sourceParity: sourceParityA,
			targetExchangeAccountID: req.body['paribuAccount'],
			targetParity: targetParityA,
			targetParityOrderFrequency: req.body.targetParityOrderFrequency,
			targetParityOrderAmount: req.body.targetParityOrderAmount,
			outerVariable: req.body.outerVariable,
			creator: req.user.username,
			status: true,
			targetCode: (req.body['paribuAccount'] + targetParityA).toString("base64"),
		});
		newBot.save(function (err, data) {
			if (err) {
				res.statusCode = 500
				res.send(err)
			} else {
				BotLib.initBots();
				res.send(data);
			}
		})
	}
})
export default router;

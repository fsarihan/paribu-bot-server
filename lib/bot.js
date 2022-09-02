import BinanceLib from './binance.js';
import Bot from "../models/bot.cjs";
import ParibuAccount from "../models/paribuAccount.cjs";
import Paribu from "./paribu.js";

const timeout = 17500;
let queue = [];
global.bots = {};
global.activeBots = [];

const singleOrderChain = (id) => {
	return new Promise((resolve, reject) => {

		let activeBot = global.bots[id];
		if (typeof activeBot !== "undefined") {
			console.log("Single order for:", id, " target parity:", activeBot.targetParity);
			let sourcePrice = BinanceLib.getPrice(activeBot.sourceParity.replace("_", ""))
			let buyPercent = 1 - parseFloat(activeBot.targetParityOrderFrequency) / 100;
			let sellPercent = 1 + parseFloat(activeBot.targetParityOrderFrequency) / 100;
			let buyPrice = (parseFloat(sourcePrice.close) * buyPercent).toString();
			let sellPrice = (parseFloat(sourcePrice.close) * sellPercent).toString();
			let buyOrderData = {
				amount: activeBot.targetParityOrderAmount,
				price: buyPrice,
				total: (parseFloat(sourcePrice.close) * buyPercent * parseFloat(activeBot.targetParityOrderAmount)).toString(),
				market: activeBot.targetParity,
				condition: "",
				trade: "buy",
				type: "limit"
			}
			let sellOrderData = {
				amount: activeBot.targetParityOrderAmount,
				price: sellPrice,
				total: (parseFloat(sourcePrice.close) * sellPercent * parseFloat(activeBot.targetParityOrderAmount)).toString(),
				market: activeBot.targetParity,
				condition: "",
				trade: "sell",
				type: "limit"
			}
			let deleteOrder = () => {
				return new Promise((resolve, reject) => {
					Paribu.deleteOrders(activeBot.authToken, activeBot.targetParity);
					resolve(true);
				});

			}
			let buyOrder = () => {
				return new Promise((resolve, reject) => {
					Paribu.newOrder(activeBot.authToken, buyOrderData).then(newBalance => {
						if (newBalance !== true) {
							let newAmount = (parseFloat(newBalance) / parseFloat(buyPrice)).toString();
							let buyOrderDataNew = {
								amount: newAmount,
								price: buyPrice,
								total: (parseFloat(newAmount) * parseFloat(buyPrice)).toString(),
								market: activeBot.targetParity,
								condition: "",
								trade: "buy",
								type: "limit"
							}
							setTimeout(() => {
								Paribu.newOrder(activeBot.authToken, buyOrderDataNew).then((e) => {
									resolve(true);
								}).catch(r => {
									resolve(true);
								});
							}, timeout);
						} else {
							resolve(true);
						}
					}).catch(e => {
						resolve(true);
					});
				});
			}
			let sellOrder = () => {
				return new Promise((resolve, reject) => {
					Paribu.newOrder(activeBot.authToken, sellOrderData).then(newBalance => {
						if (newBalance !== true) {
							let sellOrderDataNew = {
								amount: newBalance,
								price: sellPrice,
								total: (parseFloat(newBalance) * parseFloat(buyPrice)).toString(),
								market: activeBot.targetParity,
								condition: "",
								trade: "sell",
								type: "limit"
							}
							setTimeout(() => {
								Paribu.newOrder(activeBot.authToken, sellOrderDataNew).then((e) => {
									resolve(true);
								}).catch(r => {
									resolve(true);
								});

							}, timeout);
						} else {
							resolve(true);
						}
					}).catch(r => {
						resolve(true);
					});
				});
			}
			let next = () => {
				console.log("finish");
				resolve(true);
			}

			deleteOrder().then(() => {
				setTimeout(() => {
					console.log("buy order");
					buyOrder().then(() => {
						setTimeout(() => {
							console.log("sell order");
							sellOrder().then(() => {
									next();
								}
							).catch(e => {
								next();
							})
						}, timeout);
					})
				}, timeout);
			})
		} else {
			resolve(true);
		}
	});
}

setInterval(() => {
	for (let id of global.activeBots) {
		queue.push(id);
	}
}, 30000);
setTimeout(() => {
	chainer();
}, 5000);
let chainer = () => {
	let id = queue.shift();
	if (typeof id !== "undefined") {
		singleOrderChain(id).then(() => {
			setTimeout(() => {
				chainer();
			}, timeout)
		});
	} else {
		setTimeout(() => {
			chainer();
		}, timeout)
	}

}

export class BotLib {
	static initBots() {
		global.bots = {};
		global.activeBots = [];
		queue = [];
		Bot.find().then(all => {
			for (let singleBot of all) {
				ParibuAccount.findById(singleBot.targetExchangeAccountID).then((paribuAccount) => {
					global.bots[singleBot._id] = singleBot;
					global.bots[singleBot._id]["authToken"] = paribuAccount.loginToken;
					global.bots[singleBot._id]["mobile"] = paribuAccount.mobile;
					if (singleBot.status) {
						global.activeBots.push(singleBot._id);
						queue.push(singleBot._id);
					}
				})
			}
			console.log("inited");
		})
	}
}




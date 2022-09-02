import Binance from 'node-binance-api';

const binance = new Binance()
global.ticker = {};
binance.websockets.prevDay(false, function (error, obj) {
	global.ticker[obj.symbol] = obj;
});

class BinanceLib {
	static getPrice(symbol) {
		if (typeof global.ticker[symbol] !== "undefined")
			return global.ticker[symbol];
	}
}

export default BinanceLib;

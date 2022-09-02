import Request from './request.js';


class Paribu {

	static login(mobile, password) {
		return new Promise((resolve, reject) => {
			let data = {
				pathname: "login",
				method: "POST",
				authorization: "",
				body: {
					mobile: mobile,
					password: password
				}
			}
			Request.make(data).then((result) => {
				resolve(result);
			}).catch(err => reject(err));
		});
		// Data > Token çıktısı.
	}

	static twoFactor(code, token) {
		return new Promise((resolve, reject) => {
			let data = {
				pathname: "two-factor",
				method: "POST",
				authorization: "",
				body: {
					code: code,
					token: token
				}
			}
			Request.make(data).then((result) => {
				resolve(result);
			}).catch(err => reject(err));
		})
		// Data > Token çıktısı.
	}

	static newOrder(authorization, tradeData) {
		return new Promise((resolve, reject) => {
			let data = {
				pathname: "user/orders",
				method: "POST",
				authorization: "Bearer " + authorization,
				body: tradeData
			}
			Request.make(data).then(() => {
				resolve(true);
			}).catch(e => {
				console.log(e.response.data);
				if (typeof e.response.data !== "undefined" && typeof e.response.data.notice !== "undefined")
					if (!e.response.data.success && e.response.data.notice.includes("Kullanılabilir bakiyeniz")) {
						resolve(e.response.data.notice.split(" ")[2]);
					} else {
						console.log(e.response.data);
						reject(e.response)

					}
			});
		})
	}


	static deleteOrders(authorization, market) {
		let data = {
			pathname: "user/orders/" + market,
			method: "DELETE",
			authorization: "Bearer " + authorization,
			body: {}
		}
		Request.make(data).then((result) => {
			console.log(result.data);
		}).catch(e => {
			console.log(e);
			console.log("hataa2");
		});
	}
}

export default Paribu;

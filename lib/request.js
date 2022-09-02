import axios from 'axios';

const BASE_PATH = "https://v3.paribu.com/app/";
let cookie_cf = "";

class Request {
	static make(data) {
		const cookieMaker = () => {
			return cookie_cf;
		}

		return new Promise((resolve, reject) => {
			axios({
				method: data['method'],
				url: BASE_PATH + data['pathname'],
				data: data['body'],
				"credentials": "include",
				"headers": {
					"content-type": "application/json;charset=utf-8",
					"accept": "application/json",
					"x-device": "iPhone XR",
					"authorization": data['authorization'],
					"accept-language": "null",
					"user-agent": "ParibuApp/337 (ios 15.1)",
					"x-app-version": "337",
					"cookie": cookieMaker()
				}
			}).then((result) => {
				if (typeof result.headers['set-cookie'] !== "undefined") {
					if (result.headers['set-cookie'].length > 0) {
						cookie_cf = result.headers['set-cookie'][0];
					}
				}
				resolve(result);
			}).catch((error) => {
				reject(error);
			});
		});
	}
}

export default Request;

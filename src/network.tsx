import { log } from './util'

import Cryptr from 'cryptr';
const cryptr = new Cryptr(process.env.KEY42 || "foo");
const debuggingServerLocally = false
const server = (debuggingServerLocally && window.location.hostname === "localhost") ? 'http://localhost:8080' : 'https://tdnode.onrender.com'
 //'https://sj-td.herokuapp.com'  //https://resultify.live'

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON(null if error), error object]
	 */
export async function get(route: string) {

	try {
		const rawResponse = await fetch(`${server}/${route}`);
		const json = await rawResponse.json()
		return [json]
	}
	catch (error) {
		console.error(`get: error occurred ${error}`);
		return [null, error]
	}
}

/**
 * Performs http post request to our node.js server
 *
 * @param {string} data json to be posted .
 * @param {string} route route to use.
 * @return [response in JSON(null if error), error object]
 */
export async function post(data: Record<string, unknown>, route = 'feedback', encryptBody = false): Promise<[boolean, string]> {
	let body = JSON.stringify(data)
	let contentType = 'application/json'

	if (encryptBody) {
		body = cryptr.encrypt(body)
		contentType = 'text/plain'
	}
	try {
		const response = await fetch(`${server}/${route}`, {
			method: 'POST',
			body,
			headers: {
				'Accept': 'application/json',
				'Content-Type': contentType,
			},

		});
		if (response.ok)
			return [true, ""];
		let text = await response.text()
		return [false, `error: status ${response.status} ${response.statusText} ${text}`]
	}

	catch (error: any) {
		console.error(`post: error occurred with fetch ${error}`);
		return [false, error.toString()]
	}
}
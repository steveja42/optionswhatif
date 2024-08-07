import { log,ll} from './util'
import Cryptr from 'cryptr';
const cryptr = new Cryptr(process.env.KEY42 || "foo");
const useLocalServer = process.env.REACT_APP_USE_LOCAL_SERVER
const runningLocally = window.location.hostname === "localhost"

export const serverURL = (useLocalServer && runningLocally) ? 'http://localhost:80' : 'https://tdnode.onrender.com'


/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON(null if error), error object]
	 */
export async function get(route: string) : Promise<[unknown, unknown]> {

	try {
		const rawResponse = await fetch(`${serverURL}/${route}`);
		const json = await rawResponse.json()
		return [json,null]
	}
	catch (error) {
		log(ll.normal, `get: error occurred ${error}`);
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
		const response = await fetch(`${serverURL}/${route}`, {
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
		log(ll.normal, `post: error occurred with fetch ${error}`);
		return [false, error.toString()]
	}
}
import { get } from './network'

let log = console.log;

var currentTokens: AuthTokens;

interface AuthTokens {
	refresh_token: string,
	access_token: string
}

const runningLocally = window.location.hostname === "localhost"
const encodedClientIDAndSecret = process.env.REACT_APP_SCHWABENCODEDCLIENTIDANDSECRET
const schwabClientID = process.env.REACT_APP_SCHWABCLIENTID
let redirectUrl = runningLocally ? 'https://127.0.0.1:8080' : 'https://tdnode.onrender.com/tdsjsj'
var resolveGetSchwabAuthCodePromise: ((value: AuthTokens | PromiseLike<AuthTokens>) => void) | null
const schwabUrlToRequestAuthorizationCode = `https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=${schwabClientID}&redirect_uri=${redirectUrl}`;
export const authNeeded = "auth needed";
export const authNeededObj = { authStatus: "authNeeded", authUrl: schwabUrlToRequestAuthorizationCode };
var GetSchwabAuthCodePromise: Promise<AuthTokens>;

const schwabMarketDataUrl = 'https://api.schwabapi.com/marketdata/v1'

//see https://developer.tdameritrade.com/option-chains/apis/get/marketdata/chains for more info

export async function getOptionChain(symbol: string, contractType = 'ALL', strikeCount = 0) {
	let strikeCountString = (strikeCount > 0) ? `&strikeCount=${strikeCount}` : ''
	//var url = `${schwabMarketDataUrl}/chains?symbol=${symbol}&contractType=${contractType}&includeQuotes=TRUE${strikeCountString}`
	var url = `${schwabMarketDataUrl}/quotes?symbols=${symbol}&fields=quote&indicative=false`
	return callSchwabAPI(url)
}

/**
 * makes a call to the Schwab API represented by url, adding oauth2 authorization if tokens supplied.
 *
 * @param {string} url the url for the api.
 * @param {object} tokens the oauth tokens
 * @return [response in JSON(null if error), error object]
 */
async function callSchwab2(url: string, tokens: any = null) {
	let accessToken = tokens?.access_token
	if (!schwabClientID) {
		log(`don't have tdClientID in callTD`)
		return [null, "foo"]
	}
	url += `&apikey=${encodeURIComponent(schwabClientID)}`;


	return makeRequest(accessToken, url)
		.then(response => response.json())
		.then(json => [json])
		.catch(error => {
			return [null, error]
		})
}


/**
 * opens Schwab auth URL in browser, creates promise to wait till Schwab gives us the auth code
 * and we get access tokens using the code
 * throws error if not running locally
 * 
 * @return access tokens,or null for failure
 */
async function requestAuthorizationCode(): Promise<AuthTokens> {
	if (resolveGetSchwabAuthCodePromise) {
		log(`wierd, already have resolveGetSchwabAuthCodePromise`)

	}
	GetSchwabAuthCodePromise = new Promise<AuthTokens>((resolve, reject) => {
		resolveGetSchwabAuthCodePromise = resolve;
	});
	if (runningLocally) {
		//open Schwab auth URL in browser, only works when running server locally
		window.open(schwabUrlToRequestAuthorizationCode, "_blank")
	}
	else {
		throw (authNeeded);
	}

	const authTokens = await GetSchwabAuthCodePromise;  //   db.getObject();
	resolveGetSchwabAuthCodePromise = null;
	return authTokens;
}


export async function init() {

	return await requestAuthorizationCode();

	/*	let { refresh_token } = await getCurrentTokens()
		if (refresh_token && await refreshTheToken(refresh_token))
			return { tdStatus: "OK" }
		else
			return authNeededObj;
		*/
}
/**
 * Requests access tokens and resolves promise created by requestAuthorizationCode
*  Called after Schwab sends us an authorization code
*   
*/
export function requestAuthTokens(code: string) {
	const url = 'https://api.schwabapi.com/v1/oauth/token'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${encodedClientIDAndSecret}`
		},
		body: new URLSearchParams({
			'grant_type': 'authorization_code',
			'code': code,
			'redirect_uri': 'https://127.0.0.1:8080'
		})
	}
	//Post Access Token request
	return fetch(url, options).then(
		response => {
			if (!response.ok) {
				throw Error(`(${response.status}) ${response.statusText}`);
			}
			return response.json()
		})
		.then(
			data => {
				log(`got new Authorization- refreshToken:${data.refresh_token.slice(0, 5)} accessToken:${data.access_token.slice(0, 5)}`);
				setCurrentTokens(data)
				if (resolveGetSchwabAuthCodePromise)
					resolveGetSchwabAuthCodePromise(data);
				return data;
			})
		.catch(
			error => {
				log(`Error in obtainTokens:${error.message}`);
				return null;
			});
}

function setCurrentTokens(tokens: AuthTokens) {
	currentTokens = tokens;
	//if (tokens)
	//	mydb.setObject(tokens);
}
/**
 * if we don't have auth tokens yet, request from the server
 * @returns 
 */
async function getCurrentTokens(): Promise<AuthTokens> {
	if (!currentTokens?.access_token)
		[currentTokens] = await get('getcurrenttokens') as [AuthTokens, unknown]
	if (!currentTokens)
		return { access_token: "", refresh_token: "" }
	return currentTokens
}

/**
 * request new auth tokens from the server
 * @returns AuthTokens
 */
async function getNewTokens(): Promise<AuthTokens> {
	//open Schwab URL in browser for user to loging and provide authorization
	window.open(schwabUrlToRequestAuthorizationCode, "_blank");

	[currentTokens] = await get('getnewtokens') as [AuthTokens, unknown]
	if (!currentTokens)
		return { access_token: "", refresh_token: "" }
	return currentTokens
}

export async function haveAuthorization() {
	return GetSchwabAuthCodePromise;
}

/**
 * requests a refreshed access token from Schwab
 *
 * @return access token,or null for failure
 */
async function refreshTheToken(refreshToken: string) {
	const url = 'https://api.schwabapi.com/v1/oauth/token'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${encodedClientIDAndSecret}`
		},
		body: new URLSearchParams({
			'grant_type': 'refresh_token',
			'refresh_token': encodeURIComponent(refreshToken)
		})
	}
	return fetch(url, options)
		.then(
			response => {
				if (!response.ok) {
					throw Error(`(${response.status}) ${response.statusText}`);
				}
				return response.json()
			})
		.then(
			data => {
				log(`refreshTheToken: got new accessToken:${data.access_token.slice(0, 5)}`);
				setCurrentTokens(data);
				return data.access_token;
			})
		.catch(
			error => {
				log(`Error in refreshTheToken:${error.message}`);
				return null;
			});

}

/**
 * makes a call to the Schwab API represented by url, adding oauth2 authorization.
 *
 
 * @param {string} url the url for the api.
 * @param {object} tokens the oauth tokens
 * @return [response in JSON(null if error), error object]
 */
export async function callSchwabAPI(url: string) {
	let haveNewToken = false
	let { access_token, refresh_token } = await getCurrentTokens()
	if (!access_token) {
		({ access_token, refresh_token } = await getNewTokens());
		if (!access_token) {
			console.error("callSchwabAPI failed to get new Access token");
			return [null, "failed to get new Access token"];
		}
		haveNewToken = true;
	}

	return makeRequest(access_token, url)
		.then(response => response.json())
		.then(data => [data, null])
		.catch(error => {
			if (error.message !== "Unauthorized") {
				console.error('callSchwabAPI error', error);
				return [null, error]
			}
			log(`first request was unauthorized, trying refreshing: token ${access_token.slice(0, 5)} `);
			return refreshTheToken(refresh_token)
				.then(accessToken => makeRequest(accessToken, url)
					.then(response => response.json())
					.then(data => [data, null])
					.catch(error => {
						console.error('callSchwabAPI error', error);
						return [null, error]
					}))
				.catch(error => {
					log(`couldn't refresh the token`)
					if (!haveNewToken) {
						return getNewTokens() //try getting new access tokens
							.then(data => makeRequest(data.access_token, url)
								.then(response => response.json())
								.then(data => [data, null])
								.catch(error => {
									console.error('callSchwabAPI error', error);
									return [null, error]
								}))
							.catch(error => {
								console.error(`callSchwabAPI error can't get new auth tokens`, error);
								return [null, error]
							})
					}

					console.error(`callSchwabAPI error after refresh`, error);
					return [null, error]
				})
		})

}

/**
 * does http get request  for given url and authorization token.
 *
 * @return response in JSON, or null for failure
 */
async function makeRequest(token: string, url: string) {

	let options: any = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	};

	return fetch(url, options)
		.then(
			(response) => {
				if (response.ok)
					return response;
				throw Error(response.statusText);
			},
			(reason) => {
				log(`fetch failed: ${reason}`);
				throw Error(reason);
			}
		)
}

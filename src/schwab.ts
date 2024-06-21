import { log, debugging } from './util'
import * as server from './network'
import { OptionChain } from './owicomponents'

var currentTokens: AuthTokens;

interface AuthTokens {
	refresh_token: string,
	access_token: string
}

const encodedClientIDAndSecret = process.env.REACT_APP_SCHWABENCODEDCLIENTIDANDSECRET
const schwabClientID = process.env.REACT_APP_SCHWABCLIENTID
let redirectUrl = server.serverURL + '/tdsjsj'
const schwabUrlToRequestAuthorizationCode = `https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=${schwabClientID}&redirect_uri=${redirectUrl}`;
export const authNeeded = "auth needed";
export const authNeededObj = { authStatus: "authNeeded", authUrl: schwabUrlToRequestAuthorizationCode };

const schwabMarketDataUrl = 'https://api.schwabapi.com/marketdata/v1'

//see https://developer.schwab.com/products/trader-api--individual/details/specifications/Market%20Data%20Production for more info

export async function getOptionChain(symbol: string, contractType = 'ALL', strikeCount = 0): Promise<[OptionChain | null, Error | null]> {
	let strikeCountString = (strikeCount > 0) ? `&strikeCount=${strikeCount}` : ''
	//var url = `${schwabMarketDataUrl}/chains?symbol=${symbol}&contractType=${contractType}&includeQuotes=TRUE${strikeCountString}`
	//const url = `${schwabMarketDataUrl}/quotes?symbols=${symbol}&fields=quote&indicative=false`
	const url = `${schwabMarketDataUrl}/chains?symbol=${symbol}&contractType=${contractType}&includeUnderlyingQuote=true${strikeCountString}`
	const [data, error] = await callSchwabAPI(url)
	return [data as OptionChain, error]
}

/**
 * @returns shortened token, for display
 */
function shortenToken(token: string): string {
	return `${token.slice(0, 5)}...${token.slice(-5)}`
}

/**
 * if we don't have auth tokens yet, request from the server
 * @returns 
 */
async function getCurrentTokens(): Promise<AuthTokens> {
	if (!currentTokens?.access_token)
		[currentTokens] = await server.get('getcurrenttokens') as [AuthTokens, unknown]
	if (!currentTokens)
		return { access_token: "", refresh_token: "" }
	return currentTokens
}

/**
 * request new auth tokens from the server
 * @returns AuthTokens
 */
async function getNewTokens(): Promise<AuthTokens> {
	if (!debugging)  //schwab url auth doesn't work in debug window
		window.open(schwabUrlToRequestAuthorizationCode, "_blank");  //open Schwab URL in browser for user to login and provide authorization

	[currentTokens] = await server.get(`getnewtokens?shouldOpenBrowser=${debugging}`) as [AuthTokens, unknown]
	if (currentTokens)
		log(`got new Authorization- refreshToken:${shortenToken(currentTokens.refresh_token)} accessToken:${shortenToken(currentTokens.access_token)}`);
	else
		currentTokens = { access_token: "", refresh_token: "" }
	return currentTokens
}

/**
 * requests a refreshed access token from Schwab
 *
 * @return access token,or "" for failure
 */
async function refreshTheToken(refreshToken: string): Promise<string> {
	const url = 'https://api.schwabapi.com/v1/oauth/token'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${encodedClientIDAndSecret}`
		},
		body: new URLSearchParams({
			'grant_type': 'refresh_token',
			'refresh_token': refreshToken
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
				log(`refreshTheToken: got new accessToken:${shortenToken(data.access_token)}`);
				currentTokens = data;
				return data.access_token;
			})
		.catch(
			error => {
				log(`Error in refreshTheToken:${error.message}`);
				return "";
			});

}

/**
 * makes a call to the Schwab API represented by url, adding oauth2 authorization.
 *
 
 * @param {string} url the url for the api.
 * @param {object} tokens the oauth tokens
 * @return [response in JSON(null if error), error object]
 */
export async function callSchwabAPI(url: string): Promise<[unknown, Error | null]> {
	let gotNewTokens = false
	let { access_token, refresh_token } = await getCurrentTokens()
	if (!access_token) {
		({ access_token, refresh_token } = await getNewTokens());
		if (!access_token) {
			console.error("callSchwabAPI failed to get new Access token");
			return [null, Error("failed to get new Access token")];
		}
		gotNewTokens = true;
	}


	let [result, error] = await makeRequest(access_token, url)
	if (result)
		return [result, error]
	if (error && error.message.slice(0, 3) !== "401") {
		console.error('callSchwabAPI error', error);
		return [null, error]
	}
	log(`first request was unauthorized, trying refreshing: token ${shortenToken(access_token)} `);
	access_token = await refreshTheToken(refresh_token)

	if (!access_token) {
		log(`couldn't refresh the token`)
		if (gotNewTokens) {
			return [null, Error("failed to refresh Access token")];
		}
		else {
			({ access_token } = await getNewTokens()) //try getting new access tokens
			if (!access_token) {
				log("callSchwabAPI failed to get new Access token");
				return [null, Error("failed to get new Access token")];
			}
			else
				log(`got new token ${shortenToken(access_token)} `)
		}

	}

	return await makeRequest(access_token, url)


}

/**
 * does http get request  for given url and authorization token.
 *
 * @return [response in JSON or null if failure,null or error
 */
async function makeRequest(token: string, url: string): Promise<[unknown, Error | null]> {

	let options: any = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	};
	try {
		const response = await fetch(url, options)
		if (response.ok) {
			return [await response.json(), null]
		}
		else {
			log(`Error ${response.status} ${response.statusText}`)
			return [null, Error(`${response.status} ${response.statusText}`)]
		}
	}
	catch (error) {
		log(`Error ${error}`)
		return [null, error as Error]
	}

}

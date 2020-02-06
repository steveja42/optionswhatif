
let log = console.log;
const tdClientId = process.env.REACT_APP_TD_CLIENT_ID
const tdRedirectUrl = ``

//see https://developer.tdameritrade.com/option-chains/apis/get/marketdata/chains for more info

export async function getOptionChain(symbol, contractType = 'ALL', strikeCount = 0) {
	let strikeCountString = (strikeCount>0)? `&strikeCount=${strikeCount}`: ''
	var url = `https://api.tdameritrade.com/v1/marketdata/chains?symbol=${symbol}&contractType=${contractType}&includeQuotes=TRUE${strikeCountString}`
	return callTD(url);
}

/**
 * makes a call to the TD API represented by url, adding oauth2 authorization if tokens supplied.
 *
 * @param {string} url the url for the api.
 * @param {object} tokens the oauth tokens
 * @return [response in JSON(null if error), error object]
 */
async function callTD(url, tokens) {
	let accessToken = tokens && tokens.access_token
	url += `&apikey=${encodeURIComponent(tdClientId)}`;


	return makeRequest(accessToken, url)
		.then(response => response.json())
		.then(json => [json])
		.catch(error => {
			if (!accessToken || error.message !== "Unauthorized") {
				console.error('callTDAPI error', error);
				return [null, error]
			}
			log(`first request was unauthorized: token ${accessToken.slice(0, 5)}}`);
			return refreshTheToken2(tokens.refresh_token)
				.then(newTokens => makeRequest(newTokens.access_token, url))
				.then(response => response.json())
				.then(json => [json])
				.catch(error => {
					console.error('callTDAPI error', error);
				//	if (error.message == "Unauthorized")
					//	throw (authNeeded)
					return [null, error]
				})
		})

}

/**
 * does http get request  for given url and uses authorization token if supplied.
 *
 * @return response or throws error
 */
async function makeRequest(token, url) {

	let options = token &&
	{
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	};

	return fetch(url, options)
		.then(
			(response) => {
				if (response.ok)
					return response
				throw Error(response.statusText);
			},
			(reason) => {
				log(`fetch failed: ${reason}`);
				throw Error(reason);
			}
		)
}

/**
 * requests a refreshed access token from td website
 *
 * @return access token,or null for failure
 */
async function refreshTheToken2(refreshToken) {
	var url = 'https://api.tdameritrade.com/v1/oauth2/token';
	var params = {
		body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken) + '&access_type=offline&client_id=' + encodeURIComponent(tdClientId) + '&redirect_uri=' + encodeURIComponent(tdRedirectUrl),
		headers: { "Content-Type": "application/x-www-form-urlencoded", },
		method: 'post',
	};
	return fetch(url, params)
		.then(
			response => {
				if (!response.ok) {
					throw Error(`(${response.status}) ${response.statusText}`);
				}
				return response.json()
			})
		.then(
			data => {
				log(`refreshToken: got new accessToken:${data.access_token.slice(0, 5)}`);
				return data
			})
		.catch(
			error => {
				console.log('Error in refreshToken: ', error.message);
				return null;
			});

}

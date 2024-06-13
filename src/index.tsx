import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; 
import App from './app';
//import App from './app-old-tabbed';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom"
import * as server from './network'

//basename='/optionswhatif/'
server.post({ ping: "ping" }, 'init')   //ping the server that will provide oauth for the Schwab API, in case it needs to be woken up or started

ReactDOM.render(
	<BrowserRouter > 
	  <App />
	</BrowserRouter>,
	document.getElementById("root")
 );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

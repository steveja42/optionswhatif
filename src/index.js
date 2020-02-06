import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; 
import App from './app';
//import App from './app-old-tabbed';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom"

ReactDOM.render(
	<BrowserRouter basename='/optionswhatif/'>
	  <App />
	</BrowserRouter>,
	document.getElementById("root")
 );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

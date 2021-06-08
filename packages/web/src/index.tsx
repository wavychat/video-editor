import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";

import React from "react";
import ReactDOM from "react-dom";
import { VideoEditor } from "./VideoEditor";
import reportWebVitals from "./reportWebVitals";

// TODO: add webview interactions and events here (or in an other file)

ReactDOM.render(
	<React.StrictMode>
		<VideoEditor />
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

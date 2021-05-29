import React from "react";
import { RecoilRoot } from "recoil";
import RecoilDebugger from "recoilize";
import { Container } from "./components/Container";

export default function App() {
	return (
		<RecoilRoot>
			{/* <RecoilDebugger /> */}
			<Container />
		</RecoilRoot>
	);
}

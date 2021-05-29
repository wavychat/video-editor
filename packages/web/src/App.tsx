import React from "react";
import { RecoilRoot } from "recoil";
import RecoilDebugger from "recoilize";
import { Container } from "./components/Container";

export default function VideoEditor() {
	return (
		<RecoilRoot>
			{/* <RecoilDebugger /> */}
			<Container />
		</RecoilRoot>
	);
}

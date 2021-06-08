import React from "react";
import { RecoilRoot } from "recoil";
import RecoilDebugger from "recoilize";
import { Container } from "./components/Container";

import "./VideoEditor.css";

interface Props {}

export const VideoEditor: React.FC<Props> = () => {
	return (
		<RecoilRoot>
			{/* <RecoilDebugger /> */}
			<Container />
		</RecoilRoot>
	);
};

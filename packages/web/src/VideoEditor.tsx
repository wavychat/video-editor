import React from "react";
import { RecoilRoot } from "recoil";
import RecoilDebugger from "recoilize";
import { Container } from "./components/Container";
import { IS_PROD } from "./helpers/constants";

import "./VideoEditor.css";

interface Props {}

export const VideoEditor: React.FC<Props> = () =>
	(
		<RecoilRoot>
			{/* {!IS_PROD && <RecoilDebugger />} */}
			<Container />
		</RecoilRoot>
	);

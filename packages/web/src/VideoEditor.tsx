import React from "react";
import { RecoilRoot } from "recoil";
import RecoilDebugger from "recoilize";
import { Container } from "./components/Container";
import { IS_PROD } from "./helpers/constants";

import "./VideoEditor.css";

export interface EditorProps {
	videoUrl: string
}

export const VideoEditor: React.FC<EditorProps> = (args) =>
	(
		<RecoilRoot>
			{/* {!IS_PROD && <RecoilDebugger />} */}
			<Container {...args} />
		</RecoilRoot>
	);

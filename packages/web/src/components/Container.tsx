import React, { useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

// Helpers
import { AppScreens, pageState, variablesState } from "../helpers/atoms";

// Pages
import { DrawPage } from "../pages/Draw";
import { InitialPage } from "../pages/Initial";
import { TextPage } from "../pages/Text";

// Components
import EditCanvas, { IEditCanvasRef } from "./Canvas";
import BackgroundVideo from "./Video";

interface Props {}

export const Container: React.FC<Props> = (props) => {
	const canvasRef = useRef<IEditCanvasRef>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const page = useRecoilValue(pageState);

	const setVariables = useSetRecoilState(variablesState);
	const [started, setStart] = useState<boolean>(false);

	const start = () => {
		setStart(true);
		return setVariables((vars) => ({ ...vars, playVideo: true }));
	};

	return (
		<div
			style={{ backgroundColor: "black" }}
			id="video_editor_canvas_container_1"
		>
			{!started ? (
				<button onClick={start}>Start</button>
			) : (
				<>
					<div>
						<BackgroundVideo ref={videoRef} />
						<EditCanvas ref={canvasRef} />
					</div>
					<div style={{ position: "relative", zIndex: 3 }}>
						{page === AppScreens.INITIAL ? (
							<InitialPage
								canvasRef={canvasRef}
								videoRef={videoRef}
							/>
						) : page === AppScreens.DRAW ? (
							<DrawPage canvasRef={canvasRef} />
						) : page === AppScreens.TEXT ? (
							<TextPage canvasRef={canvasRef} />
						) : null}
					</div>
				</>
			)}
		</div>
	);
};

import React, { useEffect, useRef, useState } from "react";
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

interface Props {
	videoUrl: string;
}

export const Container: React.FC<Props> = ({ videoUrl }) => {
	const setVariables = useSetRecoilState(variablesState);

	useEffect(() => {
		setVariables((vars) =>
			({
				...vars,
				videoUrl,
			}));
	}, []);

	return (
		<div id="video_editor_canvas_container_1">
			<Content />
		</div>
	);
};

const Content: React.FC = () => {
	const [started, setStart] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const canvasRef = useRef<IEditCanvasRef>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const page = useRecoilValue(pageState);
	const variables = useRecoilValue(variablesState);

	const load = () => {
		setLoading(false);
	};

	const start = () =>
		setStart(true);

	useEffect(() => {
		load();
	}, []);

	if (loading)
		return <span className="text-white">Loading...</span>;

	if (!started)
		return <button onClick={start} type="button">Start</button>;

	if (variables.exportedVideoUrl)
	 	return (
			<>
				<span className="text-white">Exported !</span>
				<video src={variables.exportedVideoUrl} style={{ width: 300 }} controls />
			</>
		);

	return (
		<>
			<div>
				<BackgroundVideo ref={videoRef} />
				<EditCanvas ref={canvasRef} videoRef={videoRef} />
			</div>
			<div style={{ position: "relative", zIndex: 3 }}>
				{
					page === AppScreens.EXPORTING
						? <span className="text-white">Exporting ...</span>
						: page === AppScreens.INITIAL ? (
							<InitialPage canvasRef={canvasRef} videoRef={videoRef} />
						) : page === AppScreens.DRAW ? (
							<DrawPage canvasRef={canvasRef} />
						) : page === AppScreens.TEXT ? (
							<TextPage canvasRef={canvasRef} />
						) : null
				}

			</div>
		</>
	);
};

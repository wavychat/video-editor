import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { IEditCanvasRef } from "../components/Canvas";
import { AppScreens, pageState, variablesState } from "../helpers/atoms";

interface Props {
	canvasRef: React.RefObject<IEditCanvasRef>;
	videoRef: React.RefObject<HTMLVideoElement>;
}

export const InitialPage: React.FC<Props> = ({ canvasRef, videoRef }) => {
	const setPage = useSetRecoilState(pageState);
	const [variables, setVariables] = useRecoilState(variablesState);

	const createText = () => {
		if (!canvasRef.current) return console.log("canvas not initialized");
		const id = canvasRef.current.addText("");
		setVariables((vars) => ({ ...vars, textId: id }));
		return setPage(AppScreens.TEXT);
	};

	return (
		<div>
			<button onClick={() => setPage(AppScreens.DRAW)}>Draw</button>
			<button onClick={createText}>Text</button>
			<button onClick={canvasRef.current?.clear}>Clear All</button>
			<button onClick={canvasRef.current?.undo}>Undo</button>
			<button onClick={canvasRef.current?.redo}>Redo</button>
			<button
				onClick={() =>
					console.log(
						canvasRef.current?.getFabric()?.toObject(["id"]).objects
					)
				}
			>
				To JSON
			</button>
			{variables.playVideo && !variables.currentFrame ? (
				<button
					onClick={() =>
						setVariables((vars) => ({
							...vars,
							playVideo: false,
							currentFrame:
								Math.round(videoRef.current?.currentTime!) *
									vars.FPS ?? 1,
						}))
					}
				>
					Pin frame
				</button>
			) : (
				<button
					onClick={() =>
						setVariables((vars) => ({
							...vars,
							playVideo: true,
							currentFrame: undefined,
						}))
					}
				>
					Unpin frame
				</button>
			)}
		</div>
	);
};

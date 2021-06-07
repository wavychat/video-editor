import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { fabric } from "fabric";
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

	const addImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		for (let file of e.target.files || []) {
			var reader = new FileReader();
			reader.onload = (f) => {
				const data = f.target?.result;
				if (!data) return;

				fabric.Image.fromURL(data.toString(), (img) => {
					var oImg = img.scale(0.9);
					canvasRef.current?.getFabric()?.add(oImg).renderAll();
					oImg.center();
				});
			};

			reader.readAsDataURL(file);
		}
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
			<input type="file" accept="image/*" onChange={addImage} multiple />
			{variables.playVideo && !variables.pinnedFrame ? (
				<button
					onClick={() =>
						setVariables((vars) => ({
							...vars,
							playVideo: false,
							pinnedFrame:
								Math.round(
									videoRef.current?.currentTime! * vars.FPS
								) ?? 1,
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
							pinnedFrame: undefined,
						}))
					}
				>
					Unpin frame
				</button>
			)}
		</div>
	);
};

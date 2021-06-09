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
		if (!canvasRef.current)
			return console.log("canvas not initialized");
		const id = canvasRef.current.addText("");
		setVariables((vars) =>
			({ ...vars, textId: id }));
		return setPage(AppScreens.TEXT);
	};

	const addImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const canvas = canvasRef.current?.getFabric();
		if (!canvas)
			return;

		for (const file of e.target.files || []) {
			const reader = new FileReader();
			reader.onload = (f) => {
				const data = f.target?.result;
				if (!data)
					return;

				fabric.Image.fromURL(data.toString(), (img) => {
					const w = window.innerWidth;
					const h = window.innerHeight;

					if (h < w)
						img.scaleToHeight(h / 2);
					else
						img.scaleToWidth(w / 2);

					canvas.add(img).renderAll();
					img.center();
				});
			};

			reader.readAsDataURL(file);
		}
	};

	return (
		<div>
			<button
				onClick={() =>
					setPage(AppScreens.DRAW)}
				type="button"
			>
				Draw
			</button>
			<button onClick={createText} type="button">Text</button>
			<button onClick={canvasRef.current?.clear} type="button">Clear All</button>
			<button onClick={canvasRef.current?.undo} type="button">Undo</button>
			<button onClick={canvasRef.current?.redo} type="button">Redo</button>
			<button
				onClick={() =>
					console.log(
						canvasRef.current?.getFabric()?.toObject(["id"]).objects,
					)}
				type="button"
			>
				To JSON
			</button>
			<input type="file" accept="image/*" onChange={addImage} multiple />
			{variables.playVideo && !variables.pinnedFrame ? (
				<button
					onClick={() =>
						setVariables((vars) =>
							({
								...vars,
								playVideo: false,
								pinnedFrame:
								Math.round(
									videoRef.current?.currentTime! * vars.FPS,
								) ?? 1,
							}))}
					type="button"
				>
					Pin frame
				</button>
			) : (
				<button
					onClick={() =>
						setVariables((vars) =>
							({
								...vars,
								playVideo: true,
								pinnedFrame: undefined,
							}))}
					type="button"
				>
					Unpin frame
				</button>
			)}
		</div>
	);
};

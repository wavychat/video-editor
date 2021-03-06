import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { fabric } from "fabric";
import { IonButton } from "@ionic/react";
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
		const fabricCanvas = canvasRef.current?.getFabric();
		const canvas = canvasRef.current?.getCanvas();

		if (!fabricCanvas || !canvas)
			return;

		if (e.target.files?.length && e.target.files?.length > 3)
		// TODO: add this as a prop event and let the user handle it
			return alert("Reached max file number");

		for (const file of e.target.files!) {
			const reader = new FileReader();
			reader.onload = (f) => {
				const data = f.target?.result;
				if (!data)
					return;

				fabric.Image.fromURL(data.toString(), (img) => {
					const w = canvas.width;
					const h = canvas.height;

					if (h < w)
						img.scaleToHeight(h / 2);
					else
						img.scaleToWidth(w / 2);

					fabricCanvas.add(img).requestRenderAll();
					img.center();
				});
			};

			reader.readAsDataURL(file);
		}
	};

	const exportVideo = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current?.getCanvas();
		const fabricCanvas = canvasRef.current?.getFabric();

		const recordingFPS = 60;

		if (!video || !canvas || !fabricCanvas)
			return;

		setVariables((vars) =>
			({ ...vars, pinnedFrame: undefined, playVideo: false }));

		video.currentTime = 0;

		// reset the whole canvas
		fabricCanvas.forEachObject((obj) =>
			!obj.customOptions?.permanent && obj.set("opacity", 0))
			.requestRenderAll();

		video.removeAttribute("style");

		// Reset video dimensions. Otherwise, video will be cropped
		video.width = video.videoWidth;
		video.height = video.videoHeight;

		// hide video and canvas
		video.style.display = "none";
		canvas.style.display = "none";

		const { top, left } = fabricCanvas.getCenter();
		const videoEl = new fabric.Image(video, {
			objectCaching: false,

			left,
			top,

			originX: "center",
			originY: "center",
		});

		videoEl.scaleToHeight(fabricCanvas.height || canvas.height);

		fabricCanvas.backgroundImage = videoEl;

		fabric.util.requestAnimFrame(function render() {
			fabricCanvas.requestRenderAll();
			fabric.util.requestAnimFrame(render);
		});

		setPage(AppScreens.EXPORTING);

		const stream = canvas.captureStream(recordingFPS);

		const chunks: Blob[] = [];
		const recorder = new MediaRecorder(stream);

		fabricCanvas.selection = false;
		fabricCanvas.forEachObject((o) => {
			o.selectable = false;
		});
		fabricCanvas.discardActiveObject().requestRenderAll();

		recorder.ondataavailable = (e) => {
			if (e.data.size > 0)
				chunks.push(e.data);
		};

		recorder.onstop = () => {
			const videoUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
			video.onended = null;
			setVariables((vars) =>
				({
					...vars,
					exportedVideoUrl: videoUrl,
				}));

			console.log("recording stopped \n\n\n", videoUrl);
		};

		recorder.onerror = (...err) =>
			console.error("Recorder error", ...err);

		recorder.start();
		video.play();

		video.onended = () => {
			recorder.stop();
		};
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

			<button
				onClick={exportVideo}
				type="submit"
			>
				Export

			</button>

			<button onClick={createText} type="button">Text</button>
			<button onClick={canvasRef.current?.clear} type="button">Clear All</button>
			<button onClick={canvasRef.current?.undo} type="button">Undo</button>
			<button onClick={canvasRef.current?.redo} type="button">Redo</button>
			<button
				onClick={() =>
					console.log(
						canvasRef.current?.getFabric()?.toObject(["customOptions"]).objects,
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

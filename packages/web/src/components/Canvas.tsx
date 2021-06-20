import React, { useEffect, useImperativeHandle, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { v4 as uuidv4 } from "uuid";

// Fabric JS
import { fabric } from "fabric-with-gestures";
import "fabric-history";

// Brushes
import { PSBrush } from "@arch-inc/fabricjs-psbrush";
import { isMobile } from "react-device-detect";
import { EraserBrush } from "../helpers/fabircEraserBursh";

// Helpers
import {
	variablesState,
	lineOptionsState,
	scriptState,
	IVariables,
} from "../helpers/atoms";
import { IScripting } from "../helpers/types/scripting";

interface Props {
	onTextDoubleClick?: (obj: any) => any;
	videoRef: React.RefObject<HTMLVideoElement>;
}

type TFabricRef = fabric.Canvas | undefined;
type TCanvasRef = HTMLCanvasElement | null;

export interface IEditCanvasRef {
	clear?: () => void;
	undo?: () => void;
	redo?: () => void;
	addText: (text: string) => string;
	getObject: (id: string) => fabric.Object | undefined;
	getFabric: () => TFabricRef;
	getCanvas: () => TCanvasRef;
}

const EditCanvas = React.forwardRef<IEditCanvasRef, Props>(
	({ onTextDoubleClick, videoRef }, ref) => {
		const lineOptions = useRecoilValue(lineOptionsState);
		const [variables, setVariables] = useRecoilState(variablesState);
		const [script, setScript] = useRecoilState(scriptState);

		const variablesRef = useRef<IVariables>(variables);
		const scriptRef = useRef<IScripting>(script);

		const canvasRef = useRef<HTMLCanvasElement>(null);
		const fabricCanvasRef = useRef<fabric.Canvas>();

		const resizeCanvas = () => {
			const video = videoRef.current;

			if (!canvasRef.current || !fabricCanvasRef.current || !video || variablesRef.current.isExporting)
				return;

			const aspectRatio = video.videoWidth / video.videoHeight;

			video.height = window.innerHeight;
			video.width = video.height * aspectRatio;

			/** The padding in `px` the canvas will have compared to the video */
			const padding: number = 50;

			const canvasH = video.height;
			const canvasW = video.width + padding * 2;

			canvasRef.current.height = canvasH;
			canvasRef.current.width = canvasW;

			fabricCanvasRef.current.setHeight(canvasH);
			fabricCanvasRef.current.setWidth(canvasW);
			fabricCanvasRef.current.calcOffset();

			return { w: canvasW, h: canvasH };
		};

		const getObject = (id: string) => {
			const objects = fabricCanvasRef.current?.getObjects() ?? [];

			for (let i = 0; i < objects.length; i++) {
				const object = objects[i];
				if (object?.id === id)
					return object;
			}
		};

		useImperativeHandle(ref, () =>
			({
				clear: () =>
					fabricCanvasRef.current?.clear(),
				undo: () =>
					fabricCanvasRef.current?.undo?.(),
				redo: () =>
					fabricCanvasRef.current?.redo?.(),
				addText: (text) => {
					const id = uuidv4();
					const textbox = new fabric.IText(text, {
						id,
						textAlign: "center",
						fill: "black",
						textBackgroundColor: "white",
						fontWeight: 700,
						fontFamily: "Arial",
					});

					fabricCanvasRef.current?.add(textbox);
					textbox.center();
					return id;
				},
				getFabric: () =>
					fabricCanvasRef.current,
				getCanvas: () =>
					canvasRef.current,
				getObject,
			}));

		useEffect(() => {
			variablesRef.current = variables;
			scriptRef.current = script;
		}, [variables, script]);

		useEffect(() => {
			if (fabricCanvasRef.current)
				fabricCanvasRef.current.isDrawingMode = variables.isDrawing;
		}, [variables.isDrawing]);

		useEffect(() => {
			if (!fabricCanvasRef.current)
				return;
			if (variables.erasing) {
				fabricCanvasRef.current.freeDrawingBrush = new EraserBrush(
					fabricCanvasRef.current,
				);
				fabricCanvasRef.current.freeDrawingBrush.color = "#FF0000";
				fabricCanvasRef.current.freeDrawingBrush.width = 20;
			} else {
				fabricCanvasRef.current.freeDrawingBrush = new PSBrush(
					fabricCanvasRef.current,
				);
				fabricCanvasRef.current.freeDrawingBrush.color = lineOptions.color;
				fabricCanvasRef.current.freeDrawingBrush.width = lineOptions.size;
				fabricCanvasRef.current.freeDrawingBrush.globalCompositeOperation =					"destination-over";
			}
		}, [variables.erasing]);

		useEffect(() => {
			if (
				fabricCanvasRef.current
				&& lineOptions.color
				&& !variables.erasing
			)
				fabricCanvasRef.current.freeDrawingBrush.color = lineOptions.color;
		}, [lineOptions.color]);

		useEffect(() => {
			if (fabricCanvasRef.current && lineOptions.size)
				fabricCanvasRef.current.freeDrawingBrush.width = lineOptions.size;
		}, [lineOptions.size]);

		useEffect(() => {
			// init fabric.js
			const canvas = fabricCanvasRef.current = new fabric.Canvas(
				canvasRef.current,
			);

			// init pressure brush
			const brush = new PSBrush(canvas);
			brush.color = lineOptions.color;
			brush.width = lineOptions.size;
			canvas.freeDrawingBrush = brush;

			if (videoRef.current)
				videoRef.current.onloadedmetadata = resizeCanvas;

			window.addEventListener("resize", resizeCanvas, false);

			/** Add controls when object is selected */
			const onObjectSelected = (opt: fabric.IEvent) => {
				console.log("object selected", opt.target || opt.path);
			};

			// TODO: handle events (onTextDoubleClick)
			canvas.on("selection:created", onObjectSelected);
			canvas.on("selection:updated", onObjectSelected);

			/** Modify script, add id and other properties to the canvas */
			canvas.on("object:added", (opt) => {
				const object = opt[opt.target ? "target" : "path"];

				if (!object)
					return;

				// if video is currently being exported don't allow new elements
				if (variablesRef.current.isExporting)
					return canvas.remove(object);

				const id = uuidv4();

				// add object to script
				setScript((script) => {
					let { pinnedFrame } = variablesRef.current;
					const scriptClone = { ...script };
					const hasPinnedFrame: boolean = !!pinnedFrame;

					if (!pinnedFrame)
						pinnedFrame = 1;

					const frameScript = scriptClone[pinnedFrame];

					scriptClone[pinnedFrame] = {
						...frameScript,
						show: [...(frameScript?.show ?? []), id],
					};

					if (hasPinnedFrame) {
						// TODO: make it dynamic by calculating time for renderAll with event
						const nextFrame = 4;
						const hideFrameScript = scriptClone[pinnedFrame + nextFrame];

						scriptClone[pinnedFrame + nextFrame] = {
							...hideFrameScript,
							hide: [...(hideFrameScript?.hide ?? []), id],
						};
					}

					return scriptClone;
				});

				const options: Partial<fabric.Object> = {
					id,
					dirty: true,
					hasControls: !isMobile,
					originX: "center",
					originY: "center",
				};

				// apply new options on object
				for (const tempOptionId in options)
					if ({}.hasOwnProperty.call(options, tempOptionId)) {
						const optionId = tempOptionId as keyof fabric.Object;
						object.set(
							optionId,
							options[optionId],
						);
					}

				// replace drawing after it was moved when origin was changed
				if (object.type === "PSStroke" || object.type === "path") {
					object.left = ((object.width! / 2) + object.left!) + object.strokeWidth! / 2;
					object.top = ((object.height! / 2) + object.top!) + object.strokeWidth! / 2;
				}
			});

			return () => {
				window.removeEventListener("resize", resizeCanvas, false);
				canvas.removeListeners();
			};
		}, []);

		useEffect(() => {
			const requestAnimFrame = () =>
				requestAnimationFrame(animate);

			const animate = () => {
				const script = scriptRef.current;
				const { pinnedFrame, playVideo, FPS } = variablesRef.current;

				if (!playVideo || pinnedFrame)
					return requestAnimFrame();

				const frame = Math.round(videoRef.current?.currentTime! * FPS) ?? 1;

				const frameScript = script[frame];

				if (!frameScript)
					return requestAnimFrame();

				// hide objects
				for (const toHide of frameScript.hide || []) {
					const obj = getObject(toHide);
					if (!obj)
						continue;
					obj.set("opacity", 0);
				}

				// show objects
				for (const toShow of frameScript.show || []) {
					const obj = getObject(toShow);
					if (!obj)
						continue;
					obj.set("opacity", 1);
				}

				fabricCanvasRef.current?.renderAll();

				return requestAnimFrame();
			};

			requestAnimFrame();
		}, []);

		return (
			<div
				style={{
					width: "100%",
					height: "100%",
					position: "absolute",
					zIndex: 2,
				}}
			>
				<canvas
					ref={canvasRef}
					style={{
						left: "50%",
						top: "50%",
						position: "absolute",
						// transform: "translate(-50%, -50%)",
					}}
				>
					The editor is not supported on this device
				</canvas>
			</div>
		);
	},
);

EditCanvas.displayName = "EditCanvas";

export default EditCanvas;

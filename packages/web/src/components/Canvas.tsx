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
	pageState,
	AppScreens,
} from "../helpers/atoms";
import { IScripting } from "../helpers/types/scripting";

const deleteObject: fabric.Control["mouseUpHandler"] = (eventData, transform) => {
	const { target } = transform;
	const { canvas } = target;

	if (!canvas)
		return false;

	canvas.remove(target);
	canvas.requestRenderAll();
	return true;
};

const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

const deleteImg = document.createElement("img");
deleteImg.src = deleteIcon;

const renderIcon = (icon: HTMLImageElement, cornerSize: number): fabric.Control["render"] =>
	(ctx, left, top, styleOverride, fabricObject) => {
		const size = cornerSize;
		ctx.save();
		ctx.translate(left, top);
		ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
		ctx.drawImage(icon, -size / 2, -size / 2, size, size);
		ctx.restore();
	};

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
	x: 0.5,
	y: -0.5,
	offsetY: -16,
	offsetX: 16,
	cursorStyle: "pointer",
	withConnection: true,
	mouseUpHandler: deleteObject,
	render: renderIcon(deleteImg, 24),
});

interface Props {
	onTextDoubleClick?: (obj: any) => any;
	videoRef: React.RefObject<HTMLVideoElement>;
}

type TFabricRef = fabric.Canvas | null | undefined;
type TCanvasRef = HTMLCanvasElement | null | undefined;

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
		const [page, setPage] = useRecoilState(pageState);

		const variablesRef = useRef<IVariables>(variables);
		const scriptRef = useRef<IScripting>(script);
		const pageRef = useRef<AppScreens>(page);

		const canvasRef = useRef<HTMLCanvasElement>(null);
		const fabricCanvasRef = useRef<fabric.Canvas>();

		const resizeCanvas = () => {
			const video = videoRef.current;

			if (
				!canvasRef.current
				|| !fabricCanvasRef.current
				|| !video
				|| pageRef.current === AppScreens.EXPORTING
			)
				return;

			const container = document.getElementById("video_editor_canvas_container_1");

			const containerWidth = container?.clientWidth || window.innerWidth;
			const containerHeight = container?.clientHeight || window.innerHeight;

			const videoAspectRatio = video.videoWidth / video.videoHeight;

			const maxPadding: number = 50;

			/** The padding in `px` the canvas will have compared to the video */
			let padding: number = 0;

			if (containerWidth > containerHeight * videoAspectRatio) {
				video.height = containerHeight;
				video.width = video.height * videoAspectRatio;

				// ideally the canvas has a 50px padding
				const spaceLeft = containerWidth - video.width;
				padding = spaceLeft < maxPadding ? spaceLeft : maxPadding;
			} else {
				video.width = containerWidth;
				video.height = video.width * 1 / videoAspectRatio;
			}

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
				if (object?.customOptions?.id === id)
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
						customOptions: {
							id,
						},
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
			pageRef.current = page;
		}, [variables, script, page]);

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
				if (pageRef.current === AppScreens.EXPORTING)
					return canvas.remove(object);

				const id = uuidv4();

				let { pinnedFrame } = variablesRef.current;
				const scriptClone = { ...scriptRef.current };
				const hasPinnedFrame: boolean = !!pinnedFrame;

				if (!pinnedFrame)
					pinnedFrame = 1;

				const frameScript = scriptClone[pinnedFrame];

				scriptClone[pinnedFrame] = {
					...frameScript,
					show: [...(frameScript?.show ?? []), id],
				};

				if (hasPinnedFrame) {
					const nextFrame = 4;
					const hideFrameScript = scriptClone[pinnedFrame + nextFrame];

					scriptClone[pinnedFrame + nextFrame] = {
						...hideFrameScript,
						hide: [...(hideFrameScript?.hide ?? []), id],
					};
				}

				// add object to script
				setScript(scriptClone);

				const options: Partial<fabric.Object> = {
					customOptions: {
						id,
						permanent: !hasPinnedFrame,
					},
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
				canvas.clear();
				canvas.removeListeners();
			};
		}, []);

		useEffect(() => {
			/** The next animation frame */
			let localReqAnim: number = 0;

			const requestAnimFrame = () => {
				localReqAnim = requestAnimationFrame(animate);
			};

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

				fabricCanvasRef.current?.requestRenderAll();

				return requestAnimFrame();
			};

			requestAnimFrame();

			return () => {
				cancelAnimationFrame(localReqAnim);
			};
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

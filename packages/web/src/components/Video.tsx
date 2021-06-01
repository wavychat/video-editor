import React, { useEffect, useImperativeHandle, useRef } from "react";
import { useRecoilState } from "recoil";
import { variablesState } from "../helpers/atoms";

interface Props {}

const BackgroundVideo = React.forwardRef<HTMLVideoElement, Props>(
	(props, ref) => {
		const videoRef = useRef<HTMLVideoElement>(null);
		const [variables, setVariables] = useRecoilState(variablesState);

		useImperativeHandle(ref, () => videoRef.current!);

		useEffect(() => {
			if (variables.playVideo) videoRef.current?.play();
			else {
				console.log("stopped at frame", variables.pinnedFrame);
				videoRef.current?.pause();
			}
		}, [variables.playVideo]);

		useEffect(() => {
			const video = videoRef.current;
			if (!video) return;

			/** On video loaded and ready to be played */
			const onReady = () => {
				setVariables((vars) => ({
					...vars,
					playVideo: true,
				}));
			};

			/** Replay video when ended (loop) */
			const onEnd = () => {
				videoRef.current!.currentTime = 0;
				videoRef.current!.play();
			};

			let focused: boolean = true;
			/** Pause video when not in the tab */
			const onVisibilityChange = () => {
				focused = !focused;
				if (!focused) video.pause();
				else if (variables.playVideo) video.play();
			};

			document.addEventListener("visibilitychange", onVisibilityChange);
			video.addEventListener("canplaythrough", onReady);
			video.addEventListener("ended", onEnd);

			return () => {
				document.removeEventListener(
					"visibilitychange",
					onVisibilityChange
				);

				video.removeEventListener("canplaythrough", onReady);
				video.removeEventListener("ended", onEnd);
			};
		}, [variables.playVideo]);

		return (
			<div>
				<video
					src="./test.mp4"
					ref={videoRef}
					muted={process.env.NODE_ENV === "development"}
					style={{
						position: "absolute",
						zIndex: 1,
						width: "100%",
						height: "100%",
					}}
				/>
			</div>
		);
	}
);

export default BackgroundVideo;

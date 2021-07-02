import React, { useEffect, useImperativeHandle, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { AppScreens, pageState, variablesState } from "../helpers/atoms";
import { IS_PROD } from "../helpers/constants";

interface Props {}

const BackgroundVideo = React.forwardRef<HTMLVideoElement, Props>(
	(props, ref) => {
		const videoRef = useRef<HTMLVideoElement>(null);

		const page = useRecoilValue(pageState);
		const [variables, setVariables] = useRecoilState(variablesState);

		useImperativeHandle(ref, () =>
			(videoRef.current!));

		useEffect(() => {
			const video = videoRef.current;
			if (!video)
				return;

			if (variables.playVideo)
				video.play();
			else
				video.pause();

			/** Is the tab focused */
			let focused: boolean = true;
			/** Pause video when not in the tab */
			const onVisibilityChange = () => {
				focused = (page === AppScreens.EXPORTING) || !focused;
				if (!focused)
					video.pause();
				else if (variables.playVideo)
					video.play();
			};

			if (page !== AppScreens.EXPORTING)
				document.addEventListener("visibilitychange", onVisibilityChange);

			/** Replay video when ended (loop) */
			const onEnd = () => {
				if (page === AppScreens.EXPORTING)
					return;

				videoRef.current!.currentTime = 0;
				videoRef.current!.play();
			};

			if (page !== AppScreens.EXPORTING)
				video.addEventListener("ended", onEnd);

			return () => {
				document.removeEventListener(
					"visibilitychange",
					onVisibilityChange,
				);
				video.removeEventListener("ended", onEnd);
			};
		}, [variables.playVideo, page]);

		useEffect(() => {
			const video = videoRef.current;
			if (!video)
				return;

			/** On video loaded and ready to be played */
			const onReady = () => {
				setVariables((vars) =>
					({
						...vars,
						playVideo: true,
					}));
			};

			video.addEventListener("canplay", onReady);

			// for ios
			video.load();

			return () => {
				video.removeEventListener("canplay", onReady);
			};
		}, []);

		return (
			<div>
				<video
					src={variables.videoUrl}
					ref={videoRef}
					muted={!IS_PROD}
					style={{
						position: "absolute",
						zIndex: 1,
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				/>
			</div>
		);
	},
);

BackgroundVideo.displayName = "BackgroundVideo";

export default BackgroundVideo;

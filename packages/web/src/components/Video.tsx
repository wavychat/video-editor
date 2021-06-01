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

			const onEnd = () => {
				videoRef.current!.currentTime = 0;
				videoRef.current!.play();
				setVariables((vars) => ({ ...vars, looped: vars.looped + 1 }));
			};

			video.addEventListener("ended", onEnd);

			video.addEventListener("canplay", () => {
				console.log("canplay");
				setVariables((vars) => ({
					...vars,
					playVideo: true,
				}));
			});

			return () => {
				video.removeEventListener("ended", onEnd);
			};
		}, []);

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

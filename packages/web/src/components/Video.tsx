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
			if (!videoRef.current) return;

			const onEnd = () => {
				videoRef.current!.currentTime = 0;
				videoRef.current!.play();
				setVariables((vars) => ({ ...vars, looped: vars.looped + 1 }));
			};

			videoRef.current.addEventListener("ended", onEnd);

			return () => {
				videoRef.current?.removeEventListener("ended", onEnd);
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

import React, { useEffect, useImperativeHandle, useRef } from "react";
import { useRecoilValue } from "recoil";
import { variablesState } from "../helpers/atoms";

interface Props {}

const BackgroundVideo = React.forwardRef<HTMLVideoElement, Props>(
	(props, ref) => {
		const videoRef = useRef<HTMLVideoElement>(null);
		const variables = useRecoilValue(variablesState);

		useImperativeHandle(ref, () => videoRef.current!);

		useEffect(() => {
			if (variables.playVideo) videoRef.current?.play();
			else videoRef.current?.pause();
		}, [variables.playVideo]);

		return (
			<div>
				<video
					src="./test.mp4"
					loop
					ref={videoRef}
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

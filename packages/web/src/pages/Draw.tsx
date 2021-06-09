import React, { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CirclePicker, ColorResult } from "react-color";
import { IEditCanvasRef } from "../components/Canvas";
import {
	AppScreens,
	lineOptionsState,
	pageState,
	variablesState,
} from "../helpers/atoms";
import { DefaultColors } from "../helpers/defaults";

interface Props {
	canvasRef: React.RefObject<IEditCanvasRef>;
}

export const DrawPage: React.FC<Props> = ({ canvasRef }) => {
	const setPage = useSetRecoilState(pageState);
	const [_, setVariables] = useRecoilState(variablesState);
	const [lineOptions, setLineOptions] = useRecoilState(lineOptionsState);

	const exitPage = () => {
		setVariables((vars) =>
			({ ...vars, isDrawing: false }));
		return setPage(AppScreens.INITIAL);
	};

	const colorChangeHandler = ({ hex: color }: ColorResult) =>
		setLineOptions((opts) =>
			({
				...opts,
				color,
			}));

	useEffect(() => {
		setVariables((vars) =>
			({ ...vars, isDrawing: true }));
	}, []);

	return (
		<div>
			<button onClick={exitPage} type="button">
				Exit
			</button>
			<button
				onClick={() =>
					setVariables((vars) =>
						({ ...vars, erasing: true }))}
				type="button"
			>
				Erasing
			</button>
			<button
				onClick={() =>
					setVariables((vars) =>
						({ ...vars, erasing: false }))}
				type="button"
			>
				Draw
			</button>
			<input
				type="number"
				value={lineOptions.size}
				onChange={(ev) =>
					setLineOptions((opts) =>
						({
							...opts,
							size: ev.currentTarget.valueAsNumber,
						}))}
			/>
			<CirclePicker
				width="100%"
				circleSize={22}
				circleSpacing={10}
				colors={DefaultColors}
				color={lineOptions.color}
				onChangeComplete={colorChangeHandler}
			/>
		</div>
	);
};

import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { CirclePicker } from "react-color";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { IEditCanvasRef } from "../components/Canvas";
import { AppScreens, pageState, variablesState } from "../helpers/atoms";

interface Props {
	canvasRef: React.RefObject<IEditCanvasRef>;
}

export const TextPage: React.FC<Props> = ({ canvasRef }) => {
	// global state
	const setPage = useSetRecoilState(pageState);
	const { selectedTextId } = useRecoilValue(variablesState)!;

	// local state
	const [text, setText] = useState<string>("");
	const textObject = useRef<fabric.IText>();

	const exitPage = () => {
		setPage(AppScreens.INITIAL);
	};

	if (!selectedTextId || !canvasRef.current) {
		exitPage();
		return <>Redirecting...</>;
	}

	// useEffect(() => {
	// 	textObject.current = canvasRef.current?.getObject(selectedTextId) as
	// 		| fabric.IText
	// 		| undefined;
	// 	setText(textObject.current!.text ?? "");

	// 	// hide object
	// 	textObject.current!.opacity = 0;
	// 	canvasRef.current?.getFabric()?.renderAll();

	// 	// show object
	// 	return () => {
	// 		textObject.current!.opacity = 1;
	// 		canvasRef.current?.getFabric()?.renderAll();
	// 	};
	// }, []);

	const changeObjectValue = (text: string) => {
		textObject.current!.text = text.trim();
	};

	const textChangeHandler: ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
		const value = ev.currentTarget.value.trim();
		setText(value);
		return changeObjectValue(value);
	};

	const colorChangeHandler: ChangeEventHandler<HTMLInputElement> = (ev) => {
		textObject.current!.fill = ev.currentTarget.value;
		return ev.currentTarget.value;
	};

	return (
		<div>
			<button onClick={exitPage}>Exit</button>
			<textarea
				placeholder="Text goes here ..."
				onChange={textChangeHandler}
			/>
			<input type="color" onChange={colorChangeHandler} />
		</div>
	);
};

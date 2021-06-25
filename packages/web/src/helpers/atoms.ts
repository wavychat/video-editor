import { atom } from "recoil";
import { IScripting } from "./types/scripting";

export enum LineTypes {
	NORMAL,
	// TODO: implement neon
	NEON,
}

export interface ILineOptions {
	type: LineTypes;
	size: number;
	color: string;
}

export interface ITextOptions {
	background: string;
	color: string;
	fontFamily: string;
	fontWeight: number;
	fontStyle: string;
	textAlign: "center" | "left" | "right";
}

export interface IVariables {
	/** The FPS of the video */
	readonly FPS: number;

	/** The initial video url */
	readonly videoUrl: string;

	/** The final video duration */
	videoDuration: number;

	/** If the user is in draw state (drawing or erasing) */
	isDrawing: boolean;

	/** If the user is erasing */
	erasing: boolean;

	/** If the video is playing (when frame is pinned) */
	playVideo: boolean;

	/** The frame that was pinned */
	pinnedFrame?: number | undefined;

	/** The ID of the selected text */
	selectedTextId?: string;

	/** The blob url of the video when it's exported */
	exportedVideoUrl?: string | undefined;
}

export enum AppScreens {
	INITIAL,
	TEXT,
	DRAW,
	IMAGE_UPLOAD,
	DUO_UPLOAD,
	SOUND_CHANGE,
	VIDEO_TRIM,
	AUDIO_TRIM,
	EXPORTING
}

export const scriptState = atom<IScripting>({
	key: "scriptState",
	default: {},
});

export const pageState = atom<AppScreens>({
	key: "pageState",
	default: AppScreens.INITIAL,
});

export const variablesState = atom<IVariables>({
	key: "variablesState",
	default: {
		FPS: 30,
		videoUrl: "",
		// TODO: Make this dynamic
		videoDuration: 11.863,

		isDrawing: false,
		erasing: false,
		playVideo: false,

		pinnedFrame: undefined,
		exportedVideoUrl: undefined,
	},
});

export const textOptionsState = atom<ITextOptions>({
	key: "textOptionsState",
	default: {
		color: "#FFFFFF",
		background: "#272A2BDE",
		fontFamily: "Arial",
		fontWeight: 500,
		fontStyle: "normal",
		textAlign: "center",
	},
});

export const lineOptionsState = atom<ILineOptions>({
	key: "lineOptionsState",
	default: {
		color: "#FFFFFF",
		size: 12,
		type: LineTypes.NORMAL,
	},
});

import { ObjectID } from "../../types/fabric/fabric-impl";

// TODO: add more actions
export enum Actions {
	COLOR_CHANGE,
}

export interface IMovement {
	id: ObjectID;

	/** Move object to `x, y` coordinates */
	to: [number, number];
}

export interface IColorChangeData {}

export interface IModification {
	id: ObjectID;
	type: Actions;
	data: IColorChangeData;
}

export interface IScript {
	/** IDs of objects to show */
	show?: ObjectID[];

	/** IDs of objects to hide */
	hide?: ObjectID[];

	/** Objects to move */
	move?: IMovement[];

	/** Objects to modify */
	modify?: IModification[];
}

export interface IScripting {
	/** Script of this frame */
	[frame: number]: IScript | undefined;
}

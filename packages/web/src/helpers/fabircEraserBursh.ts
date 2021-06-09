// Source: https://github.com/fabricjs/fabric.js/issues/1225#issuecomment-499620550

import { fabric } from "fabric";

/*
 * Note: Might not work with versions other than 3.1.0
 *
 * Made it so that the bound is calculated on the original only
 */
const ErasedGroup = fabric.util.createClass(fabric.Group, {
	original: null,
	erasedPath: null,
	initialize(
		original: any,
		erasedPath: any,
		options: any,
		isAlreadyGrouped: any,
	) {
		this.original = original;
		this.erasedPath = erasedPath;
		this.callSuper(
			"initialize",
			[this.original, this.erasedPath],
			options,
			isAlreadyGrouped,
		);
	},

	_calcBounds(onlyWidthHeight: any) {
		const aX = [];
		const aY = [];
		const props = ["tr", "br", "bl", "tl"];
		const jLen = props.length;
		const ignoreZoom = true;

		const o = this.original;
		o.setCoords(ignoreZoom);
		for (let j = 0; j < jLen; j++) {
			aX.push(o.oCoords[props[j]].x);
			aY.push(o.oCoords[props[j]].y);
		}

		this._getBounds(aX, aY, onlyWidthHeight);
	},
});

/*
 * Note1: Might not work with versions other than 3.1.0
 *
 * Made it so that the path will be 'merged' with other objects
 *  into a customized group and has a 'destination-out' composition
 */
export const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
	/**
	 * On mouseup after drawing the path on contextTop canvas
	 * we use the points captured to create an new fabric path object
	 * and add it to the fabric canvas.
	 */
	_finalizeAndAddPath() {
		const ctx = this.canvas.contextTop;
		ctx.closePath();
		if (this.decimate)
			this._points = this.decimatePoints(this._points, this.decimate);

		const pathData = this.convertPointsToSVGPath(this._points).join("");
		if (pathData === "M 0 0 Q 0 0 0 0 L 0 0") {
			// do not create 0 width/height paths, as they are
			// rendered inconsistently across browsers
			// Firefox 4, for example, renders a dot,
			// whereas Chrome 10 renders nothing
			this.canvas.requestRenderAll();
			return;
		}

		// use globalCompositeOperation to 'fake' eraser
		const path = this.createPath(pathData);
		path.globalCompositeOperation = "destination-out";
		path.selectable = false;
		path.evented = false;
		path.absolutePositioned = true;

		// grab all the objects that intersects with the path
		const objects = this.canvas
			.getObjects()
			.filter((obj: fabric.Object) => {
				// if (obj instanceof fabric.Textbox) return false;
				// if (obj instanceof fabric.IText) return false;
				if (!obj.intersectsWithObject(path))
					return false;
				return true;
			});

		if (objects.length > 0) {
			// merge those objects into a group
			const mergedGroup = new fabric.Group(objects);

			// This will perform the actual 'erasing'
			// NOTE: you can do this for each object, instead of doing it with a merged group
			// however, there will be a visible lag when there's many objects affected by this
			const newPath = new ErasedGroup(mergedGroup, path);

			const { left } = newPath;
			const { top } = newPath;

			// convert it into a dataURL, then back to a fabric image
			const newData = newPath.toDataURL({
				withoutTransform: true,
			});
			fabric.Image.fromURL(newData, (fabricImage) => {
				fabricImage.set({
					left,
					top,
				});

				// remove the old objects then add the new image
				this.canvas.remove(...objects);
				this.canvas.add(fabricImage);
			});
		}

		this.canvas.clearContext(this.canvas.contextTop);
		this.canvas.renderAll();
		this._resetShadow();
	},
});

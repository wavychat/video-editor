declare global {
    interface HTMLCanvasElement {
        /**
         * Method returning a MediaStream which includes a CanvasCaptureMediaStreamTrack containing a real-time video capture of the canvas's contents.
         * @param frameRate - A double-precision floating-point value that indicates the rate of capture of each frame. If not set, a new frame will be captured each time the canvas changes; if set to 0, frames will not be captured automatically; instead, they will only be captured when the returned track's requestFrame() method is called.
         * @returns A reference to a MediaStream object, which has a single CanvasCaptureMediaStreamTrack in it.
         */
        captureStream(frameRate?: number): MediaStream;
   }
 }

export default class CustomTimeout {
    /** The timestamp when the timeout started */
    start!: number

    /** The timeout function */
    timer!: number;

    /** How much time is left */
    remaining!: number

    /** Function that is called when the timer is ended */
    callback!: TimerHandler

    constructor(cb: TimerHandler, delay: number) {
    	this.callback = cb;
    	this.remaining = delay;

    	this.resume();
    }

    pause = () => {
    	if (this.timer)
    		clearTimeout(this.timer);
    	this.remaining -= Date.now() - this.start;
    }

    resume = () => {
    	this.start = Date.now();

    	if (this.timer)
    		clearTimeout(this.timer);

    	this.timer = setTimeout(this.callback, this.remaining);
    }
}

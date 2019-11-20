export class Mouse {
    constructor(canvas) {
        this.x = -1;
        this.y = -1;

        this.pressedX = -1;
        this.pressedY = -1;

        this.heldX = -1;
        this.heldY = -1;

        canvas.addEventListener("mousemove", this.handleMoveEvent.bind(this));
        canvas.addEventListener("mousedown", this.handleDownEvent.bind(this));
        canvas.addEventListener("mouseup", this.handleUpEvent.bind(this));
        canvas.addEventListener("mouseleave", this.handleLeaveEvent.bind(this));
    }

    pressed() {
        return this.pressedX !== -1 && this.pressedY !== -1;
    }

    isHeld() {
        return this.heldX !== -1 && this.heldY !== -1;
    }

    handleMoveEvent(event) {
        this.x = event.clientX;
        this.y = event.clientY;
    }

    handleDownEvent(event) {
        this.heldX = this.pressedX = event.clientX;
        this.heldY = this.pressedY = event.clientY;
    }

    handleUpEvent(event) {
        this.heldX = -1;
        this.heldY = -1;
    }

    handleLeaveEvent() {
        this.heldX = -1;
        this.heldY = -1;
    }

    /**
     * Resets the internal state for polling.
     */
    reset() {
        this.pressedX = -1;
        this.pressedY = -1;
    }
}

/**
 * MouseWheel is a class which is used to represent the current state of the mouse wheel when it is captured
 * over a canvas. This class holds the internal state of all the captured WheelEvent's between frames in order
 * to compact the events down into a single delta.
 */
export class MouseWheel {
    constructor(canvas) {
        this.delta = 0;
        canvas.addEventListener("wheel", this.handleWheelEvent.bind(this))
    }

    /**
     * Returns if the mouse wheel has moved since the last time it was polled.
     *
     * @returns {boolean} if the mouse wheel has moved.
     */
    isMoved() {
        return this.delta !== 0;
    }

    /**
     * For internal use only. Updates the mouse wheel by handling a mouse wheel event that was intercepted
     * for the canvas that the mouse wheel is bound to.
     *
     * @param event the event to use to update the mouse wheel.
     */
    handleWheelEvent(event) {
        this.delta += event.deltaY;
    }

    /**
     * Resets the internal state for polling.
     */
    reset() {
        this.delta = 0;
    }
}
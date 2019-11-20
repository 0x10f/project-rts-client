import * as THREE from "three";
import {Vector2} from "three";

export class MousePanning {
    constructor({viewport, mouse}) {
        this.viewport = viewport;
        this.mouse = mouse;

        // The screen coordinates of where the panning starts and where the panning ends. These two points are equal
        // to where the mouse is first pressed and when the mouse is released thereafter.
        this.point = new THREE.Vector2(0, 0);

        // Flag which is set when the user is currently panning the camera. This is set when the mouse is
        // held and the flag is enabled. It is disabled when the mouse is no longer being held and the
        // flag is enabled.
        this.active = false;
    }

    handle() {
        // - Mouse panning is not active but the mouse is being held:
        //      + Enable mouse panning, set last known mouse position.
        // - Mouse panning is active and the mouse is still being held:
        //      + Offset viewport by vector computed from the last known mouse position and current mouse position.
        // - Mouse panning is active but the mouse is not being held:
        //      + Disable mouse panning, reset the last known mouse position.
        // - Mouse panning is not active and the mouse being not held:
        //      + Do nothing.
        if (!this.active && this.mouse.isHeld()) {
            this.point.set(this.mouse.x, this.mouse.y);
            this.active = true;
        }

        if (this.active && this.mouse.isHeld()) {
            const delta = new THREE.Vector2(this.mouse.x, this.mouse.y).sub(this.point);
            this.viewport.offsetPosition(delta.negate().multiplyScalar(this.viewport.squaresPerPixel));
            this.point.set(this.mouse.x, this.mouse.y);
        }

        if (this.active && !this.mouse.isHeld()) {
            this.active = false;
        }
    }
}

export class KeyboardPanning {
    constructor({viewport, keyboard}) {
        this.viewport = viewport;
        this.keyboard = keyboard;

        this.screenPercent = 0.05;
    }

    get pixelsPerUpdate() {
        return Math.max(screen.width, screen.height) * this.screenPercent;
    }

    handle() {
        // Handle keyboard panning before the stage is updated. Pressing an arrow key corresponds
        // to a direction to pan in.
        if (this.keyboard.isPressed(["ArrowUp"])) {
            const delta = new Vector2(0, this.pixelsPerUpdate);
            this.viewport.offsetPosition(delta.multiplyScalar(this.viewport.squaresPerPixel));
        }

        if (this.keyboard.isPressed(["ArrowDown"])) {
            const delta = new Vector2(0, -this.pixelsPerUpdate);
            this.viewport.offsetPosition(delta.multiplyScalar(this.viewport.squaresPerPixel));
        }

        if (this.keyboard.isPressed(["ArrowLeft"])) {
            const delta = new Vector2(-this.pixelsPerUpdate, 0);
            this.viewport.offsetPosition(delta.multiplyScalar(this.viewport.squaresPerPixel));
        }

        if (this.keyboard.isPressed(["ArrowRight"])) {
            const delta = new Vector2(this.pixelsPerUpdate, 0);
            this.viewport.offsetPosition(delta.multiplyScalar(this.viewport.squaresPerPixel));
        }
    }
}
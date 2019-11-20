import * as THREE from 'three';
import Viewport from "./viewport";
import {Mouse, MouseWheel} from "./mouse";
import Stage from "./stage";

export default class App {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.viewport = new Viewport(canvas);

        this.stage = new Stage({viewport: this.viewport});

        this.mouse = new Mouse(canvas);

        this.mouseWheel = new MouseWheel(canvas);

        // Mouse wheel zoom scale is the amount to increment or decrement the zoom per pixel of how much the
        // document would have moved.
        this.mouseWheelZoomPerUnit = 0.00025;    // 0.00025 per pixel

        // Flag for if the mouse wheel zoom direction should be inverted (moving forward zooms out instead of in).
        this.invertMouseWheelZoom = false;

        // Flag which is set when the user is currently panning the camera. This is set when the mouse is
        // held and the flag is enabled. It is disabled when the mouse is no longer being held and the
        // flag is enabled.
        this.mousePanningActive = false;

        // The screen coordinates of where the panning starts and where the panning ends. These two points are equal
        // to where the mouse is first pressed and when the mouse is released thereafter.
        this.mousePanningPoint = new THREE.Vector2(0, 0);

        this.scene = new THREE.Scene();
        this.scene.add(this.stage.plane);
        this.scene.add(this.stage.planeWireframe);

        this.displayDebug();
        this.draw();
    }

    displayDebug() {
        console.log(
            "Screen Debug [Width: %f, Height: %f, Avail Width: %f, Avail Height: %f]",
            screen.width,
            screen.height,
            screen.availWidth,
            screen.availHeight,
        );

        console.log(
            "Canvas Debug [Width: %f, Height: %f, Client Width: %f, Client Height: %f]",
            this.renderer.domElement.width,
            this.renderer.domElement.height,
            this.renderer.domElement.clientWidth,
            this.renderer.domElement.clientHeight,
        );

        console.log(
            "Viewport Debug [Square Width: %d, Square Height: %d, Maximum Square Width: %d, Maximum Square Height: %d]",
            this.viewport.squareWidth,
            this.viewport.squareHeight,
            this.viewport.maximumSquareWidth,
            this.viewport.maximumSquareHeight
        )
    }

    draw() {
        // Attempt to resize the viewport. If the viewport was resized then the renderer also needs to be.
        if (this.viewport.resize()) {
            this.renderer.setSize(this.viewport.canvas.width, this.viewport.canvas.height, false);

            console.log(
                "Viewport resized [Canvas Width: %f, Canvas Height: %f]",
                this.viewport.canvas.width,
                this.viewport.canvas.height,
            );
        }

        // When the mouse wheel has been moved during the time between this frame and the last,
        // increment the zoom by the amount the mouse moved times the mouse wheel zoom scale.
        if (this.mouseWheel.isMoved()) {
            const previous = this.viewport.zoom;

            const invert = this.invertMouseWheelZoom ? -1 : 1;
            this.viewport.incrementZoom(this.mouseWheel.delta * this.mouseWheelZoomPerUnit * invert);

            console.log(
                "Updated viewport zoom [Wheel Delta: %s, Old: %s, New: %s]",
                this.mouseWheel.delta.toFixed(2),
                previous.toFixed(3),
                this.viewport.zoom.toFixed(3)
            );
        }

        // Handle mouse panning before we update the stage. This is broken down into three cases:
        // --------------------------------------------------------------------------------------
        // - Mouse panning is not active but the mouse is being held:
        //      + Enable mouse panning, set last known mouse position.
        // - Mouse panning is active and the mouse is still being held:
        //      + Offset viewport by vector computed from the last known mouse position and current mouse position.
        // - Mouse panning is active but the mouse is not being held:
        //      + Disable mouse panning, reset the last known mouse position.
        // - Mouse panning is not active and the moust being not held does nothing.
        if (!this.mousePanningActive && this.mouse.isHeld()) {
            this.mousePanningPoint.set(this.mouse.x, this.mouse.y);
            this.mousePanningActive = true;
        }

        if (this.mousePanningActive && this.mouse.isHeld()) {
            const delta = new THREE.Vector2(this.mouse.x, this.mouse.y).sub(this.mousePanningPoint);
            this.viewport.offsetPosition(delta.negate().multiplyScalar(this.viewport.squaresPerPixel));
            this.mousePanningPoint.set(this.mouse.x, this.mouse.y);
        }

        if (this.mousePanningActive && !this.mouse.isHeld()) {
            this.mousePanningActive = false;
        }

        this.stage.update();

        this.renderer.render(this.scene, this.viewport.camera);

        // Reset the application state before we process the next frame.
        this.reset();

        requestAnimationFrame(this.draw.bind(this));
    }

    /**
     * Resets all of the application state needed in order to process the next frame.
     */
    reset() {
        this.viewport.reset();
        this.mouse.reset();
        this.mouseWheel.reset();
    }
}
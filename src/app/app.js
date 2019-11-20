import * as THREE from 'three';
import Viewport from "./viewport";
import {Mouse, MouseWheel} from "./mouse";
import Stage from "./stage";
import {Keyboard} from "./keyboard";
import {Vector2} from "three";
import {KeyboardPanning, MousePanning} from "./controls/panning";

export default class App {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.viewport = new Viewport(canvas);

        this.stage = new Stage({viewport: this.viewport});

        this.mouse = new Mouse(canvas);

        this.keyboard = new Keyboard(window);

        this.mouseWheel = new MouseWheel(canvas);

        this.mousePanning = new MousePanning({viewport: this.viewport, mouse: this.mouse});
        this.keyboardPanning = new KeyboardPanning({viewport: this.viewport, keyboard: this.keyboard});

        // Mouse wheel zoom scale is the amount to increment or decrement the zoom per pixel of how much the
        // document would have moved.
        this.mouseWheelZoomPerPixel = 0.00025;    // 0.00025 per pixel

        // Flag for if the mouse wheel zoom direction should be inverted (moving forward zooms out instead of in).
        this.invertMouseWheelZoom = false;

        this.keyboardScreenPanningPercent = 0.05;

        this.scene = new THREE.Scene();
        this.scene.add(this.stage.plane);
        this.scene.add(this.stage.planeWireframe);

        this.displayDebug();
        this.draw();
    }

    get keyboardPanningPixelsPerUpdateWidth() {
        return screen.width * this.keyboardScreenPanningPercent;
    }

    get keyboardPanningPixelsPerUpdateHeight() {
        return screen.height * this.keyboardScreenPanningPercent;
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
            this.viewport.incrementZoom(this.mouseWheel.delta * this.mouseWheelZoomPerPixel * invert);

            console.log(
                "Updated viewport zoom [Wheel Delta: %s, Old: %s, New: %s]",
                this.mouseWheel.delta.toFixed(2),
                previous.toFixed(3),
                this.viewport.zoom.toFixed(3)
            );
        }

        this.mousePanning.handle();
        this.keyboardPanning.handle();

        this.stage.update();

        this.renderer.render(this.scene, this.viewport.camera);

        // Reset the application state before we process the next frame.
        this.reset();

        requestAnimationFrame(this.draw.bind(this));
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

    /**
     * Resets all of the application state needed in order to process the next frame.
     */
    reset() {
        this.viewport.reset();
        this.mouse.reset();
        this.mouseWheel.reset();
        this.keyboard.reset();
    }
}
import * as THREE from "three";

import {Math as MathUtils} from "three";
import {Vector2} from "three";

export default class Viewport {
    constructor(canvas) {
        this.canvas = canvas;

        // A flag which is set when the canvas is resized during the time between the current frame and the
        // previous. Reset must be called between frames in order to reset this flag.
        //
        // IMPORTANT: Do not use this property directly without great caution because it will not be properly set if
        //            'resized' is called.
        this.canvasResized = false;

        // Camera is used to project any object placed on the map to screen coordinates. The center of
        // the camera is always in the center of the viewport and at the coordinates (0,0). The left
        // and right side of the camera corresponds to [-squareWidth/2,squareWidth/2] and the top
        // and bottom of the camera corresponds to [squareHeight/2, -squareHeight/2].
        this.camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
        this.camera.position.z = 0.5;

        // Position is where the viewport is currently located in map coordinates.
        // This vector is always in the center of the viewport.
        //
        // IMPORTANT: Any time this value is set 'update' must be called in order to
        //            recompute all the internal state.
        this.position = new THREE.Vector2(0, 0);

        // The minimum and maximum number of map coordinates per pixel that will be displayed.
        this.minimumSquaresPerPixel = 1;
        this.maximumSquaresPerPixel = 3;

        // The current zoom factor. This value must be clamped to be between [0,1]
        // and is used to lerp between the maximumSquaresPerPixel and the
        // minimumSquaresPerPixel.
        this.zoom = 0.5;

        // The current screen ratio which is defined as the number of map coordinates per pixel.
        // This ratio is used to help describe how much of the map area the viewport has visible.
        this.squaresPerPixel = this.minimumSquaresPerPixel;

        // The box which describes what is currently viewable on the map.
        this.mapBounds = new THREE.Box2();

        // The dimensions of the bounding box that describe what is currently viewable on the map.
        this.mapDimensions = new THREE.Vector2();

        // The dimensions of the bounding box which describes the maximum viewable map area when the
        // client is both full screen and fully zoomed out.
        this.maximumMapDimensions = new THREE.Vector2(
            screen.width * this.maximumSquaresPerPixel,
            screen.height * this.maximumSquaresPerPixel,
        );
    }

    /**
     * Sets the current position of the viewport on the map. Calling this function will also update all of the other
     * properties of the viewport that are dependant on the viewport's position.
     *
     * @param position the point to set the viewport at in map coordinates.
     */
    setPosition(position) {
        this.position = position;
        this.update();
    }

    /**
     * Offsets the position of the viewport by a vector.
     *
     * @param vector the vector to offset the position by.
     */
    offsetPosition(vector) {
        this.setPosition(this.position.add(vector));
    }

    /**
     * Sets the zoom factor.
     *
     * @param zoom a value between [0, 1]. 0 corresponds with zooming out and 1 corresponds with zooming in. Values
     *             outside of this range are clamped.
     */
    setZoom(zoom) {
        this.zoom = MathUtils.clamp(zoom, 0, 1);
        this.update();
    }

    /**
     * Increments the zoom factor.
     *
     * @param amount the amount to increment the zoom factor by. This value can be negative or positive. Negative
     *               values correspond with zooming out and positive values correspond with zooming in.
     */
    incrementZoom(amount) {
        this.setZoom(this.zoom + amount);
    }

    /**
     * Gets the width of the viewport in map coordinates.
     *
     * @returns {number} the width.
     */
    get squareWidth() {
        return this.mapDimensions.x;
    }

    /**
     * Gets the height of the viewport in map coordinates.
     *
     * @returns {number} the height.
     */
    get squareHeight() {
        return this.mapDimensions.y;
    }

    /**
     * Gets the maximum width of the viewport in map coordinates.
     * This is computed from the width of the user's screen.
     *
     * @returns {number}
     */
    get maximumSquareWidth() {
        return this.maximumMapDimensions.x;
    }

    /**
     * Gets the maximum height of the viewport in map coordinates.
     * This is computed from the height of the user's screen.
     *
     * @returns {number} the height.
     */
    get maximumSquareHeight() {
        return this.maximumMapDimensions.y;
    }

    /**
     * Gets if the viewport was resized. This will set an internal flag so future calls to this function during
     * the current frame will always return if the viewport was resized.
     *
     * @returns {boolean} if the viewport was resized.
     */
    resized() {
        return (this.canvasResized = this.canvasResized || this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight);
    }

    /**
     * Attempts to resize the viewport.
     *
     * @param force if the canvas should be force resized. This will subsequently force an update.
     * @returns {boolean} if the viewport was resized. This value will always be true if 'force' is true.
     */
    resize(force = false) {
        if (force || this.resized()) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.update();

            return true;
        }

        return false;
    }

    update() {
        this.squaresPerPixel = MathUtils.lerp(
            this.maximumSquaresPerPixel,
            this.minimumSquaresPerPixel,
            this.zoom
        );

        this.mapBounds.set(
            new THREE.Vector2(
                Math.floor(this.position.x - this.squaresPerPixel * this.canvas.width / 2),
                Math.floor(this.position.y - this.squaresPerPixel * this.canvas.height / 2),
            ),
            new THREE.Vector2(
                Math.floor(this.position.x + this.squaresPerPixel * this.canvas.width / 2),
                Math.floor(this.position.y + this.squaresPerPixel * this.canvas.height / 2),
            )
        );

        this.mapBounds.getSize(this.mapDimensions);

        this.camera.left = -this.squareWidth / 2;
        this.camera.right = this.squareWidth / 2;
        this.camera.top = -this.squareHeight / 2;
        this.camera.bottom = this.squareHeight / 2;

        this.camera.updateProjectionMatrix();
    }

    /**
     * Resets the internal state for polling.
     */
    reset() {
        this.canvasResized = false;
    }
}
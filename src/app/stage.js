import * as THREE from "three";
import {Vector3} from "three";

export default class Stage {

    /**
     *
     * @param viewport        the viewport that the stage will be rendered on.
     * @param squaresPerChunk the number of map squares per a map chunk.
     */
    constructor({viewport, chunkSize: squaresPerChunk = 32}) {
        this.viewport = viewport;
        this.squaresPerChunk = squaresPerChunk;

        const chunkWidth = (this.viewport.maximumSquareWidth + this.squaresPerChunk) / this.squaresPerChunk + 2;
        const chunkHeight = (this.viewport.maximumSquareHeight + this.squaresPerChunk) / this.squaresPerChunk + 2;

        this.planeGeometry = new THREE.PlaneBufferGeometry(
            chunkWidth*this.squaresPerChunk,
            chunkHeight*this.squaresPerChunk,
            chunkWidth,
            chunkHeight
        );

        this.planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
        this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);

        this.planeWireframeGeometry = new THREE.WireframeGeometry(this.planeGeometry);
        this.planeWireframe = new THREE.LineSegments(this.planeWireframeGeometry);
        this.planeWireframe.material.depthTest = false;
        this.planeWireframe.material.opacity = 0.35;
        this.planeWireframe.material.transparent = true;
    }

    update() {
        this.plane.position.set(
            -(this.viewport.position.x % this.squaresPerChunk),
            -(this.viewport.position.y % this.squaresPerChunk),
            0
        );

        this.planeWireframe.position.set(
            -(this.viewport.position.x % this.squaresPerChunk),
            -(this.viewport.position.y % this.squaresPerChunk),
            0
        )
    }
}
import * as THREE from 'three';

import PerlinNoise from '../utils/perlin';

const generateNoiseTexture = () => {
    const width = 256, height = 256;

    let buffer = new Uint8Array(width * height * 3);

    for (let i = 0; i < width * height; i++) {
        const x = i % width, y = i / width, pos = i * 3;

        const offsetX = 0x400, offsetY = 0x400;
        const multiplier = 0x200;

        const rx = x + offsetX;
        const ry = y + offsetY;

        // Clamp the noise values between [0, 1].
        const noise = (PerlinNoise.octave2n(rx*multiplier, ry*multiplier, 8, 0.5) + 1) / 2;

        buffer[pos+0] = Math.floor(255 * noise);
        buffer[pos+1] = Math.floor(255 * noise);
        buffer[pos+2] = Math.floor(255 * noise);
    }

    const texture = new THREE.DataTexture(buffer, width, height, THREE.RGBFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    return texture;
};

export default class App {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas});

        const fov = 75;
        const aspect = 2;  // the canvas default
        const near = 0.1;
        const far = 5;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 2;

        this.scene = new THREE.Scene();

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        //const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue

        const texture = generateNoiseTexture();
        const materials = [
            new THREE.MeshBasicMaterial({map: texture}),
            new THREE.MeshBasicMaterial({map: texture}),
            new THREE.MeshBasicMaterial({map: texture}),
            new THREE.MeshBasicMaterial({map: texture}),
            new THREE.MeshBasicMaterial({map: texture}),
            new THREE.MeshBasicMaterial({map: texture}),
        ];

        this.cube = new THREE.Mesh(geometry, materials);

        this.scene.add(this.cube);

        this.render(0);
    }

    resize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const resized = canvas.width !== width || canvas.height !== height;
        if (resized) {
            this.renderer.setSize(width, height, false);
        }
        return resized;
    }

    render(time) {
        time *= 0.001;  // convert time to seconds

        if (this.resize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.cube.rotation.x = time;
        this.cube.rotation.y = time;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}
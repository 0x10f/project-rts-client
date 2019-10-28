import * as THREE from 'three';

import PerlinNoise from '../utils/perlin';
import * as dat from 'dat.gui';

class PerlinNoiseDataTexture {
    constructor(width, height, stride, offsetX, offsetY, octaves, persistence) {
        this.width = width;
        this.height = height;
        this.buffer = new Uint8Array(width * height * 3);
        this.threeTexture = new THREE.DataTexture(this.buffer, this.width, this.height, THREE.RGBFormat);

        this.stride = stride;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.octaves = octaves;
        this.persistence = persistence;
        this.update();
    }

    update() {
        for (let i = 0; i < this.width * this.height; i++) {
            const x = (i % this.width + this.offsetX) * this.stride;
            const y = (i / this.width + this.offsetY) * this.stride;
            const pos = i * 3;

            let noise = (PerlinNoise.octave2n(x, y, this.octaves, this.persistence) + 1) / 2;

            if (noise < 0.5) noise = 0.0;

            this.buffer[pos+0] = Math.floor(255 * noise);
            this.buffer[pos+1] = Math.floor(255 * noise);
            this.buffer[pos+2] = Math.floor(255 * noise);
        }

        this.threeTexture.needsUpdate = true;
    }
}

export default class App {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({canvas});

        const left = canvas.clientWidth / -2;
        const right = canvas.clientWidth / 2;
        const top = canvas.clientHeight / 2;
        const bottom = canvas.clientHeight / -2;
        const near = 1;
        const far = 1000;

        this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        this.camera.position.z = 2.5;

        this.scene = new THREE.Scene();

        const planeWidth = 512;
        const planeHeight = 512;

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        this.texture = new PerlinNoiseDataTexture(512, 512, 0x200, 0x0, 0x0, 5, 0.6);
        const materials = [ new THREE.MeshBasicMaterial({map: this.texture.threeTexture}), ];

        this.surface = new THREE.Mesh(geometry, materials);

        this.scene.add(this.surface);

        this.counter = 0;

        this.gui = new dat.GUI();
        this.gui.add(this.texture, 'stride', 0, 2048, 1).onFinishChange(() => this.texture.update());
        this.gui.add(this.texture, 'offsetX', -5000, 5000).onFinishChange(() => this.texture.update());
        this.gui.add(this.texture, 'offsetY', -5000, 5000).onFinishChange(() => this.texture.update());
        this.gui.add(this.texture, 'octaves', 1, 8, 1).onFinishChange(() => this.texture.update());
        this.gui.add(this.texture, 'persistence', 0, 1).onFinishChange(() => this.texture.update());

        this.render(0);
    }

    resize() {
        const canvas = this.renderer.domElement;
        const {clientWidth, clientHeight} = canvas;
        const resized = canvas.width !== clientWidth || canvas.height !== clientHeight;
        if (resized) {
            this.renderer.setSize(clientWidth, clientHeight, false);
        }
        return resized;
    }

    render(time) {
        this.counter++;

        /*if ((this.counter % 60) === 0) {
            console.log("Ping");
            this.texture.offsetX = Math.floor(Math.random() * 0x1000);
            this.texture.offsetY = Math.floor(Math.random() * 0x1000);
            this.texture.update();
        }*/

        if (this.resize()) {
            const canvas = this.renderer.domElement;
            const left = canvas.clientWidth / -2;
            const right = canvas.clientWidth / 2;
            const top = canvas.clientHeight / 2;
            const bottom = canvas.clientHeight / -2;

            this.camera.left = left;
            this.camera.right = right;
            this.camera.top = top;
            this.camera.bottom = bottom;

            this.camera.updateProjectionMatrix();
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}
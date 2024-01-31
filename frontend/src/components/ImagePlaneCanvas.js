import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LoadTexture } from '../utils/preLoader';
import axios from 'axios'

export default class ImagePlaneCanvas {
    constructor(width = window.innerWidth, height = window.innerHeight, color = 0x000000, opacity = 0.9) {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = new THREE.WebGL1Renderer(); //GLSL version
        this.planeMesh = null;
        this.textures = [];
        this.textureIndex = 0;
        this.slideInterval = null;
        this.slideTime = 1; // second
        this.slideEnable = false;

        this.bright = 0.001;
        this.contrast = 1.0;
        this.opacity = 1.0;

        this.images = [];
        this.imagesLoaded = {};

        this.initCamera({ x: 0, y: 20, z: 60 });
        this.initLights();
        this.initRenderer(width, height, color, opacity);

        this.addGridHelper();
        this.addOrbitController();
        this.loop();

        this.loopSlide();
    }

    initCamera(pos) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(pos.x, pos.y, pos.z);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);

        const p0 = new THREE.DirectionalLight(0xffffff, 0.5);
        p0.position.set(10, 10, 10);
        p0.lookAt(0, 0, 0);
        this.scene.add(p0);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 15, 0);
        directionalLight.lookAt(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    initRenderer(width, height, color, opacity) {
        this.renderer.setClearColor(color, opacity);
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);
    }

    addGridHelper() {
        const grid = new THREE.GridHelper(100, 20, 0x0000ff, 0x808080);
        this.scene.add(grid);
    }

    addOrbitController() {
        const orbitCcontrol = new OrbitControls(this.camera, this.renderer.domElement);
        orbitCcontrol.update();
        orbitCcontrol.addEventListener('change', this.loop.bind(this));
    }

    async addImagePlanes(position) {
        let response = (await axios.get('http://localhost:5000/getImageSize')).data;
        const planeGeometry = new THREE.PlaneGeometry(response.width, response.height); //buffergeometry is integrated in geometry

        response = (await axios.get('http://localhost:5000/getMultipleImages')).data;
        console.log(response);
        this.images = response;
        
        for (const key in response) {
            const texture = await LoadTexture(response[key]);
            this.textures.push(texture);
            this.imagesLoaded[key] = true;
        }

        const planeMaterial = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            map: this.textures[this.textureIndex],
        });
        planeMaterial.needsUpdate = true;

        this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.planeMesh.position.set(position.x, position.y, position.z);

        this.scene.add(this.planeMesh);
    }

    flip() {
        this.selectedPlane.rotation.y += Math.PI;
    }

    mirror() {
        this.selectedPlane.rotation.x += Math.PI;
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    loopSlide() {
        if (this.slideEnable) {
            this.textureIndex = (this.textureIndex + 1) % this.images.length;

            if (this.imagesLoaded[this.textureIndex] == true) {
                console.log('change texture', this.textureIndex);
                this.planeMesh.material.map = this.textures[this.textureIndex];
            } else {
                console.log(`Texture ${this.textureIndex} is not loaded!`)
            }
        }

        setTimeout(this.loopSlide.bind(this), 1000 * this.slideTime);
    }
    playSlide() {
        this.slideEnable = true;
    }

    stopSlide() {
        this.slideEnable = false;
    }
}

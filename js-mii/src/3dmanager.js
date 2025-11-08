import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";
import { OrbitControls } from "https://unpkg.com/three@0.120.1/examples/jsm/controls/OrbitControls.js";

const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({antialias: true, transparency: true});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

renderer.setAnimationLoop(animate);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

export function draw(vertices, indices) {
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 4));
	geometry.setIndex(indices);

	const material = new THREE.MeshNormalMaterial();

	const mesh = new THREE.Mesh(geometry, material);
	mesh.scale.setScalar(0.1)
	scene.add(mesh);
	console.log("added to scene");
}

function animate(time) {
	renderer.render(scene, camera);
}

// https://jsfiddle.net/GloriousGlider8/4k7n2vah/21/
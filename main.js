import * as THREE from "three";
import { GUI } from "dat.gui";

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Create a plane
const materialPlane = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: true,
});
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10, 10),
  materialPlane
);
scene.add(plane);

const world = {
  plane: {
    width: 10,
    height: 10,
    widthSegments: 10,
    heightSegments: 10,
  },
};

const generatePlane = () => {
  plane.geometry.dispose();
  plane.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  // Apply random deformation to the new geometry
  const { array } = plane.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i + 2] = z + Math.random();
  }
  plane.geometry.attributes.position.needsUpdate = true;
  plane.geometry.computeVertexNormals();
};

// Call generatePlane to apply initial randomization
generatePlane();

camera.position.z = 5;

// light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // plane.rotation.x += 0.01;

  renderer.render(scene, camera);
}
animate();

// Add dat.GUI controls
const gui = new GUI();
const planeFolder = gui.addFolder("Plane");
planeFolder.add(plane.rotation, "x", 0, Math.PI * 2).name("Rotation X");
planeFolder.add(plane.rotation, "y", 0, Math.PI * 2).name("Rotation Y");
planeFolder.add(plane.rotation, "z", 0, Math.PI * 2).name("Rotation Z");
planeFolder
  .add(world.plane, "width", 1, 20)
  .name("Width")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "height", 1, 20)
  .name("Height")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "widthSegments", 1, 20)
  .name("Width Segments")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "heightSegments", 1, 20)
  .name("Height Segments")
  .onChange(generatePlane);
planeFolder.open();

const lightFolder = gui.addFolder("Light");
lightFolder.add(light.position, "x", -10, 10);
lightFolder.add(light.position, "y", -10, 10);
lightFolder.add(light.position, "z", -10, 10);
lightFolder.open();

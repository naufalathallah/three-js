import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./style.css";

const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};

const mouse = {
  x: undefined,
  y: undefined,
};

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const raycaster = new THREE.Raycaster();

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create a plane
const materialPlane = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  ),
  materialPlane
);
scene.add(plane);

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
  const randomValues = [];

  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      array[i] += (Math.random() - 0.5) * 5;
      array[i + 1] += (Math.random() - 0.5) * 5;
      array[i + 2] += (Math.random() - 0.5) * 5;
    }
    randomValues.push(Math.random() * Math.PI * 2);
  }

  plane.geometry.attributes.position.randomValues = randomValues;
  plane.geometry.attributes.position.originalPosition =
    plane.geometry.attributes.position.array;
  plane.geometry.attributes.position.needsUpdate = true;
  plane.geometry.computeVertexNormals();

  // Apply colors to the new geometry
  const colors = new Float32Array(plane.geometry.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = 0;
    colors[i + 1] = 0.19;
    colors[i + 2] = 0.4;
  }
  plane.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
};

// Call generatePlane to apply initial randomization
generatePlane();

new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;

// main light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

// back light
const lightBack = new THREE.DirectionalLight(0xffffff, 1);
lightBack.position.set(0, 0, -1);
scene.add(lightBack);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

const starVerticies = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVerticies.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerticies, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);

scene.add(stars);

let frame = 0;
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;
  // plane.rotation.y += 0.1;

  const { array, originalPosition, randomValues } =
    plane.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01;
  }

  plane.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(plane);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;
    color.setXYZ(intersects[0].face.a, 0.1, 0.5, 1);
    color.setXYZ(intersects[0].face.b, 0.1, 0.5, 1);
    color.setXYZ(intersects[0].face.c, 0.1, 0.5, 1);
    color.needsUpdate = true;

    const initialColor = { r: 0, g: 0.19, b: 0.4 };
    const hoverColor = { r: 0.1, g: 0.5, b: 1 };

    gsap.to(hoverColor, {
      ...initialColor,
      onUpdate: () => {
        color.setXYZ(
          intersects[0].face.a,
          hoverColor.r,
          hoverColor.g,
          hoverColor.b
        );
        color.setXYZ(
          intersects[0].face.b,
          hoverColor.r,
          hoverColor.g,
          hoverColor.b
        );
        color.setXYZ(
          intersects[0].face.c,
          hoverColor.r,
          hoverColor.g,
          hoverColor.b
        );
      },
    });
  }
  stars.rotation.x += 0.0005;
}

animate();

// Add dat.GUI controls
const gui = new GUI();
const planeFolder = gui.addFolder("Plane");
planeFolder.add(plane.rotation, "x", 0, Math.PI * 2).name("Rotation X");
planeFolder.add(plane.rotation, "y", 0, Math.PI * 2).name("Rotation Y");
planeFolder.add(plane.rotation, "z", 0, Math.PI * 2).name("Rotation Z");
planeFolder
  .add(world.plane, "width", 1, 500)
  .name("Width")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "height", 1, 500)
  .name("Height")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "widthSegments", 1, 100)
  .name("Width Segments")
  .onChange(generatePlane);
planeFolder
  .add(world.plane, "heightSegments", 1, 100)
  .name("Height Segments")
  .onChange(generatePlane);
planeFolder.open();

const lightFolder = gui.addFolder("Light");
lightFolder.add(light.position, "x", -10, 10).name("Light X");
lightFolder.add(light.position, "y", -10, 10).name("Light Y");
lightFolder.add(light.position, "z", -10, 10).name("Light Z");
lightFolder.open();

const backLightFolder = gui.addFolder("Back Light");
backLightFolder.add(lightBack.position, "x", -10, 10).name("Back Light X");
backLightFolder.add(lightBack.position, "y", -10, 10).name("Back Light Y");
backLightFolder.add(lightBack.position, "z", -10, 10).name("Back Light Z");
backLightFolder.open();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

gsap.to("#nama", {
  opacity: 1,
  duration: 1.5,
  y: 0,
  ease: "expo",
});

gsap.to("#deskripsi", {
  opacity: 1,
  duration: 1.5,
  delay: 0.3,
  y: 0,
  ease: "expo",
});

gsap.to("#aksi", {
  opacity: 1,
  duration: 1.5,
  delay: 0.6,
  y: 0,
  ease: "expo",
});

document.querySelector("#aksi").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("ya");
  gsap.to("#container", { opacity: 0 });
  gsap.to(camera.position, { z: 25, ease: "power3.inOut", duration: 1.5 });
  gsap.to(camera.rotation, { x: 1.57, ease: "power3.inOut", duration: 1.5 });
  gsap.to(camera.position, {
    y: 1000,
    ease: "power3.in",
    duration: 1,
    delay: 1.5,
  });
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

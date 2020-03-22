const THREE = require("three");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(190, 150, 500);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById("app");
container.appendChild(renderer.domElement);

// var light = new THREE.PointLight(0xffffff, 0.8);
// camera.add(light);

var triangleShape = new THREE.Shape();
triangleShape.moveTo(80, 20);
triangleShape.lineTo(40, 80);
triangleShape.lineTo(120, 80);
triangleShape.lineTo(80, 20); // close path
var geometry = new THREE.ShapeBufferGeometry(triangleShape);
var mesh = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "red" })
);
scene.add(mesh);

var positionKF = new THREE.VectorKeyframeTrack(
  ".position",
  [0, 1, 2],
  [0, 0, 0, 90, 100, 0, 180, 0, 0],
  THREE.InterpolateSmooth
);
var clip = new THREE.AnimationClip("Action", -1, [positionKF]);
const mixer = new THREE.AnimationMixer(mesh);
const clipAction = mixer.clipAction(clip);
clipAction.loop = THREE.LoopPingPong;
clipAction.play();

const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);
  var delta = clock.getDelta();
  mixer.update(delta);
  renderer.render(scene, camera);
}
render();

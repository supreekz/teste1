import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export function initToiletScene(container: HTMLElement) {
  console.log('Initializing toilet scene in container:', container);
  
  // Ensure container has size
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.warn('Toilet container has no size, setting defaults');
    container.style.width = '400px';
    container.style.height = '400px';
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    width / height,
    0.1,
    1000
  );

  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0a, 1);
  container.appendChild(renderer.domElement);

  // Lighting
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(5, 10, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xff0033, 0.5);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Camera position
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 0, 0);

  // Load toilet model
  let toiletGroup: THREE.Group | null = null;
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  // Try loading MTL first, if fails, load OBJ without materials
  mtlLoader.load(
    './toilet1.mtl',
    (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      loadOBJ();
    },
    undefined,
    (error) => {
      console.warn('MTL file not found or error loading, loading OBJ without materials:', error);
      loadOBJ();
    }
  );

  function loadOBJ() {
    objLoader.load(
      './toilet.obj',
      (object) => {
        console.log('Toilet OBJ loaded successfully');
        toiletGroup = object;
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate scale to fit
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2 / maxDim : 1;
        
        object.position.x = -center.x * scale;
        object.position.y = -center.y * scale - 1.5; // Lower position
        object.position.z = -center.z * scale;
        object.scale.set(scale, scale, scale);
        
        scene.add(object);
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log('Loading toilet:', percentComplete + '%');
        }
      },
      (error) => {
        console.error('Error loading toilet OBJ:', error);
        // Add placeholder if loading fails
        const placeholder = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        placeholder.position.y = -1;
        scene.add(placeholder);
      }
    );
  }

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    const elapsed = clock.getElapsedTime();
    
    // Rotate toilet slowly for better view
    if (toiletGroup) {
      toiletGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.1;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (toiletGroup) {
      toiletGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  };

  return { cleanup };
}

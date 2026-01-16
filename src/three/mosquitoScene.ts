import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initMosquitoScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.01);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
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

  // Load mosquito model
  let mosquitoGroup: THREE.Group | null = null;
  const loader = new GLTFLoader();

  // Try loading GLB/GLTF format
  loader.load(
    './aedes.glb', // Try GLB first
    (gltf) => {
      console.log('Mosquito GLB loaded successfully');
      mosquitoGroup = gltf.scene;
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Calculate scale to fit
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 2 / maxDim : 1;
      
      gltf.scene.position.x = -center.x * scale;
      gltf.scene.position.y = -center.y * scale + 2;
      gltf.scene.position.z = -center.z * scale;
      gltf.scene.scale.set(scale, scale, scale);
      
      scene.add(gltf.scene);
    },
    (progress) => {
      if (progress.lengthComputable) {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log('Loading mosquito:', percentComplete + '%');
      }
    },
    (error) => {
      console.warn('GLB not found, trying GLTF:', error);
      // Try GLTF format
      loader.load(
        './aedes.gltf',
        (gltf) => {
          console.log('Mosquito GLTF loaded successfully');
          mosquitoGroup = gltf.scene;
          
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 2 / maxDim : 1;
          
          gltf.scene.position.x = -center.x * scale;
          gltf.scene.position.y = -center.y * scale + 2;
          gltf.scene.position.z = -center.z * scale;
          gltf.scene.scale.set(scale, scale, scale);
          
          scene.add(gltf.scene);
        },
        undefined,
        (error2) => {
          console.error('Error loading mosquito model:', error2);
          console.warn('Please export aedes.blend to GLB or GLTF format for Three.js to load it.');
        }
      );
    }
  );

  // Camera initial position
  camera.position.set(0, 2.5, 8);
  camera.lookAt(0, 2, 0);

  // Animation state
  let animationState: 'flying' | 'defeated' | 'finished' = 'flying';
  let defeatProgress = 0;
  let defeatTime = 0;
  const initialCameraPosition = camera.position.clone();
  const initialCameraTarget = new THREE.Vector3(0, 2, 0);
  let cameraShake = new THREE.Vector3(0, 0, 0);
  
  // Rotation state for irregular tumbling
  let rotationVelocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5
  );
  let wobblePhase = 0;

  // Particle system
  const particleSystem = createParticleSystem();
  scene.add(particleSystem);

  // Resize handler
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // Animation loop
  const clock = new THREE.Clock();
  let lastTime = 0;

  function animate() {
    requestAnimationFrame(animate);
    
    const elapsed = clock.getElapsedTime();
    const delta = elapsed - lastTime;
    lastTime = elapsed;

    if (animationState === 'flying' && mosquitoGroup) {
      // Gentle bobbing
      mosquitoGroup.position.y = 2 + Math.sin(elapsed * 2) * 0.1;
      
      // Slight drift
      mosquitoGroup.position.x = Math.sin(elapsed * 0.5) * 0.3;
      mosquitoGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.1;

      // Subtle camera dolly
      const dollyOffset = Math.sin(elapsed * 0.3) * 0.5;
      camera.position.z = initialCameraPosition.z + dollyOffset;
      camera.lookAt(mosquitoGroup.position);

    } else if (animationState === 'defeated' && mosquitoGroup) {
      defeatTime += delta;
      
      // Ease-in curve for acceleration
      defeatProgress = Math.min(1, defeatTime / 2.5);
      const easeInProgress = defeatProgress * defeatProgress * defeatProgress;
      
      // WOBBLE PHASE (0-20% of progress)
      const wobblePhaseEnd = 0.2;
      let wobbleAmount = 0;
      if (defeatProgress < wobblePhaseEnd) {
        wobblePhase += delta * 8;
        wobbleAmount = (wobblePhaseEnd - defeatProgress) / wobblePhaseEnd;
        const wobbleIntensity = wobbleAmount * 0.4;
        mosquitoGroup.position.x += Math.sin(wobblePhase * 3) * wobbleIntensity * delta;
        mosquitoGroup.position.z += Math.cos(wobblePhase * 2.5) * wobbleIntensity * delta;
      }

      // IRREGULAR ROTATION
      rotationVelocity.x += (Math.random() - 0.5) * 0.2 * delta;
      rotationVelocity.y += (Math.random() - 0.5) * 0.2 * delta;
      rotationVelocity.z += (Math.random() - 0.5) * 0.2 * delta;
      rotationVelocity.multiplyScalar(0.98);
      
      const rotationIntensity = 1 + easeInProgress * 2;
      mosquitoGroup.rotation.x += rotationVelocity.x * rotationIntensity * delta;
      mosquitoGroup.rotation.y += rotationVelocity.y * rotationIntensity * delta;
      mosquitoGroup.rotation.z += rotationVelocity.z * rotationIntensity * delta;

      // ACCELERATED FALL
      const fallStartY = 2;
      const fallEndY = -2;
      const fallDistance = fallStartY - fallEndY;
      const currentFallY = fallStartY - (fallDistance * easeInProgress);
      mosquitoGroup.position.y = currentFallY;

      // Horizontal drift
      const driftReduction = 1 - easeInProgress * 0.7;
      mosquitoGroup.position.x += Math.sin(defeatTime * 3) * 0.5 * driftReduction * delta;
      mosquitoGroup.position.z += Math.cos(defeatTime * 2.7) * 0.3 * driftReduction * delta;

      // CAMERA CINEMATOGRAPHY
      const mosquitoPos = mosquitoGroup.position;
      
      // Dolly-in before impact
      const dollyStart = 0.6;
      const dollyEnd = 0.9;
      let cameraZ = initialCameraPosition.z;
      
      if (defeatProgress >= dollyStart && defeatProgress < dollyEnd) {
        const dollyProgress = (defeatProgress - dollyStart) / (dollyEnd - dollyStart);
        const dollyAmount = dollyProgress * dollyProgress * 2;
        cameraZ = initialCameraPosition.z - dollyAmount;
      } else if (defeatProgress >= dollyEnd) {
        cameraZ = initialCameraPosition.z - 2;
      }

      // Camera shake
      const shakeIntensity = easeInProgress * 0.15;
      cameraShake.x = (Math.random() - 0.5) * shakeIntensity;
      cameraShake.y = (Math.random() - 0.5) * shakeIntensity;
      cameraShake.z = (Math.random() - 0.5) * shakeIntensity * 0.3;

      const cameraOffsetY = 1.5 - (easeInProgress * 0.5);
      
      camera.position.x = mosquitoPos.x + cameraShake.x;
      camera.position.y = mosquitoPos.y + cameraOffsetY + cameraShake.y;
      camera.position.z = cameraZ + cameraShake.z;
      
      const lookTarget = mosquitoPos.clone();
      lookTarget.y += 0.3;
      camera.lookAt(lookTarget);

      // PARTICLE EMISSION
      const particleTriggerY = 0.5;
      if (mosquitoPos.y < particleTriggerY && mosquitoPos.y > -1 && !particleSystem.visible) {
        emitParticles(particleSystem, mosquitoPos);
      }

      // SMOOTH FADE OUT
      const fadeStart = 0.75;
      let opacity = 1;
      
      if (defeatProgress > fadeStart) {
        const fadeProgress = (defeatProgress - fadeStart) / (1 - fadeStart);
        const fadeCurve = fadeProgress * fadeProgress;
        opacity = 1 - fadeCurve;
        
        mosquitoGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.Material) {
              child.material.opacity = Math.max(0, opacity);
              child.material.transparent = true;
            }
          }
        });
      }

      // Finish animation
      const userData = (particleSystem as any).userData;
      const lifetimes = userData ? userData.lifetimes : [];
      let allParticlesDead = !particleSystem.visible;
      if (lifetimes.length > 0) {
        allParticlesDead = lifetimes.every((lt: number) => lt <= 0);
      }
      
      if ((defeatProgress >= 1 && opacity < 0.05) || (mosquitoPos.y < -2 && allParticlesDead)) {
        animationState = 'finished';
        mosquitoGroup.visible = false;
        particleSystem.visible = false;
        
        const targetPos = initialCameraPosition.clone();
        camera.position.lerp(targetPos, delta * 1.5);
        camera.lookAt(initialCameraTarget);
      }
    }

    // Update particles
    updateParticles(particleSystem, delta);

    renderer.render(scene, camera);
  }

  animate();

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (mosquitoGroup) {
      mosquitoGroup.traverse((child) => {
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

  // Return API
  return {
    triggerDefeat: async (): Promise<void> => {
      if (animationState === 'flying') {
        animationState = 'defeated';
        defeatProgress = 0;
        defeatTime = 0;
        
        // Flash effect
        container.style.boxShadow = 'inset 0 0 100px rgba(255, 0, 51, 0.8)';
        setTimeout(() => {
          container.style.transition = 'box-shadow 0.5s ease';
          container.style.boxShadow = 'inset 0 0 0px rgba(255, 0, 51, 0)';
        }, 200);

        return new Promise((resolve) => {
          const checkFinished = setInterval(() => {
            if (animationState === 'finished') {
              clearInterval(checkFinished);
              resolve();
            }
          }, 100);
        });
      }
    },
    cleanup
  };
}

function createParticleSystem(): THREE.Points {
  const particleCount = 50;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    lifetimes[i] = 0;
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xff3366,
    size: 0.1,
    transparent: true,
    opacity: 0.8
  });

  const points = new THREE.Points(geometry, material);
  (points as any).userData = { velocities, lifetimes, positions };
  points.visible = false;

  return points;
}

function emitParticles(particleSystem: THREE.Points, position: THREE.Vector3) {
  const userData = (particleSystem as any).userData;
  const { velocities, lifetimes, positions } = userData;
  const geometry = particleSystem.geometry as THREE.BufferGeometry;
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < lifetimes.length; i++) {
    lifetimes[i] = 1.5;
    positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;

    const speed = 1.5 + Math.random() * 2;
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = (Math.random() - 0.3) * Math.PI;
    velocities[i * 3] = Math.cos(angle1) * Math.sin(angle2) * speed;
    velocities[i * 3 + 1] = Math.cos(angle2) * speed * 0.8;
    velocities[i * 3 + 2] = Math.sin(angle1) * Math.sin(angle2) * speed;
  }

  posAttr.needsUpdate = true;
  particleSystem.visible = true;
}

function updateParticles(particleSystem: THREE.Points, delta: number) {
  const userData = (particleSystem as any).userData;
  const { velocities, lifetimes, positions } = userData;
  const geometry = particleSystem.geometry as THREE.BufferGeometry;
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

  if (!particleSystem.visible) return;

  let allDead = true;

  for (let i = 0; i < lifetimes.length; i++) {
    if (lifetimes[i] > 0) {
      allDead = false;
      lifetimes[i] -= delta * 1.2;

      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      velocities[i * 3 + 1] -= 5 * delta;

      if (lifetimes[i] <= 0) {
        lifetimes[i] = 0;
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100;
        positions[i * 3 + 2] = 0;
      }
    }
  }

  if (allDead) {
    particleSystem.visible = false;
  }

  posAttr.needsUpdate = true;
  const material = particleSystem.material as THREE.PointsMaterial;
  
  const avgLifetime = lifetimes.reduce((a: number, b: number) => a + b, 0) / lifetimes.length;
  material.opacity = Math.max(0, avgLifetime * 0.8);
}

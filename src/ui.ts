import { initToiletScene } from './three/toiletScene';

export type AppState = 'landing' | 'main';

let currentState: AppState = 'landing';

export function initUI() {
  const landingScreen = document.getElementById('landing');
  const mainContentScreen = document.getElementById('main-content');
  const playBtn = document.getElementById('play-btn');
  const bossFightBtn = document.getElementById('boss-fight-btn');
  const messageCards = document.querySelectorAll('.message-card');
  const messageDisplay = document.getElementById('message-display');
  const bossResult = document.getElementById('boss-result');

  if (!landingScreen || !mainContentScreen || !playBtn || !bossFightBtn || !messageDisplay || !bossResult) {
    console.error('Missing required DOM elements');
    return;
  }

  // Play intro audio on landing page
  const introAudio = document.getElementById('intro-stranger-audio') as HTMLAudioElement;
  if (introAudio) {
    introAudio.volume = 0.4;
    introAudio.play().catch((e) => {
      console.log('Intro audio autoplay prevented:', e);
    });
  }

  // Play button - transition to main content
  playBtn.addEventListener('click', () => {
    // Stop intro audio when transitioning
    if (introAudio) {
      introAudio.pause();
      introAudio.currentTime = 0;
    }
    transitionToMain();
  });

  // Message cards - reveal messages on click
  const roncoAudio = document.getElementById('ronco-audio') as HTMLAudioElement;
  const interAudio = document.getElementById('inter-audio') as HTMLAudioElement;

  messageCards.forEach((card) => {
    card.addEventListener('click', () => {
      const message = card.getAttribute('data-message');
      if (message && messageDisplay) {
        showMessage(message, messageDisplay);
        
        // Play specific audio based on message content
        if (message.toLowerCase().includes('roncado') || message.toLowerCase().includes('ronco')) {
          if (roncoAudio) {
            roncoAudio.currentTime = 0;
            roncoAudio.volume = 0.6;
            roncoAudio.play().catch((e) => {
              console.log('Ronco audio play prevented:', e);
            });
          }
        } else if (message.toLowerCase().includes('internacional') || message.toLowerCase().includes('inter')) {
          if (interAudio) {
            interAudio.currentTime = 0;
            interAudio.volume = 0.6;
            interAudio.play().catch((e) => {
              console.log('Inter audio play prevented:', e);
            });
          }
        }
      }
    });
  });

  // Boss fight button - trigger mosquito animation
  const mosquitoImage = document.getElementById('mosquito-image');
  const mosquitoContainer = document.getElementById('mosquito-container');

  bossFightBtn.addEventListener('click', () => {
    if (!mosquitoImage || !mosquitoContainer) return;

    bossFightBtn.disabled = true;
    
    // Play covid audio (once, no loop)
    const covidAudio = document.getElementById('covid-audio') as HTMLAudioElement;
    if (covidAudio) {
      covidAudio.currentTime = 0;
      covidAudio.volume = 0.5;
      covidAudio.play().catch((e) => {
        console.log('Covid audio play prevented:', e);
      });
    }

    // Play impact sound (simple beep)
    playImpactSound();

    // Animate mosquito image - wobble, rotate, fall
    let animationProgress = 0;
    const animationDuration = 2500; // 2.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      animationProgress = Math.min(elapsed / animationDuration, 1);
      
      // Ease-in curve
      const easeIn = animationProgress * animationProgress * animationProgress;

      // Wobble phase (first 20%)
      let wobble = 0;
      if (animationProgress < 0.2) {
        wobble = Math.sin(animationProgress * 40) * (1 - animationProgress * 5) * 10;
      }

      // Rotation (increasing)
      const rotation = easeIn * 1080; // 3 full rotations

      // Scale down
      const scale = 1 - (easeIn * 0.7);

      // Position (fall down)
      const fallY = easeIn * 200;

      // Apply transformations
      mosquitoImage.style.transform = `
        translateX(${wobble}px) 
        translateY(${fallY}px) 
        rotate(${rotation}deg) 
        scale(${scale})
      `;
      mosquitoImage.style.opacity = String(1 - easeIn);

      if (animationProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        mosquitoImage.style.display = 'none';

        // Show result message
        if (bossResult) {
          bossResult.textContent = '1 mosquito a menos. 100 carinhos a mais.';
          bossResult.classList.add('active');
        }
      }
    };

    // Start animation
    mosquitoImage.style.transition = 'none';
    animate();
  });

  // Checkbox interactions (optional visual feedback)
  const checkboxes = document.querySelectorAll('.checkbox-input');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      // Optional: Add subtle feedback here
    });
  });

  // Bolsonaro button - play audio and animate
  const bolsonaroBtn = document.getElementById('bolsonaro-btn');
  const bolsonaroImg = document.getElementById('bolsonaro-img') as HTMLImageElement;
  const guerrinhaAudio = document.getElementById('guerrinha-audio') as HTMLAudioElement;
  
  // Array of images
  const bolsonaroImages = [
    './bolsonaro1.jpg',
    './bolsonaro2.jpeg',
    './bolsonaro3.png',
    './bolsonaro4.png',
    './bolsonaro 5.jpeg'
  ];
  
  let clickCount = 0;
  const maxClicks = bolsonaroImages.length; // Use number of images as max clicks
  let currentImageIndex = 0;

  if (bolsonaroBtn && bolsonaroImg && guerrinhaAudio) {
    bolsonaroBtn.addEventListener('click', () => {
      clickCount++;
      
      // Play audio
      guerrinhaAudio.currentTime = 0;
      guerrinhaAudio.volume = 0.6;
      guerrinhaAudio.play().catch((e) => {
        console.log('Audio play prevented:', e);
      });

      // Change image with rotation effect
      if (currentImageIndex < bolsonaroImages.length - 1) {
        // Add rotation animation (flip effect)
        bolsonaroImg.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        bolsonaroImg.style.transform = 'rotateY(90deg) scale(0.7)';
        
        setTimeout(() => {
          // Change image when halfway rotated (invisible)
          currentImageIndex++;
          bolsonaroImg.src = bolsonaroImages[currentImageIndex];
          
          // If it's the last image, show it upside down
          if (currentImageIndex === bolsonaroImages.length - 1) {
            setTimeout(() => {
              bolsonaroImg.style.transform = 'rotateY(0deg) rotate(180deg) scale(1)';
              
              // When last image appears, automatically show flush button
              const flushBtn = document.getElementById('flush-btn');
              if (flushBtn) {
                flushBtn.style.display = 'block';
                setTimeout(() => {
                  flushBtn.style.opacity = '1';
                  flushBtn.style.transform = 'scale(1)';
                }, 100);
              }
            }, 50);
          } else {
            // Continue rotation to show new image normally
            setTimeout(() => {
              bolsonaroImg.style.transform = 'rotateY(0deg) scale(1)';
            }, 50);
          }
        }, 250);
      }

      // Calculate progress (0 to 1) - when on last image, progress = 1
      let progress = currentImageIndex === bolsonaroImages.length - 1 ? 1 : (clickCount / maxClicks);
      progress = Math.min(progress, 1);
      
      // Scale down (from 1 to 0.3)
      const scale = 1 - (progress * 0.7);
      const scaleValue = Math.max(0.3, scale);
      
      // Move towards toilet (bottom center)
      // Start: top center (0% top), End: near toilet (80% top, stays centered)
      const startTop = 0; // Start at top
      const endTop = 80; // Move down to near toilet
      const currentTop = startTop + (endTop - startTop) * progress;

      // Apply transformations to button
      bolsonaroBtn.style.top = `${currentTop}%`;
      bolsonaroBtn.style.transform = `translateX(-50%) scale(${scaleValue})`;
      bolsonaroBtn.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Add shake effect on click
      bolsonaroBtn.style.animation = 'none';
      setTimeout(() => {
        bolsonaroBtn.style.animation = 'shake 0.3s ease';
      }, 10);
    });
  }

  // Flush button handler
  const flushBtn = document.getElementById('flush-btn');
  const descargaAudio = document.getElementById('descarga-audio') as HTMLAudioElement;
  const fazOLAudio = document.getElementById('faz-o-l-audio') as HTMLAudioElement;
  const toiletContainer = document.getElementById('toilet-container');
  const lulaSection = document.getElementById('lula-section');
  const lulaImg = document.getElementById('lula-img') as HTMLImageElement;

  if (flushBtn) {
    flushBtn.addEventListener('click', () => {
      if (!bolsonaroImg || !bolsonaroBtn || !descargaAudio || !fazOLAudio || !toiletContainer || !lulaSection || !lulaImg) {
        console.error('Missing elements for flush');
        return;
      }
      
      // Disable flush button
      flushBtn.style.pointerEvents = 'none';
      
      // Play flush audio and stop after 2 seconds
      descargaAudio.currentTime = 0;
      descargaAudio.volume = 0.7;
      descargaAudio.play().catch((e) => {
        console.log('Audio play prevented:', e);
      });
      
      // Stop descarga audio after 2 seconds
      setTimeout(() => {
        descargaAudio.pause();
        descargaAudio.currentTime = 0;
      }, 2000);

      // Animate flush - image spins and falls down
      bolsonaroImg.style.transition = 'transform 2s cubic-bezier(0.5, 0, 0.8, 1), opacity 2s ease';
      bolsonaroBtn.style.transition = 'transform 2s cubic-bezier(0.5, 0, 0.8, 1), opacity 2s ease';
      
      // Spinning and falling animation
      bolsonaroImg.style.transform = 'rotate(1080deg) scale(0.1) translateY(200px)';
      bolsonaroBtn.style.transform = 'translateX(-50%) rotate(1080deg) scale(0.1) translateY(200px)';
      bolsonaroImg.style.opacity = '0';
      bolsonaroBtn.style.opacity = '0';

      // After flush animation, show Lula
      setTimeout(() => {
        // Hide Bolsonaro button and toilet
        bolsonaroBtn.style.display = 'none';
        flushBtn.style.display = 'none';
        toiletContainer.style.display = 'none';

        // Show Lula
        lulaSection.style.display = 'block';
        lulaSection.style.opacity = '0';
        lulaSection.style.transform = 'scale(0.8)';
        lulaSection.style.transition = 'opacity 1s ease, transform 1s ease';

        // Play Lula audio
        fazOLAudio.currentTime = 0;
        fazOLAudio.volume = 0.6;
        fazOLAudio.play().catch((e) => {
          console.log('Audio play prevented:', e);
        });

        // Fade in Lula
        setTimeout(() => {
          lulaSection.style.opacity = '1';
          lulaSection.style.transform = 'scale(1)';
        }, 100);
      }, 2000);
    });
  } else {
    console.warn('Flush button not found');
  }
}

function transitionToMain() {
  const landingScreen = document.getElementById('landing');
  const mainContentScreen = document.getElementById('main-content');
  const audio = document.getElementById('netflix-audio') as HTMLAudioElement;

  if (!landingScreen || !mainContentScreen) return;

  // Fade out landing
  landingScreen.style.transition = 'opacity 0.6s ease';
  landingScreen.style.opacity = '0';

  setTimeout(() => {
    landingScreen.classList.remove('active');
    mainContentScreen.classList.add('active');
    currentState = 'main';

    // Play audio
    if (audio) {
      audio.volume = 0.3;
      audio.play().catch((e) => {
        console.log('Audio autoplay prevented:', e);
      });
    }

    // Trigger upside down transition effect
    mainContentScreen.classList.add('entering-upside-down');
    
    // Fade in main content with flicker effect
    mainContentScreen.style.opacity = '0';
    mainContentScreen.style.transition = 'opacity 0.3s ease';
    
    // Create flicker effect sequence
    let flickerCount = 0;
    const flickerInterval = setInterval(() => {
      flickerCount++;
      mainContentScreen.style.opacity = flickerCount % 2 === 0 ? '0.3' : '0.8';
      
      if (flickerCount >= 8) {
        clearInterval(flickerInterval);
        mainContentScreen.style.opacity = '1';
        mainContentScreen.classList.remove('entering-upside-down');
        mainContentScreen.classList.add('in-upside-down');
        
        // Trigger component flicker
        const checklistSection = mainContentScreen.querySelector('.checklist-section');
        if (checklistSection) {
          checklistSection.classList.add('flicker-active');
        }
        
        // Initialize toilet scene after transition
        setTimeout(() => {
          initToiletWhenReady();
        }, 500);
      }
    }, 150);
  }, 600);
}

// Initialize toilet 3D scene when section becomes visible
let toiletScene: ReturnType<typeof initToiletScene> | null = null;

function initToiletWhenReady() {
  const mainContentScreen = document.getElementById('main-content');
  const toiletContainer = document.getElementById('toilet-container');
  
  if (toiletContainer && !toiletScene && mainContentScreen && mainContentScreen.classList.contains('active')) {
    try {
      console.log('Initializing toilet scene in container:', toiletContainer);
      toiletScene = initToiletScene(toiletContainer);
    } catch (error) {
      console.error('Error initializing toilet scene:', error);
    }
  }
}

function showMessage(message: string, container: HTMLElement) {
  container.textContent = message;
  container.classList.add('active');

  // Scroll message into view on mobile
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function playImpactSound() {
  // Simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Silently fail if audio context is not available
    console.log('Audio not available');
  }
}

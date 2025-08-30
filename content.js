// YouTube Playback Speed Manager Content Script
class YouTubeSpeedController {
  constructor() {
    this.currentVideo = null;
    this.observer = null;
    this.speedCheckInterval = null;
    this.lastAppliedSpeed = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    // console.log('YouTube Speed Controller initializing...');

    // Load saved speed and settings
    await this.loadSavedSpeed();

    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    // Setup message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Wait for YouTube to load and find video element
    this.waitForYouTube();
  }

  async loadSavedSpeed() {
    try {
      const result = await chrome.storage.local.get(['currentSpeed', 'speedSettings']);

      if (result.speedSettings && result.speedSettings.persistSpeed && result.currentSpeed) {
        this.savedSpeed = parseFloat(result.currentSpeed);
        // console.log('Loaded saved speed:', this.savedSpeed);
      }
    } catch (error) {
      // console.log('Could not load saved speed:', error);
    }
  }

  waitForYouTube() {
    // console.log('Waiting for YouTube video...');

    // Check if we're on a YouTube page
    if (!window.location.href.includes('youtube.com')) {
      // console.log('Not on YouTube page');
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // Try for 30 seconds

    const checkForVideo = () => {
      attempts++;
      // console.log(`Attempt ${attempts}/${maxAttempts} to find video`);

      const video = this.findVideoElement();

      if (video) {
        // console.log('Video found!', video);
        this.setupVideoController(video);
      } else if (attempts < maxAttempts) {
        // If video not found, keep checking
        setTimeout(checkForVideo, 1000);
      } else {
        // console.warn('Could not find video after', maxAttempts, 'attempts');
        // Try one more time with a longer delay
        setTimeout(() => {
          const lastAttemptVideo = this.findVideoElement();
          if (lastAttemptVideo) {
            this.setupVideoController(lastAttemptVideo);
          }
        }, 5000);
      }
    };

    // Start checking immediately
    checkForVideo();

    // Also setup observer for navigation changes
    this.setupNavigationObserver();
  }

  findVideoElement() {
    // Try multiple selectors to find the video element
    const selectors = [
      'video.html5-main-video',
      '#movie_player video',
      '.html5-video-container video',
      'video[src*="youtube"]',
      'video[src*="googlevideo"]',
      'video',
    ];

    for (const selector of selectors) {
      const videos = document.querySelectorAll(selector);
      for (const video of videos) {
        // More thorough checking
        if (
          video &&
          video.readyState >= 2 && // HAVE_CURRENT_DATA
          (video.duration > 0 || video.currentTime > 0)
        ) {
          // console.log('Found video with selector:', selector);
          return video;
        }
      }
    }

    // Fallback - try any video element that seems to be the main one
    const allVideos = document.querySelectorAll('video');
    for (const video of allVideos) {
      if (video.offsetWidth > 200 && video.offsetHeight > 200) {
        // Likely the main video
        // console.log('Found video by size fallback');
        return video;
      }
    }

    return null;
  }

  setupVideoController(video) {
    if (this.currentVideo === video) {
      // console.log('Video controller already setup for this video');
      return; // Already setup
    }

    // console.log('Setting up video controller for:', video);
    // console.log('Video properties:', {
    //   duration: video.duration,
    //   currentTime: video.currentTime,
    //   readyState: video.readyState,
    //   playbackRate: video.playbackRate,
    // });

    this.currentVideo = video;
    this.isInitialized = true;

    // Apply saved speed if available - with multiple attempts
    if (this.savedSpeed) {
      // console.log('Applying saved speed:', this.savedSpeed);

      // Try immediately
      this.setVideoSpeed(this.savedSpeed);

      // Try again after a short delay
      setTimeout(() => {
        this.setVideoSpeed(this.savedSpeed);
      }, 1000);

      // And once more after video starts playing
      setTimeout(() => {
        this.setVideoSpeed(this.savedSpeed);
      }, 3000);
    }

    // Setup event listeners
    this.setupVideoListeners(video);

    // Start monitoring speed changes
    this.startSpeedMonitoring();
  }

  setupVideoListeners(video) {
    // Listen for video load events
    video.addEventListener('loadedmetadata', () => {
      // console.log('Video metadata loaded');
      if (this.savedSpeed) {
        setTimeout(() => this.setVideoSpeed(this.savedSpeed), 500);
      }
    });

    video.addEventListener('loadeddata', () => {
      // console.log('Video data loaded');
      if (this.savedSpeed) {
        setTimeout(() => this.setVideoSpeed(this.savedSpeed), 200);
      }
    });

    video.addEventListener('canplay', () => {
      // console.log('Video can start playing');
      if (this.savedSpeed) {
        setTimeout(() => this.setVideoSpeed(this.savedSpeed), 100);
      }
    });

    video.addEventListener('play', () => {
      // console.log('Video started playing');
      if (this.savedSpeed && Math.abs(video.playbackRate - this.savedSpeed) > 0.01) {
        // console.log('Reapplying saved speed on play:', this.savedSpeed);
        this.setVideoSpeed(this.savedSpeed);
      }
    });

    video.addEventListener('playing', () => {
      // console.log('Video is playing');
      if (this.savedSpeed && Math.abs(video.playbackRate - this.savedSpeed) > 0.01) {
        // console.log('Reapplying saved speed while playing:', this.savedSpeed);
        setTimeout(() => {
          video.playbackRate = this.savedSpeed;
        }, 100);
      }
    });

    video.addEventListener('loadstart', () => {
      // console.log('Video load started');
      if (this.savedSpeed) {
        setTimeout(() => this.setVideoSpeed(this.savedSpeed), 1000);
      }
    });

    // Listen for rate changes (in case YouTube overrides our speed)
    video.addEventListener('ratechange', () => {
      // console.log('Rate changed to:', video.playbackRate);
      if (this.lastAppliedSpeed && Math.abs(video.playbackRate - this.lastAppliedSpeed) > 0.01) {
        // console.log('YouTube may have reset our speed, reapplying...');
        setTimeout(() => {
          if (this.lastAppliedSpeed) {
            video.playbackRate = this.lastAppliedSpeed;
          }
        }, 100);
      }
    });
  }

  setupNavigationObserver() {
    // Observe for YouTube navigation changes
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;

      mutations.forEach((mutation) => {
        // Check if new video elements were added
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'VIDEO' || node.querySelector('video')) {
                shouldRecheck = true;
              }
            }
          });
        }
      });

      if (shouldRecheck) {
        setTimeout(() => {
          const newVideo = this.findVideoElement();
          if (newVideo && newVideo !== this.currentVideo) {
            this.setupVideoController(newVideo);
          }
        }, 1000);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  startSpeedMonitoring() {
    if (this.speedCheckInterval) {
      clearInterval(this.speedCheckInterval);
    }

    this.speedCheckInterval = setInterval(() => {
      if (this.currentVideo) {
        // Check if we have a saved speed that should be applied
        if (this.savedSpeed && Math.abs(this.currentVideo.playbackRate - this.savedSpeed) > 0.01) {
          // console.log('Speed monitoring: Reapplying saved speed', this.savedSpeed);
          this.currentVideo.playbackRate = this.savedSpeed;
          this.lastAppliedSpeed = this.savedSpeed;
        }

        // Also check if YouTube has reset our custom speed
        if (
          this.lastAppliedSpeed &&
          Math.abs(this.currentVideo.playbackRate - this.lastAppliedSpeed) > 0.01
        ) {
          // console.log('YouTube reset speed, reapplying:', this.lastAppliedSpeed);
          this.setVideoSpeed(this.lastAppliedSpeed, false);
        }
      }
    }, 1000); // Check every second instead of 2 seconds
  }

  async setVideoSpeed(speed, saveSpeed = true) {
    // console.log('Attempting to set video speed to:', speed);

    if (!this.currentVideo) {
      // Try to find video again
      this.currentVideo = this.findVideoElement();
      if (!this.currentVideo) {
        // console.log('Video element not ready yet, will try again later');
        return false;
      }
    }

    try {
      // Validate speed
      const numSpeed = parseFloat(speed);
      if (isNaN(numSpeed) || numSpeed < 0.1 || numSpeed > 10) {
        // console.log('Invalid speed value:', speed);
        return false;
      }

      // console.log('Setting video speed to:', numSpeed);
      // console.log('Current video element:', this.currentVideo);
      // console.log('Video ready state:', this.currentVideo.readyState);
      // console.log('Video duration:', this.currentVideo.duration);

      // Wait for video to be ready if needed
      if (this.currentVideo.readyState < 2) {
        // console.log('Video not ready, waiting...');
        await new Promise((resolve) => {
          const checkReady = () => {
            if (this.currentVideo.readyState >= 2) {
              // console.log('Video now ready, applying speed');
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      // Set the playback rate directly
      this.currentVideo.playbackRate = numSpeed;
      this.lastAppliedSpeed = numSpeed;

      // console.log('Speed applied! Current playback rate:', this.currentVideo.playbackRate);

      // Verify the speed was actually set
      setTimeout(() => {
        if (Math.abs(this.currentVideo.playbackRate - numSpeed) > 0.01) {
          // console.warn('Speed may not have been applied correctly. Retrying...');
          this.currentVideo.playbackRate = numSpeed;
        } else {
          // console.log('Speed successfully verified:', this.currentVideo.playbackRate);
        }
      }, 500);

      // Save speed if requested
      if (saveSpeed) {
        await this.saveCurrentSpeed(numSpeed);
        this.savedSpeed = numSpeed;
      }

      return true;
    } catch (error) {
      // console.log('Could not set video speed:', error);
      return false;
    }
  }
  updateYouTubeSpeedSetting(speed) {
    try {
      // Try to find and update YouTube's speed menu
      const speedButton = document.querySelector('.ytp-settings-button');
      if (speedButton) {
        // This is a best-effort attempt to sync with YouTube's UI
        // The actual implementation may vary based on YouTube's current structure
        // console.log('Attempting to sync with YouTube speed menu');
      }
    } catch (error) {
      // Silently ignore errors here as this is just for UI sync
      // console.log('Could not sync with YouTube speed menu:', error);
    }
  }

  getCurrentSpeed() {
    if (!this.currentVideo) {
      return null;
    }
    return this.currentVideo.playbackRate;
  }

  async saveCurrentSpeed(speed) {
    try {
      await chrome.storage.local.set({ currentSpeed: speed });
    } catch (error) {
      // console.log('Could not save current speed:', error);
    }
  }

  handleMessage(message, sender, sendResponse) {
    // console.log('Received message:', message);

    switch (message.action) {
      case 'setSpeed':
        // console.log('Message: Setting speed to', message.speed);

        // Ensure we always handle the result as a Promise
        Promise.resolve(this.setVideoSpeed(message.speed))
          .then((success) => {
            // console.log('Speed set result:', success);
            sendResponse({ success });
          })
          .catch((error) => {
            // console.log('Could not set speed:', error);
            sendResponse({ success: false, error: error.message });
          });

        return true; // Keep message channel open for async response

      case 'getCurrentSpeed':
        const currentSpeed = this.getCurrentSpeed();
        sendResponse({ speed: currentSpeed });
        break;

      case 'isInitialized':
        // console.log('Message: Initialization status requested, returning:', this.isInitialized);
        sendResponse({ initialized: this.isInitialized });
        break;

      case 'forceRefresh':
        // console.log('Message: Force refresh requested');
        this.currentVideo = null;
        this.isInitialized = false;
        this.waitForYouTube();
        sendResponse({ success: true });
        break;

      case 'debugInfo':
        const debugInfo = {
          currentVideo: !!this.currentVideo,
          isInitialized: this.isInitialized,
          savedSpeed: this.savedSpeed,
          lastAppliedSpeed: this.lastAppliedSpeed,
          currentUrl: window.location.href,
          videoElements: document.querySelectorAll('video').length,
        };
        // console.log('Message: Debug info requested:', debugInfo);
        sendResponse(debugInfo);
        break;

      default:
        // console.warn('Unknown message action:', message.action);
    }
  }
}

// Initialize the controller
const speedController = new YouTubeSpeedController();

// Handle page navigation (for single-page app behavior of YouTube)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // console.log('Page navigation detected, reinitializing...');
    setTimeout(() => {
      speedController.waitForYouTube();
    }, 2000);
  }
}).observe(document, { subtree: true, childList: true });

// Also handle browser back/forward navigation
window.addEventListener('popstate', () => {
  // console.log('Popstate detected, reinitializing...');
  setTimeout(() => {
    speedController.waitForYouTube();
  }, 2000);
});

// console.log('YouTube Speed Controller content script loaded');

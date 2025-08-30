class YouTubeSpeedManager {
  constructor() {
    this.currentSpeed = 1.0;
    this.settings = {
      autoApply: true,
      persistSpeed: true,
    };
    this.isInputFocused = false; // Track if user is typing in input
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadCurrentSpeed();
    this.setupEventListeners();
    this.updateUI();

    // Apply saved speed if auto-apply is enabled
    if (this.settings.autoApply) {
      this.applySpeedToCurrentTab();
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['speedSettings', 'currentSpeed']);

      if (result.speedSettings) {
        this.settings = { ...this.settings, ...result.speedSettings };
      }

      if (result.currentSpeed && this.settings.persistSpeed) {
        this.currentSpeed = parseFloat(result.currentSpeed);
      }
    } catch (error) {
      // console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        speedSettings: this.settings,
        currentSpeed: this.currentSpeed,
      });
    } catch (error) {
      // console.error('Error saving settings:', error);
    }
  }

  async loadCurrentSpeed() {
    try {
      // Get current speed from active YouTube tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'getCurrentSpeed' }, (response) => {
          if (chrome.runtime.lastError) {
            // Completely ignore communication errors for periodic updates
            return;
          }
          if (response && response.speed) {
            this.currentSpeed = parseFloat(response.speed);
            this.updateUI();
          }
        });
      }
    } catch (error) {
      // Silently ignore errors during periodic speed checking
    }
  }

  setupEventListeners() {
    // Apply speed button
    document.getElementById('applySpeed').addEventListener('click', () => {
      const speedInput = document.getElementById('speedInput');
      const speed = parseFloat(speedInput.value);

      if (this.isValidSpeed(speed)) {
        this.setSpeed(speed);
      } else {
        this.showError('Please enter a valid speed between 0.1x and 10x');
      }
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        this.setSpeed(speed);
      });
    });

    // Settings checkboxes
    document.getElementById('autoApply').addEventListener('change', (e) => {
      this.settings.autoApply = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('persistSpeed').addEventListener('change', (e) => {
      this.settings.persistSpeed = e.target.checked;
      this.saveSettings();
    });

    // Reset button
    document.getElementById('resetSpeed').addEventListener('click', () => {
      this.setSpeed(1.0);
    });

    // Speed input enter key
    document.getElementById('speedInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('applySpeed').click();
      }
    });

    // Track when user is typing in input field
    document.getElementById('speedInput').addEventListener('focus', () => {
      this.isInputFocused = true;
    });

    document.getElementById('speedInput').addEventListener('blur', () => {
      this.isInputFocused = false;
    });

    // Update current speed periodically
    setInterval(() => {
      this.loadCurrentSpeed();
    }, 2000);
  }

  async setSpeed(speed) {
    if (!this.isValidSpeed(speed)) return;

    this.currentSpeed = speed;

    // Save settings if persist is enabled
    if (this.settings.persistSpeed) {
      await this.saveSettings();
    }

    // Apply to current tab
    this.applySpeedToCurrentTab();
    this.updateUI();
    this.showSuccess(`Speed set to ${speed}x`);
  }

  async applySpeedToCurrentTab() {
    try {
      // console.log('Attempting to apply speed:', this.currentSpeed);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      // console.log('Current tab:', tab);

      if (tab && tab.url && tab.url.includes('youtube.com')) {
        // console.log('Sending message to YouTube tab');

        // Send speed message with better error handling
        chrome.tabs.sendMessage(
          tab.id,
          {
            action: 'setSpeed',
            speed: this.currentSpeed,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              // Silently handle communication issues - they're usually harmless timing issues
              const error = chrome.runtime.lastError.message;
              if (
                error.includes('Could not establish connection') ||
                error.includes('receiving end does not exist') ||
                error.includes('message port closed before a response')
              ) {
                // These are normal timing issues, completely ignore them
                return;
              }
              // Log other unexpected errors only to console, not as extension errors
              // console.debug('Speed message issue:', error);
              return;
            }

            // console.log('Speed response:', response);
            if (response && !response.success) {
              this.showError('Speed could not be applied to video.');
            } else {
              // console.log('Speed applied successfully');
            }
          }
        );
      } else {
        // console.log('Not on YouTube page');
        this.showError('Please navigate to a YouTube video page first.');
      }
    } catch (error) {
      // console.error('Error applying speed to tab:', error);
      this.showError("Failed to apply speed. Make sure you're on a YouTube page.");
    }
  }

  updateUI() {
    // Update current speed display
    document.getElementById('currentSpeed').textContent = `${this.currentSpeed}x`;

    // Only update speed input if user is not currently typing in it
    if (!this.isInputFocused) {
      document.getElementById('speedInput').value = this.currentSpeed;
    }

    // Update preset button states
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      if (parseFloat(btn.dataset.speed) === this.currentSpeed) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update settings checkboxes
    document.getElementById('autoApply').checked = this.settings.autoApply;
    document.getElementById('persistSpeed').checked = this.settings.persistSpeed;
  }

  isValidSpeed(speed) {
    return !isNaN(speed) && speed >= 0.1 && speed <= 10;
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: '1000',
      backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
      color: type === 'success' ? '#155724' : '#721c24',
      border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    });

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new YouTubeSpeedManager();
});

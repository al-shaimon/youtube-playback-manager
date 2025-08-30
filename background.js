// Background script for YouTube Playback Speed Manager
// console.log('YouTube Speed Manager background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  // console.log('Extension installed:', details);

  // Set default settings
  chrome.storage.local.set({
    speedSettings: {
      autoApply: true,
      persistSpeed: true,
    },
    currentSpeed: 1.0,
  });
});

// Handle tab updates to apply saved speed on YouTube pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    // console.log('YouTube tab updated:', tab.url);

    try {
      // Get saved settings
      const result = await chrome.storage.local.get(['speedSettings', 'currentSpeed']);

      if (result.speedSettings && result.speedSettings.autoApply && result.currentSpeed) {
        // console.log('Auto-applying saved speed:', result.currentSpeed);

        // Try multiple times with different delays to ensure it works
        const applySpeed = () => {
          chrome.tabs.sendMessage(
            tabId,
            {
              action: 'setSpeed',
              speed: parseFloat(result.currentSpeed),
            },
            (response) => {
              if (chrome.runtime.lastError) {
                // console.log('Could not send message to tab:', chrome.runtime.lastError.message);
              } else {
                // console.log('Speed applied to tab:', response);
              }
            }
          );
        };

        // Try at different intervals
        setTimeout(applySpeed, 2000); // 2 seconds
        setTimeout(applySpeed, 4000); // 4 seconds
        setTimeout(applySpeed, 6000); // 6 seconds
      }
    } catch (error) {
      // console.error('Error in tab update handler:', error);
    }
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log('Background received message:', message);

  switch (message.action) {
    case 'getActiveTab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true;

    case 'applySpeedToAllYouTubeTabs':
      applySpeedToAllYouTubeTabs(message.speed);
      sendResponse({ success: true });
      break;

    default:
      // console.warn('Unknown message action in background:', message.action);
  }
});

// Function to apply speed to all YouTube tabs
async function applySpeedToAllYouTubeTabs(speed) {
  try {
    const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });

    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'setSpeed',
          speed: speed,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            // console.log('Could not apply speed to tab:', tab.id, chrome.runtime.lastError.message);
          } else {
            // console.log('Speed applied to tab:', tab.id, response);
          }
        }
      );
    });
  } catch (error) {
    // console.error('Error applying speed to all YouTube tabs:', error);
  }
}

// Handle browser startup - restore speeds to any open YouTube tabs
chrome.runtime.onStartup.addListener(async () => {
  // console.log('Browser startup detected');

  try {
    const result = await chrome.storage.local.get(['speedSettings', 'currentSpeed']);

    if (result.speedSettings && result.speedSettings.autoApply && result.currentSpeed) {
      // Wait a bit for tabs to load
      setTimeout(() => {
        applySpeedToAllYouTubeTabs(parseFloat(result.currentSpeed));
      }, 5000);
    }
  } catch (error) {
    // console.error('Error in startup handler:', error);
  }
});

// Cleanup function
function cleanup() {
  // console.log('Background script cleanup');
}

// Handle extension suspension
chrome.runtime.onSuspend.addListener(cleanup);

document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  
  // Load saved API key
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  // Save API key when entered
  apiKeyInput.addEventListener('input', function(e) {
    const apiKey = e.target.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ apiKey: apiKey }, function() {
        // Visual feedback that the key was saved
        apiKeyInput.style.borderColor = '#4CAF50';
        setTimeout(() => {
          apiKeyInput.style.borderColor = '#e9ecef';
        }, 1000);
      });
    }
  });

  // Helper function to check if content script is already injected
  async function isContentScriptInjected(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      return response && response.status === 'pong';
    } catch (error) {
      return false;
    }
  }

  // Helper function to check if API key is set
  async function checkApiKey() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey'], function(result) {
        if (!result.apiKey) {
          alert('Please enter your OpenAI API key first');
          apiKeyInput.focus();
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  // Helper function to send message to active tab
  async function sendMessageToActiveTab(message) {
    try {
      // Check API key first
      const hasApiKey = await checkApiKey();
      if (!hasApiKey) return;

      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (!tab) {
        throw new Error('No active tab found');
      }

      // Only inject if not already injected
      const isInjected = await isContentScriptInjected(tab.id);
      if (!isInjected) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      }

      // Send message after ensuring content script is loaded
      const response = await chrome.tabs.sendMessage(tab.id, message);
      console.log('Message sent successfully:', response);
    } catch (error) {
      console.error('Error:', error);
      alert('Please refresh the page and try again.');
    }
  }

  // Enhance text button
  document.getElementById('enhanceText').addEventListener('click', async function() {
    sendMessageToActiveTab({ action: 'enhance' });
  });

  // Add humor button
  document.getElementById('addJoke').addEventListener('click', async function() {
    sendMessageToActiveTab({ action: 'addJoke' });
  });

  // Check grammar button
  document.getElementById('checkGrammar').addEventListener('click', async function() {
    sendMessageToActiveTab({ action: 'checkGrammar' });
  });
});

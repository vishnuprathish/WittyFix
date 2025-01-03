document.addEventListener('DOMContentLoaded', function() {
  // Load saved API key
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
  });

  // Save API key when entered
  document.getElementById('apiKey').addEventListener('change', function(e) {
    chrome.storage.sync.set({ apiKey: e.target.value });
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

  // Helper function to send message to active tab
  async function sendMessageToActiveTab(message) {
    try {
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
    await sendMessageToActiveTab({action: 'enhance'});
  });

  // Add joke button
  document.getElementById('addJoke').addEventListener('click', async function() {
    await sendMessageToActiveTab({action: 'addJoke'});
  });

  // Check grammar button
  document.getElementById('checkGrammar').addEventListener('click', async function() {
    await sendMessageToActiveTab({action: 'checkGrammar'});
  });
});

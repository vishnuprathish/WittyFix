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

  // Enhance text button
  document.getElementById('enhanceText').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'enhance'});
    });
  });

  // Add joke button
  document.getElementById('addJoke').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'addJoke'});
    });
  });
});

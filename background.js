chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "enhanceText",
    title: "Enhance Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "addJoke",
    title: "Add Humor",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "enhanceText") {
    chrome.tabs.sendMessage(tab.id, {action: "enhance"});
  } else if (info.menuItemId === "addJoke") {
    chrome.tabs.sendMessage(tab.id, {action: "addJoke"});
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  switch (command) {
    case 'enhance-text':
      chrome.tabs.sendMessage(tab.id, {action: "enhance"});
      break;
    case 'add-humor':
      chrome.tabs.sendMessage(tab.id, {action: "addJoke"});
      break;
  }
});

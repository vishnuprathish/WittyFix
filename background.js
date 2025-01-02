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

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "enhanceText") {
    chrome.tabs.sendMessage(tab.id, {action: "enhance"});
  } else if (info.menuItemId === "addJoke") {
    chrome.tabs.sendMessage(tab.id, {action: "addJoke"});
  }
});

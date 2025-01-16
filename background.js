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

  chrome.contextMenus.create({
    id: "checkGrammar",
    title: "Check Grammar",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "enhanceText") {
    chrome.tabs.sendMessage(tab.id, {action: "enhance"});
  } else if (info.menuItemId === "addJoke") {
    chrome.tabs.sendMessage(tab.id, {action: "addJoke"});
  } else if (info.menuItemId === "checkGrammar") {
    chrome.tabs.sendMessage(tab.id, {action: "checkGrammar"});
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
    case 'check-grammar':
      chrome.tabs.sendMessage(tab.id, {action: "checkGrammar"});
      break;
  }
});

// Define queries for different enhancement types
const QUERIES = {
  enhance: (text) => ({
    messages: [{
      role: "system",
      content: `You are a professional writing enhancement AI with expertise in clear, concise, and engaging communication.

TASK:
- Enhance the given text while preserving its core message and length
- Maintain the original tone and context
- Improve clarity, impact, and readability

CONSTRAINTS:
- Keep the same approximate length
- Preserve key terminology and technical terms
- Maintain the original format (paragraphs, lists, etc.)
- Do not add new sections or headings
- Ensure the enhanced text flows naturally`
    }, {
      role: "user",
      content: `Please enhance this text following the above guidelines: "${text}"`
    }],
    temperature: 0.7,
    max_tokens: 2000
  }),

  addHumor: (text) => ({
    messages: [{
      role: "system",
      content: `You are a sophisticated AI with expertise in adding contextually appropriate humor to professional writing.

TASK:
- Add subtle, contextually relevant humor to the text
- Maintain the text's professional tone and credibility
- Ensure humor enhances rather than distracts from the message`
    }, {
      role: "user",
      content: `Please add appropriate humor to this text: "${text}"`
    }],
    temperature: 0.8,
    max_tokens: 2000
  }),

  checkGrammar: (text) => ({
    messages: [{
      role: "system",
      content: "You are a professional editor focusing on grammar, spelling, and style improvements."
    }, {
      role: "user",
      content: `Please check and correct any grammar or spelling issues in this text: "${text}"`
    }],
    temperature: 0.3,
    max_tokens: 2000
  })
};

// Function to make API calls to OpenAI
async function makeGPTRequest(queryType, text, apiKey) {
  const query = QUERIES[queryType](text);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      ...query
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['apiKey'], function(result) {
      sendResponse({ apiKey: result.apiKey });
    });
    return true;
  }
  
  if (request.action === 'processText') {
    (async () => {
      try {
        // Get API key from storage
        const result = await chrome.storage.sync.get(['apiKey']);
        const apiKey = result.apiKey;
        
        if (!apiKey) {
          sendResponse({ error: 'Please set your API key in the extension options' });
          return;
        }

        const enhancedText = await makeGPTRequest(
          request.queryType,
          request.text,
          apiKey
        );
        
        sendResponse({ success: true, enhancedText });
      } catch (error) {
        console.error('Error processing text:', error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  }
});

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
- Provide THREE different enhanced versions of the given text
- Each version should have a slightly different style/approach while maintaining the core message
- Number the versions 1, 2, and 3
- Keep each version separated by a ||| delimiter

CONSTRAINTS:
- Keep each version similar in length to the original
- Preserve key terminology and technical terms
- Maintain the original format (paragraphs, lists, etc.)
- Ensure each version flows naturally

OUTPUT FORMAT:
1. [First enhanced version]
|||
2. [Second enhanced version]
|||
3. [Third enhanced version]`
    }, {
      role: "user",
      content: `Please provide three enhanced versions of this text: "${text}"`
    }],
    temperature: 0.7,
    max_tokens: 2000
  }),

  addHumor: (text) => ({
    messages: [{
      role: "system",
      content: `You are a sophisticated AI with expertise in adding contextually appropriate humor to professional writing.

TASK:
- Provide THREE different humorous versions of the given text
- Each version should have a different style of humor while maintaining professionalism
- Version 1: Subtle and witty
- Version 2: More playful and casual
- Version 3: Clever wordplay and puns
- Number the versions 1, 2, and 3
- Keep each version separated by a ||| delimiter

CONSTRAINTS:
- Keep humor workplace-appropriate
- Maintain the text's core message
- Ensure humor enhances rather than overshadows the content

OUTPUT FORMAT:
1. [Subtle, witty version]
|||
2. [Playful, casual version]
|||
3. [Clever wordplay version]`
    }, {
      role: "user",
      content: `Please provide three humorous versions of this text: "${text}"`
    }],
    temperature: 0.8,
    max_tokens: 2000
  }),

  checkGrammar: (text) => ({
    messages: [{
      role: "system",
      content: `You are a professional editor focusing on grammar, spelling, and style improvements.

TASK:
- Provide THREE different corrected versions of the text
- Version 1: Basic grammar and spelling corrections only
- Version 2: Improved clarity and conciseness
- Version 3: Enhanced formal/professional style
- Number the versions 1, 2, and 3
- Keep each version separated by a ||| delimiter
- Return ONLY the corrected versions without any explanations

EXAMPLE INPUT: "i dont know weather it will rain today"
EXAMPLE OUTPUT:
1. I don't know whether it will rain today
|||
2. I'm unsure whether it will rain today
|||
3. I am uncertain about today's rainfall probability

CONSTRAINTS:
- Preserve the original meaning
- Only make necessary corrections in Version 1
- Gradually increase refinement in Versions 2 and 3
- No explanatory text or meta-commentary`
    }, {
      role: "user",
      content: `${text}`
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
  const suggestions = data.choices[0].message.content.trim().split('|||').map(s => s.trim());
  return suggestions;
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

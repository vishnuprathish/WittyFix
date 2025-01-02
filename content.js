async function getSelectedText() {
  return window.getSelection().toString().trim();
}

async function callOpenAI(prompt, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

async function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  const selectedText = await getSelectedText();
  if (!selectedText) {
    alert('Please select some text first!');
    return;
  }

  chrome.storage.sync.get(['apiKey'], async function(result) {
    if (!result.apiKey) {
      alert('Please enter your OpenAI API key in the extension popup!');
      return;
    }

    let prompt;
    if (request.action === 'enhance') {
      prompt = `Improve the following text while maintaining its original meaning and length: "${selectedText}"`;
    } else if (request.action === 'addJoke') {
      prompt = `Add a short, contextually relevant joke to the following text while maintaining its professional tone: "${selectedText}"`;
    }

    const response = await callOpenAI(prompt, result.apiKey);
    if (response) {
      await replaceSelectedText(response);
    } else {
      alert('Failed to process the text. Please try again.');
    }
  });
});

import { makeGPTRequest } from './queries.js';

// Function to get selected text
function getSelectedText() {
    return window.getSelection().toString().trim();
}

// Function to replace selected text
function replaceSelectedText(newText) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
    }
}

// Process the text based on action type
async function processText(action) {
    const selectedText = getSelectedText();
    if (!selectedText) {
        alert('Please select some text first!');
        return;
    }

    try {
        // Get API key from storage
        const { apiKey } = await chrome.storage.sync.get(['apiKey']);
        if (!apiKey) {
            alert('Please set your OpenAI API key in the extension settings.');
            return;
        }

        // Show loading state
        const originalText = selectedText;
        replaceSelectedText('Processing...');

        // Make the API request
        const queryType = action === 'enhance' ? 'enhance' : 'addHumor';
        const enhancedText = await makeGPTRequest(queryType, originalText, apiKey);
        
        // Replace the text with the enhanced version
        replaceSelectedText(enhancedText);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        replaceSelectedText(selectedText);
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'enhance' || request.action === 'addJoke') {
        processText(request.action);
    }
});

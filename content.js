// Only declare QUERIES if it hasn't been declared yet
if (typeof QUERIES === 'undefined') {
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
- Ensure the enhanced text flows naturally

APPROACH:
1. Analyze the text's purpose and audience
2. Identify areas for improvement
3. Apply enhancements while maintaining authenticity
4. Review for clarity and impact

OUTPUT STYLE:
- Professional and polished
- Clear and direct
- Engaging but not overly casual
- Appropriate for business/academic context`
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
- Ensure humor enhances rather than distracts from the message

CONSTRAINTS:
- Keep humor workplace-appropriate
- Avoid sarcasm or potentially offensive content
- Don't use puns unless they're highly relevant
- Maintain the text's professional credibility
- Don't add more than one or two humor elements

HUMOR GUIDELINES:
- Use gentle wit rather than obvious jokes
- Prefer situational humor over forced jokes
- Keep cultural references universal
- Ensure humor relates to the subject matter
- Use subtle wordplay when appropriate

APPROACH:
1. Analyze the text's context and tone
2. Identify natural opportunities for humor
3. Insert subtle wit while maintaining professionalism
4. Review for appropriateness and impact

OUTPUT STYLE:
- Professionally witty
- Subtly humorous
- Context-appropriate
- Natural and unforced`
            }, {
                role: "user",
                content: `Please add appropriate humor to this text following the above guidelines: "${text}"`
            }],
            temperature: 0.8,
            max_tokens: 2000
        }),

        checkGrammar: (text) => ({
            messages: [{
                role: "system",
                content: `You are a professional proofreader with expertise in grammar, spelling, and punctuation.

TASK:
- Check and correct spelling errors
- Fix grammatical mistakes
- Improve punctuation
- Ensure proper capitalization
- Maintain the text's original meaning and style

CONSTRAINTS:
- Only fix actual errors, not style preferences
- Preserve technical terms and proper nouns
- Keep the original formatting
- Don't change the author's voice or tone
- Maintain original paragraph structure

APPROACH:
1. Check for spelling errors
2. Review grammar rules application
3. Verify punctuation usage
4. Ensure proper capitalization
5. Validate sentence structure

OUTPUT STYLE:
- Return corrected text only
- Maintain original formatting
- Preserve author's voice
- Keep original paragraph breaks`
            }, {
                role: "user",
                content: `Please check and correct any spelling, grammar, or punctuation errors in this text: "${text}"`
            }],
            temperature: 0.3,
            max_tokens: 2000
        })
    };

    // Function to make API calls to OpenAI
    async function makeGPTRequest(queryType, text, apiKey) {
        const query = QUERIES[queryType](text);
        
        try {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

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
            const queryType = action === 'enhance' ? 'enhance' : 
                            action === 'addJoke' ? 'addHumor' : 
                            'checkGrammar';
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
        if (request.action === 'ping') {
            sendResponse({status: 'pong'});
            return true;
        }
        
        if (request.action === 'enhance' || request.action === 'addJoke' || request.action === 'checkGrammar') {
            processText(request.action);
            // Send response to confirm receipt
            sendResponse({status: 'processing'});
        }
        // Return true to indicate we'll send a response asynchronously
        return true;
    });
}

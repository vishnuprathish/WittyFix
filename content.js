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

    // Function to get selected text
    function getSelectedText() {
        return window.getSelection().toString().trim();
    }

    // Function to replace selected text
    function replaceSelectedText(newText) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedElement = range.startContainer.parentElement;

        // Special handling for Gmail compose
        const isGmail = window.location.hostname === 'mail.google.com';
        if (isGmail && selectedElement.closest('.Am.Al.editable')) {
            // Gmail compose editor
            const editor = selectedElement.closest('.Am.Al.editable');
            
            // Create a temporary element to sanitize the text
            const tempDiv = document.createElement('div');
            tempDiv.textContent = newText;
            
            // Replace the text
            document.execCommand('insertText', false, tempDiv.textContent);
            return;
        }
        
        // Handle different types of editable elements
        if (selectedElement.closest('input, textarea')) {
            // Handle input/textarea elements
            const input = selectedElement.closest('input, textarea');
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const currentValue = input.value;
            
            input.value = currentValue.substring(0, start) + 
                         newText + 
                         currentValue.substring(end);
            
            // Restore selection
            input.setSelectionRange(start + newText.length, start + newText.length);
            input.focus();
        } else if (selectedElement.closest('[contenteditable="true"]')) {
            // Handle contenteditable elements
            try {
                document.execCommand('insertText', false, newText);
            } catch (error) {
                console.error('Error using execCommand:', error);
                // Fallback method
                range.deleteContents();
                const textNode = document.createTextNode(newText);
                range.insertNode(textNode);
                
                // Restore selection
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            // Handle regular text nodes
            try {
                document.execCommand('insertText', false, newText);
            } catch (error) {
                console.error('Error replacing text:', error);
                // Fallback method
                range.deleteContents();
                range.insertNode(document.createTextNode(newText));
            }
        }
    }

    // Create and show suggestion tooltip
    function showSuggestionTooltip(originalText, suggestions, position) {
        // Remove any existing tooltips
        const existingTooltip = document.getElementById('wittyfix-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // Create tooltip container
        const tooltip = document.createElement('div');
        tooltip.id = 'wittyfix-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            z-index: 10000;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        // Add suggestion content
        const content = document.createElement('div');
        content.innerHTML = `
            <div style="margin-bottom: 12px; color: #666;">Choose a suggestion:</div>
            ${suggestions.map((suggestion, index) => `
                <div style="
                    margin-bottom: 16px;
                    padding: 12px;
                    background: ${index === 0 ? '#f8f9fa' : index === 1 ? '#f3f4f6' : '#eef1f5'};
                    border-radius: 6px;
                ">
                    <div style="margin-bottom: 8px;">${suggestion}</div>
                    <button class="wittyfix-copy" data-text="${suggestion.replace(/"/g, '&quot;')}" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    ">Copy</button>
                </div>
            `).join('')}
            <button id="wittyfix-close" style="
                background: #f5f5f5;
                border: 1px solid #ddd;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                margin-top: 8px;
            ">Close</button>
            <div id="wittyfix-copy-feedback" style="
                color: #4CAF50;
                font-size: 12px;
                margin-top: 8px;
                display: none;
            ">Copied to clipboard!</div>
        `;
        tooltip.appendChild(content);

        // Position tooltip near the selected text
        tooltip.style.left = `${position.x}px`;
        tooltip.style.top = `${position.y + 20}px`;

        // Add to document
        document.body.appendChild(tooltip);

        // Add event listeners for copy buttons
        tooltip.querySelectorAll('.wittyfix-copy').forEach(button => {
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(button.dataset.text);
                    const feedback = document.getElementById('wittyfix-copy-feedback');
                    feedback.style.display = 'block';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                    alert('Failed to copy text to clipboard');
                }
            });
        });

        document.getElementById('wittyfix-close').addEventListener('click', () => {
            tooltip.remove();
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!tooltip.contains(e.target) && e.target.id !== 'wittyfix-tooltip') {
                tooltip.remove();
            }
        });
    }

    // Process the text based on action type
    async function processText(action) {
        try {
            const selectedText = getSelectedText();
            if (!selectedText) {
                alert('Please select some text first');
                return;
            }

            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Show loading indicator
            const loadingTooltip = document.createElement('div');
            loadingTooltip.id = 'wittyfix-loading';
            loadingTooltip.style.cssText = `
                position: fixed;
                left: ${rect.left}px;
                top: ${rect.bottom + 10}px;
                background: white;
                padding: 8px;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                z-index: 10000;
            `;
            loadingTooltip.textContent = 'Generating suggestions...';
            document.body.appendChild(loadingTooltip);

            // Process text using background script
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'processText',
                    queryType: action === 'enhance' ? 'enhance' :
                              action === 'addJoke' ? 'addHumor' :
                              'checkGrammar',
                    text: selectedText
                }, (response) => {
                    resolve(response);
                });
            });

            loadingTooltip.remove();

            if (response.error) {
                alert(response.error);
                return;
            }

            if (response.success && response.enhancedText) {
                showSuggestionTooltip(
                    selectedText,
                    response.enhancedText,
                    { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY }
                );
            }
        } catch (error) {
            console.error('Error processing text:', error);
            alert('An error occurred while processing the text');
            const loadingTooltip = document.getElementById('wittyfix-loading');
            if (loadingTooltip) {
                loadingTooltip.remove();
            }
        }
    }

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            sendResponse({status: 'pong'});
            return true;
        }
        
        if (request.action === 'enhance' || request.action === 'addJoke' || request.action === 'checkGrammar') {
            // Handle async processText using Promise
            (async () => {
                try {
                    await processText(request.action);
                    sendResponse({status: 'completed'});
                } catch (error) {
                    console.error('Error in message listener:', error);
                    sendResponse({status: 'error', message: error.message});
                }
            })();
            return true; // Will respond asynchronously
        }
        return false; // No response needed for other messages
    });
}

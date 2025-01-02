// GPT query templates
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

export { makeGPTRequest };

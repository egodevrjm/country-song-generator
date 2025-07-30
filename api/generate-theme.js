const axios = require('axios');

const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!apiKey) {
        return res.status(401).json({ 
            error: 'API key not found. Please set CLAUDE_API_KEY in Vercel Environment Variables.' 
        });
    }

    const { styleValue } = req.body;
    const storyLevel = parseInt(styleValue) || 50;

    const randomSeed = Math.floor(Math.random() * 10000);
    const timeOfDay = ['dawn', 'morning', 'afternoon', 'sunset', 'midnight', 'late night'][Math.floor(Math.random() * 6)];
    const emotion = ['hopeful', 'regretful', 'defiant', 'nostalgic', 'celebratory', 'melancholic', 'yearning', 'content', 'restless', 'grateful'][Math.floor(Math.random() * 10)];
    
    const settings = ['holler', 'creek', 'porch', 'truck bed', 'dive bar', 'church parking lot', 'county fair', 'gravel road', 'kitchen table', 'front yard'];
    const setting = settings[Math.floor(Math.random() * settings.length)];

    let prompt;
    
    if (storyLevel <= 30) {
        prompt = `You are helping Alex Wilson create a CHART-TOPPING country hook. Look at what actually succeeds on country radio.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}

CREATE A HOOK LIKE:
- "Backroad Baptism" - getting wild on dirt roads
- "Truck Bed Sunrise" - romantic moment
- "Whiskey Weather" - drinking mood
- "Barefoot Blue Jean Night" - summer fun
- "Pontoon" - one word, instant image
- "Dirt on My Boots" - simple, visual
- "Beer Never Broke My Heart" - funny truth

Your hook should be:
- ${emotion} mood
- Set in/around: ${setting}
- Something you'd hear on the radio
- Instantly memorable
- Makes people want to turn it up

Give me ONLY the hook (3-5 words). Make it a potential #1 hit, not poetry.`;
    } else if (storyLevel <= 70) {
        prompt = `You are helping Alex Wilson create a country hook that balances commercial appeal with storytelling depth.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}
Setting: ${setting}

CREATE A HOOK THAT:
- Has commercial appeal AND meaning
- 3-6 words (can be slightly longer than pure radio)
- Tells a story people connect with
- Still singable and memorable
- Can work on radio but has depth

Your hook should capture the ${emotion} mood at ${timeOfDay} near the ${setting}.

Give me ONLY the hook.`;
    } else {
        prompt = `You are helping Alex Wilson create an artistic country hook that prioritizes storytelling and emotional depth over pure commercial appeal.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}
Setting: ${setting}

CREATE A HOOK THAT:
- Prioritizes artistic expression
- Can be longer (4-8 words)
- Uses unexpected metaphors or imagery
- Tells a deeper story
- May challenge listeners but rewards them
- Has layers of meaning

Your hook should evoke ${emotion} at ${timeOfDay} near the ${setting}, but with artistic depth.

Give me ONLY the hook. Make it thought-provoking and memorable.`;
    }

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            temperature: 1.0,
            messages: [{
                role: 'user',
                content: prompt
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });

        const theme = response.data.content[0].text.trim();
        res.status(200).json({ theme });
    } catch (error) {
        console.error('Error generating theme:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate theme' });
    }
};

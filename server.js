const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store API key from environment or from client
const IS_VERCEL = process.env.VERCEL === '1';
let apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';

// History file path
const HISTORY_FILE = path.join(__dirname, 'song-history.json');

// Helper functions for history management
async function loadHistory() {
    if (IS_VERCEL) {
        // On Vercel, history is not persisted
        return [];
    }
    
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        return [];
    }
}

async function saveHistory(history) {
    if (IS_VERCEL) {
        // On Vercel, we can't save to filesystem
        console.log('Running on Vercel - history not persisted');
        return true; // Return true to prevent errors
    }
    
    try {
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving history:', error);
        return false;
    }
}

// Endpoint to set API key
app.post('/api/set-key', (req, res) => {
    if (IS_VERCEL) {
        return res.status(400).json({ 
            error: 'On Vercel: API keys must be set as environment variables',
            instructions: 'Please add CLAUDE_API_KEY in your Vercel project settings under Environment Variables',
            helpUrl: 'https://vercel.com/docs/environment-variables'
        });
    }
    
    const { key } = req.body;
    if (key) {
        apiKey = key;
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'No API key provided' });
    }
});

// Endpoint to check if API key is set
app.get('/api/check-key', (req, res) => {
    const hasKey = !!apiKey;
    res.json({ 
        hasKey,
        isVercel: IS_VERCEL,
        message: IS_VERCEL && !hasKey ? 
            'Please set CLAUDE_API_KEY in Vercel Environment Variables' : 
            null
    });
});

// Generate random theme
app.post('/api/generate-theme', async (req, res) => {
    if (!apiKey) {
        const errorMessage = IS_VERCEL ? 
            'API key not found. Please set CLAUDE_API_KEY in Vercel Environment Variables.' :
            'API key not set. Please add your key in Settings.';
        return res.status(401).json({ error: errorMessage });
    }

    const { styleValue } = req.body;
    const storyLevel = parseInt(styleValue) || 50;

    const randomSeed = Math.floor(Math.random() * 10000);
    const timeOfDay = ['dawn', 'morning', 'afternoon', 'sunset', 'midnight', 'late night'][Math.floor(Math.random() * 6)];
    const emotion = ['hopeful', 'regretful', 'defiant', 'nostalgic', 'celebratory', 'melancholic', 'yearning', 'content', 'restless', 'grateful'][Math.floor(Math.random() * 10)];
    
    // Additional variety elements
    const hookTypes = ['unexpected combination', 'everyday metaphor', 'place-based', 'action/choice', 'time-specific', 'playful/humorous'];
    const preferredType = hookTypes[Math.floor(Math.random() * hookTypes.length)];
    const settings = ['holler', 'creek', 'porch', 'truck bed', 'dive bar', 'church parking lot', 'county fair', 'gravel road', 'kitchen table', 'front yard'];
    const setting = settings[Math.floor(Math.random() * settings.length)];

    let prompt;
    
    if (storyLevel <= 30) {
        // Radio Hit style (0-30)
        prompt = `You are helping Alex Wilson create a CHART-TOPPING country hook. Look at what actually succeeds on country radio.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}

STUDY THESE ACTUAL #1 COUNTRY HITS:
- "Cruise" - simple action, feelgood
- "Body Like a Back Road" - catchy comparison
- "Dirt Road Anthem" - place + attitude
- "Chicken Fried" - food = comfort
- "Red Solo Cup" - specific object for partying
- "She Thinks My Tractor's Sexy" - funny, memorable
- "Wagon Wheel" - place name that's singable
- "Achy Breaky Heart" - simple feeling
- "Friends in Low Places" - relatable situation

WHAT WORKS:
- SHORT (3-5 words max)
- CONCRETE objects/actions (not abstract concepts)
- SINGABLE and REPEATABLE
- Makes you FEEL GOOD or RELATE instantly
- Often about: trucks, beer, love, heartbreak, small towns, Friday nights

DO NOT CREATE:
- Abstract metaphors like "Coffee Cup Cathedral"
- Wordy concepts like "Sunday School Parking Brake"
- Philosophy like "Muddy Water Optimist"
- Anything that needs explanation

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
        // Balanced style (31-70)
        prompt = `You are helping Alex Wilson create a country hook that balances commercial appeal with storytelling depth.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}
Setting: ${setting}

BALANCED HITS TO STUDY:
- "Amarillo By Morning" - place with emotion
- "Friends in Low Places" - relatable story, great hook
- "The Dance" - metaphor that's accessible
- "Strawberry Wine" - nostalgic storytelling
- "Something to Be Proud Of" - meaningful but singable
- "Live Like You Were Dying" - deep message, catchy

CREATE A HOOK THAT:
- Has commercial appeal AND meaning
- 3-6 words (can be slightly longer than pure radio)
- Tells a story people connect with
- Still singable and memorable
- Can work on radio but has depth

AVOID:
- Overly complex metaphors
- Pure clichés without twist
- Anything too abstract

Your hook should capture the ${emotion} mood at ${timeOfDay} near the ${setting}.

Give me ONLY the hook.`;
    } else {
        // Artistic/Story style (71-100)
        prompt = `You are helping Alex Wilson create an artistic country hook that prioritizes storytelling and emotional depth over pure commercial appeal.

Random seed: ${randomSeed}
Time: ${timeOfDay}
Mood: ${emotion}
Setting: ${setting}

ARTISTIC COUNTRY MASTERPIECES:
- "He Stopped Loving Her Today" - story-driven classic
- "The Grand Tour" - extended metaphor
- "Coat of Many Colors" - personal narrative
- "Sunday Morning Coming Down" - atmospheric poetry
- "Pancho and Lefty" - character-driven
- "Coffee Cup Cathedral" - unexpected metaphor
- "Digital Bonfire" - modern meets traditional

CREATE A HOOK THAT:
- Prioritizes artistic expression
- Can be longer (4-8 words)
- Uses unexpected metaphors or imagery
- Tells a deeper story
- May challenge listeners but rewards them
- Has layers of meaning

EMBRACE:
- Complex emotions
- Unusual word combinations
- Poetic language
- Character-driven narratives
- Social commentary

Your hook should evoke ${emotion} at ${timeOfDay} near the ${setting}, but with artistic depth.

Give me ONLY the hook. Make it thought-provoking and memorable.`;
    }

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            temperature: 1.0, // Higher temperature for more variety
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
        res.json({ theme });
    } catch (error) {
        console.error('Error generating theme:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate theme' });
    }
});

// Generate song
app.post('/api/generate-song', async (req, res) => {
    if (!apiKey) {
        const errorMessage = IS_VERCEL ? 
            'API key not found. Please set CLAUDE_API_KEY in Vercel Environment Variables.' :
            'API key not set. Please add your key in Settings.';
        return res.status(401).json({ error: errorMessage });
    }

    const { theme, subgenre, vocalStyle, mood, additionalNotes, styleValue } = req.body;
    const storyLevel = parseInt(styleValue) || 50;

    // Adjust instructions based on style value
    let styleInstructions;
    if (storyLevel <= 30) {
        styleInstructions = `
STYLE LEVEL: RADIO HIT (${storyLevel}/100)

FOCUS ON:
- MAXIMUM HOOK APPEAL - think "Cruise," "Red Solo Cup," "Chicken Fried"
- Simple, catchy, repeatable phrases
- Verses that set up the hook, not complex narratives
- Every line should be singable by drunk people at 2am
- Feel-good or relatable emotions only
- NO abstract metaphors, NO complex wordplay
- Structure: Simple Verse-Chorus-Verse-Chorus-Bridge-Chorus
- Keep it under 3 minutes mentally`;
    } else if (storyLevel <= 70) {
        styleInstructions = `
STYLE LEVEL: BALANCED (${storyLevel}/100)

FOCUS ON:
- Strong hooks WITH meaningful stories
- Think "Friends in Low Places," "The Dance," "Amarillo By Morning"
- Clever wordplay that doesn't sacrifice accessibility
- Verses tell a story, chorus delivers the payoff
- Mix concrete imagery with emotional depth
- Can have ONE clever metaphor if it serves the hook
- Structure can include pre-chorus if it helps the story`;
    } else {
        styleInstructions = `
STYLE LEVEL: ARTISTIC/STORY-DRIVEN (${storyLevel}/100)

FOCUS ON:
- STORYTELLING FIRST - think "He Stopped Loving Her Today," "The Grand Tour"
- Complex narratives and character development welcome
- Metaphors like "Coffee Cup Cathedral" or "Digital Bonfire" encouraged
- Verses can be longer, more detailed
- Hook can be thought-provoking rather than instantly catchy
- Embrace unconventional structures if they serve the story
- Literary devices, symbolism, and layers of meaning welcome`;
    }

    const prompt = `You are writing a country song as Alex Wilson, a singer-songwriter from Pike County, Kentucky. Born July 12, 2005 in Pikeville, Alex has a deep, gravel-warm voice like Johnny Cash or Chris Stapleton. He learned music to cope with an abusive childhood and his ethos is "work hard, tell the truth, never become my father."

Theme/Concept: ${theme}
${subgenre ? `Sub-genre: ${subgenre}` : ''}
${vocalStyle ? `Vocal Style: ${vocalStyle}` : ''}
${mood ? `Mood: ${mood}` : ''}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}
${styleInstructions}

ALEX WILSON'S SONGWRITING STYLE:

1. STORYTELLING FIRST:
- Start with authentic, honest storytelling rooted in real experiences
- Use CONCRETE IMAGERY: rust on fenders, dime-store rings, creaky porches, dusty boots
- Draw from Appalachian settings: mountains, hollers, creeks, small towns
- Even fictional stories should feel lived-in with sensory details

2. THE HOOK IS EVERYTHING:
- The hook must be SHORT, CATCHY, and RADIO-READY
- Think "Cruise," "Pontoon," "Dirt Road Anthem" - not poetry
- Should make people want to turn it up and sing along
- Examples from Alex's hits:
  * "Biscuits & Regret" - simple, relatable
  * "Truck Bed Sunrise" - visual, romantic
  * "Boots Off" - action that means something
  * "Barefoot Friday Night" - instant good feeling

3. LANGUAGE & TONE:
- Plain, conversational English - Alex's rural Kentucky voice
- Natural rhymes (AABB or ABAB) that don't feel forced
- Colloquialisms okay ("ain't," "holler," "gonna") but not caricature
- Vulnerability and raw emotion connect with listeners

4. STRUCTURE:
- Verse-Chorus with optional Pre-Chorus and Bridge
- Strong opening line hooks the listener
- Verses tell story with concrete details
- Chorus delivers the hook memorably
- Bridge provides contrast or new perspective
- Keep it 3-4 minutes

5. INSTRUMENTATION BY SUB-GENRE:
- Bluegrass: Acoustic guitar, banjo, fiddle, upright bass, mandolin
- Honky-Tonk: Piano, pedal steel, twangy electric guitar
- Outlaw/Americana: Raw acoustic guitar, harmonica, minimal production
- Country Pop: Acoustic/electric guitars, banjo fills, polished drums
- Modern/Crossover: Can include drum machines, synth pads, 808 bass

6. ALEX'S THEMES:
- Love & relationships (devoted, uncertain, or rebellious)
- Heartbreak & regret (hangovers, lost love, bad choices)
- Rural life (working land, fixing trucks, county fairs)
- Bar culture (dive bars, honky-tonks, late nights)
- Ambition & fame (Nashville dreams vs small-town roots)
- Travel & displacement (leaving home, city vs country)
- Humor & whimsy (clever narratives with wordplay)
- Technology vs tradition (social media meets rural life)
- Faith & spirituality (finding church outside church walls)

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "title": "[The Hook Phrase - Alex Wilson style]",
  "lyrics": "[Complete lyrics with clear verse/chorus markers. Use Alex's conversational tone and concrete imagery]",
  "sunoStyle": "[One paragraph describing tempo, key, instrumentation for Alex's style - mention specific instruments like acoustic guitar, fiddle, pedal steel, etc. Match the sub-genre]",
  "notes": "[Explain the HOOK and why it works for Alex Wilson, how it connects to his themes, intended audience, and key musical elements]"
}

DO NOT include any text before or after the JSON object. Remember: Alex writes RADIO HITS with heart. The hook should be something drunk people can sing at 2am. Think "Friends in Low Places" not "The Sound and the Fury."`;

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
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

        const content = response.data.content[0].text;
        console.log('Raw Claude response:', content);
        
        // Parse the JSON response
        let songData;
        try {
            // First try to parse as direct JSON
            songData = JSON.parse(content.trim());
        } catch (directParseError) {
            try {
                // If that fails, try to extract JSON from the content
                // Remove any markdown code blocks
                const cleanedContent = content
                    .replace(/```json\n?/gi, '')
                    .replace(/```\n?/gi, '')
                    .trim();
                
                // Try to find JSON object
                const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    songData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No valid JSON found in response');
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Content that failed to parse:', content);
                
                // Fallback: try to extract sections manually
                const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
                const lyricsMatch = content.match(/"lyrics"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"sunoStyle")/);
                const sunoStyleMatch = content.match(/"sunoStyle"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"notes")/);
                const notesMatch = content.match(/"notes"\s*:\s*"([\s\S]*?)"(?=\s*\})/);
                
                songData = {
                    title: titleMatch ? titleMatch[1] : 'Generated Song',
                    lyrics: lyricsMatch ? lyricsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : content,
                    sunoStyle: sunoStyleMatch ? sunoStyleMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Style information not available',
                    notes: notesMatch ? notesMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Notes not available'
                };
            }
        }
        
        // Ensure all fields have proper newlines (in case they were escaped in JSON)
        if (songData.lyrics && typeof songData.lyrics === 'string') {
            songData.lyrics = songData.lyrics.replace(/\\n/g, '\n');
        }
        if (songData.sunoStyle && typeof songData.sunoStyle === 'string') {
            songData.sunoStyle = songData.sunoStyle.replace(/\\n/g, '\n');
        }
        if (songData.notes && typeof songData.notes === 'string') {
            songData.notes = songData.notes.replace(/\\n/g, '\n');
        }
        
        // Validate the song data
        if (!songData.title || !songData.lyrics || !songData.sunoStyle || !songData.notes) {
            console.warn('Missing fields in song data:', songData);
        }

        res.json(songData);
    } catch (error) {
        console.error('Error generating song:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate song' });
    }
});

// History endpoints
app.get('/api/history', async (req, res) => {
    if (IS_VERCEL) {
        // Return empty history on Vercel
        return res.json([]);
    }
    
    try {
        const history = await loadHistory();
        res.json(history);
    } catch (error) {
        console.error('Error loading history:', error);
        res.status(500).json({ error: 'Failed to load history' });
    }
});

app.post('/api/history', async (req, res) => {
    if (IS_VERCEL) {
        // Acknowledge but don't save on Vercel
        return res.json({ success: true, message: 'History not persisted on Vercel' });
    }
    
    try {
        const historyItem = req.body;
        const history = await loadHistory();
        
        // Add to beginning of array
        history.unshift(historyItem);
        
        // Keep only last 50 songs
        if (history.length > 50) {
            history.splice(50);
        }
        
        const saved = await saveHistory(history);
        if (saved) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to save history' });
        }
    } catch (error) {
        console.error('Error adding to history:', error);
        res.status(500).json({ error: 'Failed to add to history' });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    if (IS_VERCEL) {
        return res.json({ success: true, message: 'History not persisted on Vercel' });
    }
    
    try {
        const { id } = req.params;
        const history = await loadHistory();
        const filtered = history.filter(item => item.id !== parseInt(id));
        
        const saved = await saveHistory(filtered);
        if (saved) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to save history' });
        }
    } catch (error) {
        console.error('Error deleting from history:', error);
        res.status(500).json({ error: 'Failed to delete from history' });
    }
});

app.delete('/api/history', async (req, res) => {
    if (IS_VERCEL) {
        return res.json({ success: true, message: 'History not persisted on Vercel' });
    }
    
    try {
        const saved = await saveHistory([]);
        if (saved) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to clear history' });
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
🎸 Alex Wilson Country Song Generator is running!
🌐 Open your browser to: http://localhost:${PORT}
📝 API Key: ${apiKey ? 'Set from environment' : 'Not set (you can set it in the app)'}
🎵 Creating authentic country songs in the style of Pike County's finest!
${IS_VERCEL ? '☁️  Running on Vercel - API key must be set in environment variables' : ''}
    `);
});

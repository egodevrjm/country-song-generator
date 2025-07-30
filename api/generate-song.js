const axios = require('axios');

const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!apiKey) {
        return res.status(401).json({ 
            error: 'API key not found. Please set CLAUDE_API_KEY in Vercel Environment Variables.',
            instructions: 'Go to your Vercel project settings and add CLAUDE_API_KEY',
            helpUrl: 'https://vercel.com/docs/environment-variables'
        });
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
        
        // Parse the JSON response
        let songData;
        try {
            songData = JSON.parse(content.trim());
        } catch (directParseError) {
            try {
                const cleanedContent = content
                    .replace(/```json\n?/gi, '')
                    .replace(/```\n?/gi, '')
                    .trim();
                
                const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    songData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No valid JSON found in response');
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                
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
        
        // Ensure all fields have proper newlines
        if (songData.lyrics && typeof songData.lyrics === 'string') {
            songData.lyrics = songData.lyrics.replace(/\\n/g, '\n');
        }
        if (songData.sunoStyle && typeof songData.sunoStyle === 'string') {
            songData.sunoStyle = songData.sunoStyle.replace(/\\n/g, '\n');
        }
        if (songData.notes && typeof songData.notes === 'string') {
            songData.notes = songData.notes.replace(/\\n/g, '\n');
        }

        res.status(200).json(songData);
    } catch (error) {
        console.error('Error generating song:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate song' });
    }
};

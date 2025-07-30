module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(400).json({ 
        error: 'On Vercel: API keys must be set as environment variables',
        instructions: 'Please add CLAUDE_API_KEY in your Vercel project settings under Environment Variables',
        helpUrl: 'https://vercel.com/docs/environment-variables'
    });
};

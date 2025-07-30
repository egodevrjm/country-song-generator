module.exports = async (req, res) => {
    const hasKey = !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY);
    
    res.status(200).json({ 
        hasKey,
        isVercel: true,
        message: !hasKey ? 'Please set CLAUDE_API_KEY in Vercel Environment Variables' : null
    });
};

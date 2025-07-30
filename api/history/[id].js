module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // On Vercel, history is not persisted
    return res.status(200).json({ success: true, message: 'History not persisted on Vercel' });
};

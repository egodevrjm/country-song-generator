module.exports = async (req, res) => {
    // On Vercel, history is not persisted
    if (req.method === 'GET') {
        return res.status(200).json([]);
    }
    
    if (req.method === 'POST') {
        return res.status(200).json({ success: true, message: 'History not persisted on Vercel' });
    }
    
    if (req.method === 'DELETE') {
        return res.status(200).json({ success: true, message: 'History not persisted on Vercel' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};

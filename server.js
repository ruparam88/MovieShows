require('dotenv').config(); // Load variables from .env securely
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Tell Express to serve the static frontend files from a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// SECURE PROXY ROUTE: The browser requests this, hiding your API key entirely!
app.get('/api/trending/movies', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to safely fetch data from TMDB' });
    }
});

// SECURE PROXY ROUTE: For TV shows
app.get('/api/trending/shows', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/tv/popular', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to safely fetch data from TMDB' });
    }
});

// CONFIG ROUTE: Tell the frontend where Videasy is located without hardcoding it there
app.get('/api/config', (req, res) => {
    res.json({
        videasyUrl: process.env.VIDEASY_BASE_URL || 'https://videasy.to/embed'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Secure streaming app running at http://localhost:${PORT}`);
});

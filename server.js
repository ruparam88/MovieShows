require('dotenv').config(); // Load variables from .env securely
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// SECURE PROXY ROUTE: Trending Movies
app.get('/api/trending/movies', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        
        if (!response.ok) throw new Error(`TMDB API responded with status ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Movie API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch data from TMDB' });
    }
});

// SECURE PROXY ROUTE: Popular/Trending TV Shows
app.get('/api/trending/shows', async (req, res) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/trending/tv/week', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });

        if (!response.ok) throw new Error(`TMDB API responded with status ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ TV API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch data from TMDB' });
    }
});

// NEW SECURE FUZZY SEARCH ROUTE
// This intercepts typos and checks both TV series, Web series, and Movies instantly.
app.get('/api/search', async (req, res) => {
    try {
        const searchPhrase = req.query.q;
        if (!searchPhrase) {
            return res.status(400).json({ error: 'Query parameter "q" missing.' });
        }

        // TMDB search/multi combines movies, tv shows, and network programs in one fuzzy match scan
        const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchPhrase)}&include_adult=false&language=en-US&page=1`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });

        if (!response.ok) throw new Error(`TMDB Search API responded with status ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Search API Proxy Error:", error.message);
        res.status(500).json({ error: 'Backend failed to execute lookup parameters.' });
    }
});

// CONFIG ROUTE: Tell the frontend where Videasy is located
app.get('/api/config', (req, res) => {
    res.json({
        videasyUrl: process.env.VIDEASY_BASE_URL || 'https://embed.su'
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 CineStream app successfully running!`);
    console.log(`👉 Access your application at: http://localhost:${PORT}\n`);
});
const axios = require('axios');
const path = require('path');

const NewsController = {
    async getNews(req, res) {
        try {
            // Fetch news data from BBC RSS feed
            const response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml');
            const newsData = response.data;
            
            // Send the news data as JSON for the frontend to consume
            res.json(newsData);
        } catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ error: 'Failed to fetch news data' });
        }
    },
    async renderNewsPage(req, res) {
        try {
            // Send the HTML page
            res.sendFile(path.join(__dirname, '../views/news/news.html'));
        } catch (error) {
            console.error('Error rendering news page:', error);
            res.status(500).send('Error loading news page');
        }
    }
}

module.exports = NewsController; 
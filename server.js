const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;
const API_PORT = 5000;
const API_URL = `http://localhost:${API_PORT}/api`;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API routes
app.use('/api', async (req, res) => {
  const path = req.path;
  const method = req.method;
  const query = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
  
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (method !== 'GET') {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(`${API_URL}${path}${query}`, options);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'API request failed' });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`API server should be running on http://localhost:${API_PORT}`);
});

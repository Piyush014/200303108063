const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];

  try {
    const promises = urlArray.map(fetchData);

    const results = await Promise.allSettled(promises);

    const numbers = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value.numbers)) {
        numbers.push(...result.value.numbers);
      }
    });

    const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);

    return res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function fetchData(url) {
  try {
    const response = await axios.get(url, { timeout: 500 });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return { error: `Failed to retrieve data from ${url}` };
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


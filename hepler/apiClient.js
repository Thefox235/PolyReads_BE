// apiClient.js
const axios = require('axios');

const apiClient = axios.create({
  timeout: 10000, // 10 giây timeout (có thể điều chỉnh)
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = apiClient;
const axios = require('axios');
const { PYTHON_API_URL } = require('../config/env');

exports.fetchRows = async () => {
  const response = await axios.get(`${PYTHON_API_URL}/rows`, { timeout: 60000 });
  return response.data;
};

exports.updateRow = async (index, values) => {
  const response = await axios.post(`${PYTHON_API_URL}/rows/${index}`, { values });
  return response.data;
};

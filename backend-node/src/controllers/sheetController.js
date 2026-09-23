const pythonProxy = require('../services/pythonProxyService');
const socketService = require('../services/socketService');

exports.getRows = async (req, res) => {
  try {
    const data = await pythonProxy.fetchRows();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Python:', error.message);
    res.status(502).json({ error: 'Failed to fetch data' });
  }
};

exports.updateRow = async (req, res) => {
  try {
    const { index } = req.params;
    const { values } = req.body;
    
    if (!values || !Array.isArray(values)) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    const data = await pythonProxy.updateRow(index, values);
    res.json(data);
  } catch (error) {
    console.error(`Error updating row ${req.params.index}:`, error.message);
    res.status(502).json({ error: 'Failed to update data' });
  }
};

exports.handleWebhook = (req, res) => {
  const { data } = req.body; 
  console.log('Received real-time update from Python! Broadcasting to clients...');
  socketService.broadcastUpdate(data);
  res.json({ status: 'ok' });
};

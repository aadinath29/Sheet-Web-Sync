import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:3000';
const socket = io(NODE_API_URL);

function App() {
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);

  // Initial Load & Socket Setup
  useEffect(() => {
    let retryTimeout;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${NODE_API_URL}/api/rows`, { timeout: 10000 });
        setRows(response.data.rows || []);
        setLoading(false); // Only hide loading screen on success
      } catch (error) {
        console.error("Servers might be sleeping (Cold Start). Retrying in 5 seconds...", error);
        // Try again in 5 seconds without hiding the loading screen
        retryTimeout = setTimeout(fetchData, 5000);
      }
    };

    fetchData();

    // Listen for real-time updates from Python -> Node -> React
    socket.on('sheet-updated', (data) => {
      console.log('Real-time update received:', data);
      if (data.rows) {
        setRows(data.rows);
      }
    });

    return () => {
      socket.off('sheet-updated');
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  // Handle Edit Button Click
  const handleEdit = (index, currentValues) => {
    setEditIndex(index);
    // Google Sheets might return arrays with fewer than 3 elements if cells are empty. Pad to ensure 3 inputs.
    const paddedValues = [
      currentValues[0] || "",
      currentValues[1] || "",
      currentValues[2] || ""
    ];
    setEditValues(paddedValues);
  };

  // Handle Input Change
  const handleChange = (colIndex, value) => {
    const newValues = [...editValues];
    newValues[colIndex] = value;
    setEditValues(newValues);
  };

  // Handle Submit Save
  const handleSave = async (index) => {
    try {
      setEditIndex(null); // Optimistically close edit mode
      
      // Send the update to Node.js (which forwards to Python -> Google Sheets)
      await axios.post(`${NODE_API_URL}/api/rows/${index}`, {
        values: editValues
      });
      
      // Note: We don't necessarily have to update local state here because 
      // the Node server will broadcast the 'sheet-updated' event back to us 
      // instantly, keeping us perfectly in sync. 
      // But for snappiness, we can optimistically update local state:
      const newRows = [...rows];
      newRows[index] = editValues;
      setRows(newRows);
      
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save. Check console for details.");
    }
  };

  if (loading) return <div>Loading Spreadsheet Data...</div>;

  return (
    <div className="container">
      <h1>Google Sheets Real-Time Sync</h1>
      <p>Edit a cell below, or edit directly in Google Sheets and watch this update instantly!</p>
      
      <table>
        <thead>
          <tr>
            <th>Column A</th>
            <th>Column B</th>
            <th>Column C</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {/* If this row is being edited, show inputs. Otherwise, show text. */}
              {editIndex === index ? (
                <>
                  <td><input value={editValues[0]} onChange={(e) => handleChange(0, e.target.value)} /></td>
                  <td><input value={editValues[1]} onChange={(e) => handleChange(1, e.target.value)} /></td>
                  <td><input value={editValues[2]} onChange={(e) => handleChange(2, e.target.value)} /></td>
                  <td>
                    <button className="save-btn" onClick={() => handleSave(index)}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditIndex(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{row[0] || ""}</td>
                  <td>{row[1] || ""}</td>
                  <td>{row[2] || ""}</td>
                  <td>
                    <button onClick={() => handleEdit(index, row)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

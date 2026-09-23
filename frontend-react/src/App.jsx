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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${NODE_API_URL}/api/rows`);
        setRows(response.data.rows || []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('sheet-updated', (data) => {
      console.log('Real-time update received:', data);
      if (data.rows) {
        setRows(data.rows);
      }
    });

    return () => {
      socket.off('sheet-updated');
    };
  }, []);

  const handleEdit = (index, currentValues) => {
    setEditIndex(index);
    const paddedValues = [
      currentValues[0] || "",
      currentValues[1] || "",
      currentValues[2] || ""
    ];
    setEditValues(paddedValues);
  };

  const handleChange = (colIndex, value) => {
    const newValues = [...editValues];
    newValues[colIndex] = value;
    setEditValues(newValues);
  };

  const handleSave = async (index) => {
    try {
      setEditIndex(null);
      
      await axios.post(`${NODE_API_URL}/api/rows/${index}`, {
        values: editValues
      });
      
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

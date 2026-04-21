import React, { useRef, useState } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Upload() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/articles/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Upload successful! Inserted ${res.data.rows} rows.`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed. Check console.');
    }
    setLoading(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearDataset = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your uploaded articles?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/articles/dataset`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Dataset completely cleared.');
    } catch(err) {
      alert('Failed to clear dataset.');
    }
  };

  return (
    <>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Upload Data</h1>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Add new entries to your editorial corpus.</p>
      </header>

      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ margin: '0 auto', width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <UploadCloud size={32} color="var(--primary-color)" />
        </div>
        <h2 style={{ marginBottom: 8 }}>Upload Dataset (Append)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px auto' }}>
           Upload a CSV or JSON file containing your articles. Ensure the dataset contains a 'title' and 'description' column. Your new uploads will stack!
        </p>
        
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? 'Uploading...' : 'Select File'}
          </button>
          
          <button className="button" style={{ background: 'transparent', color: '#dc2626', borderColor: '#fca5a5' }} onClick={handleClearDataset}>
            Clear My Dataset
          </button>
        </div>
      </div>
    </>
  );
}

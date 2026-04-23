import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Clock, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Training History</h1>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Review your past similarity model completions.</p>
      </header>

      {history.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <HistoryIcon size={48} color="var(--border-color)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No historical jobs yet.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map(item => (
            <div key={item.id} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8 }}>
                  <Award size={24} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>{item.score || 'Training Complete'}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} /> {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ background: '#ecfdf5', color: '#059669', padding: '4px 12px', fontSize: 12, fontWeight: 600, borderRadius: 20 }}>
                SUCCESS
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

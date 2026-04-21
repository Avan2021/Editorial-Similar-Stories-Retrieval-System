import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Training() {
  const [trainingState, setTrainingState] = useState('idle'); // idle, training, complete, error
  const [trainingStats, setTrainingStats] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const handleTrain = async () => {
    setTrainingState('training');
    setTrainingProgress(0);
    
    const progressInterval = setInterval(() => {
      setTrainingProgress(p => (p < 90 ? p + 10 : p));
    }, 500);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/admin/retrain`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clearInterval(progressInterval);
      setTrainingProgress(100);
      setTrainingState('complete');
      setTrainingStats(res.data.processed_documents);
    } catch (err) {
      clearInterval(progressInterval);
      setTrainingState('error');
      const errorMessage = err.response?.data?.detail || 'Training failed.';
      alert(`Training failed: ${errorMessage}`);
    }
  };

  return (
    <>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Train Models</h1>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Re-compile the TF-IDF vocabulary against your entries.</p>
      </header>

      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><BrainCircuit /> Similarity Matrix Engine</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>The AI model generates TF-IDF vectors, applies PCA dimensionality reduction, and maps clusters with K-Means to formulate accurate semantic proximities.</p>
        
        {trainingState === 'idle' && (
          <button className="button" onClick={handleTrain} style={{ padding: '12px 24px' }}>Start Training Engine</button>
        )}

        {trainingState === 'training' && (
          <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Activity className="spin" size={20} color="var(--primary-color)" />
              <span style={{ fontWeight: 500 }}>Vectorizing text documents...</span>
            </div>
            <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${trainingProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {trainingState === 'complete' && (
          <div style={{ background: '#ecfdf5', padding: 24, borderRadius: 8, border: '1px solid #a7f3d0' }}>
            <h3 style={{ color: '#059669', marginBottom: 8 }}>Training Complete!</h3>
            <p style={{ color: '#047857' }}>Successfully processed {trainingStats} documents and synchronized the updated artifacts.</p>
            <button className="button" onClick={() => setTrainingState('idle')} style={{ marginTop: 16, background: '#10b981', borderColor: '#059669' }}>Acknowledge</button>
          </div>
        )}

        <div style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
          <h4 style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Live Engine Status</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             <div style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 6 }}><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TF-IDF Pipeline</div><div style={{ fontWeight: 600, marginTop: 4 }}>Active</div></div>
             <div style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 6 }}><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PCA Models</div><div style={{ fontWeight: 600, marginTop: 4 }}>Active</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

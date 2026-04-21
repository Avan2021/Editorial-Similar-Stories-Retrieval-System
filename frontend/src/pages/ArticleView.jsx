import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Cpu, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [artRes, simRes] = await Promise.all([
        axios.get(`${API_URL}/articles/${id}`, { headers }),
        axios.get(`${API_URL}/articles/${id}/similar`, { headers }).catch(() => ({ data: { similar_articles: [] } }))
      ]);
      setArticle(artRes.data);
      setSimilar(simRes.data.similar_articles || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Activity className="spin" /> Loading article...</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <>
      <Link to="/" className="button" style={{ display: 'inline-flex', background: 'white', color: 'var(--text-color)', borderColor: 'var(--border-color)', marginBottom: 24, gap: 8 }}>
        <ArrowLeft size={16} /> Back to Directory
      </Link>

      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#f3f4f6', padding: 8, borderRadius: 6 }}>
            <FileText size={20} color="var(--primary-color)" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Vector ID: {article.article_id}
          </span>
        </div>
        
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>{article.title || "Untitled Article"}</h1>
        <p style={{ color: 'var(--text-color)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
          {article.description}
        </p>
      </div>

      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, marginBottom: 24 }}>
        <Cpu size={20} /> Deep Semantic Matches
      </h2>

      {similar.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
          No similar articles indexed. Have you trained the model yet?
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {similar.map((match, idx) => (
            <Link key={idx} to={`/article/${match.article_id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, transition: 'all 0.2s ease', cursor: 'pointer', border: '1px solid transparent' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                   <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-muted)' }}>ID: {match.article_id}</span>
                   <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {(match.similarity * 100).toFixed(1)}% Match
                   </span>
                </div>
                <h3 style={{ fontSize: 16, margin: '0 0 8px 0', color: 'var(--text-color)' }}>{match.title || 'Untitled'}</h3>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }} className="truncate-2">
                  {match.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

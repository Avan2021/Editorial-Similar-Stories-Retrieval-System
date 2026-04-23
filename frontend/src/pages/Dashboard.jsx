import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');

  const fetchArticles = async (query = '') => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/articles`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, size: 50 },
      });
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArticles(search);
  }, [search]);

  return (
    <>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Manage and search your uploaded articles.</p>
      </header>

      <div className="card">
        <div style={{ padding: 24, paddingBottom: 16 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40 }}
            />
          </div>
        </div>

        <div className="spacer" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, margin: 0 }}><LayoutDashboard size={18} /> Articles List</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {articles.length} items</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/upload" className="button" style={{ background: 'white', color: 'var(--text-color)', borderColor: 'var(--border-color)', fontSize: 13, padding: '6px 14px' }}>
              + Upload CSV/JSON
            </Link>
            <Link to="/training" className="button" style={{ fontSize: 13, padding: '6px 14px' }}>
              Run Training Engine
            </Link>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Article ID</th>
              <th>Title</th>
              <th>Description Snippet</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No articles found. Try uploading a dataset!
                </td>
              </tr>
            ) : (
              articles.map((item) => (
                <tr key={item.article_id}>
                  <td style={{ fontWeight: 500 }}>{item.article_id.slice(0, 8)}...</td>
                  <td>{item.title || "Untitled"}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.description}</td>
                  <td>
                    <Link to={`/article/${item.article_id}`} className="button" style={{ padding: '6px 12px', fontSize: 12 }}>
                      View Similar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

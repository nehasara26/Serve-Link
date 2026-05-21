import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, ArrowUp, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';

const IssuesPage = ({ user, setAuth }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulsingIds, setPulsingIds] = useState(new Set());
  const navigate = useNavigate();

  // Generate a stable client key for anonymous upvoting
  const getClientKey = () => {
    let key = localStorage.getItem('clientKey');
    if (!key) {
      key = 'client_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('clientKey', key);
    }
    return key;
  };

  const fetchIssues = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleUpvote = async (issueId) => {
    const token = localStorage.getItem('token');
    const clientKey = getClientKey();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/issues/${issueId}/upvote`,
        { clientKey },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      // Button pulse
      setPulsingIds(prev => new Set(prev).add(issueId));
      setTimeout(() => {
        setPulsingIds(prev => { const n = new Set(prev); n.delete(issueId); return n; });
      }, 500);
      // Update issue in state without full re-fetch
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? { ...issue, upvoteCount: res.data.upvoteCount, upvotes: res.data.upvotes }
            : issue
        ).sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
      );
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const clientKey = getClientKey();

  return (
    <div className="app-container bg-aura-forum">
      <Navbar user={user} setAuth={setAuth} />

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-subheader">
          <p style={{ color: 'var(--text-light)', marginTop: 0 }}>
            Community-reported issues sorted by urgency (upvotes). Help prioritize what matters most!
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading community feed...</div>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <p>No issues reported yet. Be the first!</p>
            <Link to="/report-issue" className="btn">Report an Issue</Link>
          </div>
        ) : (
          <div className="issues-feed">
            {issues.map((issue, idx) => {
              const hasUpvoted = issue.upvotes?.includes(clientKey);
              return (
                <div key={issue.id} id={`issue-card-${issue.id}`} className="bento-card">
                  {/* Rank badge for top 3 */}
                  {idx < 3 && (
                    <span className="rank-badge">#{idx + 1}</span>
                  )}

                  <div className="issue-feed-content">
                    <div className="flex justify-between items-center">
                      <Link to={`/issues/${issue.id}`} className="issue-feed-title">
                        {issue.title}
                      </Link>
                      <span className="bento-pill scraped">{issue.category}</span>
                    </div>

                    <p className="issue-feed-desc">{issue.description}</p>

                    {issue.mentionedOrg && (
                      <p className="issue-mentioned-org" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} /> Mentions: <strong>{issue.mentionedOrg}</strong>
                      </p>
                    )}

                    {issue.imageUrl && (
                      <img
                        src={issue.imageUrl}
                        alt="Issue"
                        className="issue-feed-img"
                      />
                    )}

                    <div className="issue-feed-footer">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="upvote-btn-wrapper">
                            <button
                              className={`action-btn-circ ${hasUpvoted ? 'active' : ''}`}
                              onClick={() => handleUpvote(issue.id)}
                              title={hasUpvoted ? 'Remove upvote' : 'Upvote this issue'}
                              style={{ width: '36px', height: '36px', background: hasUpvoted ? 'var(--secondary)' : '#1e293b', padding: 0, transform: pulsingIds.has(issue.id) ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s ease, background 0.2s ease' }}
                            >
                              <ArrowUp size={18} strokeWidth={hasUpvoted ? 3 : 2} color="#fff" />
                            </button>
                            {pulsingIds.has(issue.id) && (
                              <span aria-hidden="true" className="upvote-pulse-ring" />
                            )}
                          </div>
                          <span
                            className={`upvote-count${pulsingIds.has(issue.id) ? ' upvote-count-pop' : ''}`}
                          >{issue.upvoteCount || 0}</span>
                        </div>
                        <span className="issue-status-tag" style={{ color: issue.status === 'Open' ? '#16a34a' : '#ea580c' }}>
                          ● {issue.status || 'Open'}
                        </span>
                        <Link to={`/issues/${issue.id}`} className="comment-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageSquare size={16} /> Discuss
                        </Link>
                      </div>
                      <span className="reporter-tag">
                        Reported by: {issue.reporterName || 'Volunteer'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesPage;

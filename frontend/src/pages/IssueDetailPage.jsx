import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const MOCK_USERNAMES = ['Volunteer1', 'Volunteer2', 'Volunteer3', 'CommunityHelper', 'Anonymous'];

const IssueDetailPage = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentForm, setCommentForm] = useState({ username: MOCK_USERNAMES[0], text: '' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const fetchIssue = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/issues/${id}`);
      setIssue(res.data);
    } catch {
      setError('Could not load issue.');
    } finally {
      setLoadingIssue(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
    } catch {
      console.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssue();
    fetchComments();
  }, [fetchIssue, fetchComments]);

  const handleUpvote = async () => {
    let clientKey = localStorage.getItem('clientKey');
    if (!clientKey) {
      clientKey = 'client_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('clientKey', clientKey);
    }
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/issues/${id}/upvote`,
        { clientKey },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setIssue(res.data);
    } catch (err) {
      console.error('Upvote failed');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentForm.text.trim()) return;
    setPosting(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/comments/${id}`, {
        username: commentForm.username,
        text: commentForm.text.trim()
      });
      setComments(prev => [...prev, res.data]);
      setCommentForm(f => ({ ...f, text: '' }));
    } catch {
      alert('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const clientKey = localStorage.getItem('clientKey') || '';
  const hasUpvoted = issue?.upvotes?.includes(clientKey);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loadingIssue) return <div className="loading-state" style={{ marginTop: '80px' }}>Loading issue...</div>;
  if (error) return <div className="container"><div className="error-banner">{error}</div></div>;

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h1 style={{ margin: 0 }}>📋 Issue Detail</h1>
        <Link to="/issues" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>
          ← Community Feed
        </Link>
      </nav>

      <div className="container" style={{ maxWidth: '760px' }}>
        {/* Issue Card */}
        {issue && (
          <div className="card">
            <div className="flex justify-between items-center">
              <h2 style={{ margin: 0 }}>{issue.title}</h2>
              <span className="issue-tag">{issue.category}</span>
            </div>

            <div style={{ marginTop: '8px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-light)' }}>
              <span style={{ color: issue.status === 'Open' ? '#16a34a' : '#ea580c', fontWeight: '600' }}>
                ● {issue.status || 'Open'}
              </span>
              {issue.mentionedOrg && <span>🏢 {issue.mentionedOrg}</span>}
              <span>📅 {formatDate(issue.createdAt)}</span>
              <span>Reported by: {issue.reporterName || 'Volunteer'}</span>
            </div>

            <p style={{ lineHeight: '1.7' }}>{issue.description}</p>

            {issue.imageUrl && (
              <img
                src={issue.imageUrl}
                alt="Issue photo"
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border)' }}
              />
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
                onClick={handleUpvote}
              >
                {hasUpvoted ? '▲ Upvoted' : '△ Upvote'} — {issue.upvoteCount || 0} votes
              </button>
            </div>
          </div>
        )}

        {/* Comment Thread */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>💬 Community Discussion</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '-8px' }}>
            Coordinate volunteers, event dates, and resources below.
          </p>

          {/* Comments List */}
          {loadingComments ? (
            <div className="loading-state" style={{ padding: '20px 0' }}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="empty-comments">
              Be the first to comment and coordinate!
            </div>
          ) : (
            <div className="comment-thread">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Post a Comment */}
          <form onSubmit={handlePostComment} className="comment-form">
            <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Post a Message</h4>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <select
                value={commentForm.username}
                onChange={e => setCommentForm(f => ({ ...f, username: e.target.value }))}
              >
                {MOCK_USERNAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                value={commentForm.text}
                onChange={e => setCommentForm(f => ({ ...f, text: e.target.value }))}
                rows={3}
                placeholder="e.g. I can volunteer on Saturday 5th April. Who else is available?"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={posting}>
              {posting ? 'Posting...' : '💬 Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;

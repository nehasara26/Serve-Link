import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_USERNAMES = ['Anonymous', 'Volunteer1', 'Volunteer2', 'Volunteer3', 'CommunityHelper'];

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    mentionedOrg: '',
    reporterName: MOCK_USERNAMES[0],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    let imageUrl = null;

    // Upload image if selected
    if (imageFile && imagePreview) {
      try {
        setUploading(true);
        const res = await axios.post('http://localhost:5000/api/upload', {
          data: imagePreview
        });
        imageUrl = res.data.imageUrl;
      } catch (err) {
        console.error('Image upload failed:', err);
        // Continue without image
      } finally {
        setUploading(false);
      }
    }

    // Submit issue
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        'http://localhost:5000/api/issues',
        {
          ...form,
          imageUrl,
          // Provide dummy coords for Kochi area
          lng: '76.2673',
          lat: '9.9312',
        },
        { headers }
      );
      navigate('/issues');
    } catch (err) {
      console.error('Issue submission failed:', err);
      setError('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h1 style={{ margin: 0 }}>📢 Report an Issue</h1>
        <Link to="/issues" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>
          ← Community Feed
        </Link>
      </nav>

      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="card">
          <p style={{ color: 'var(--text-light)', marginTop: 0 }}>
            Spotted a community issue? Report it here to alert NGOs and volunteers. Issues are sorted by community upvotes.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Broken streetlight near Hope Orphanage"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Infrastructure</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Food & Shelter</option>
                <option>Women Safety</option>
                <option>Environment</option>
                <option>General</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mentioned Organisation (optional)</label>
              <input
                type="text"
                name="mentionedOrg"
                value={form.mentionedOrg}
                onChange={handleChange}
                placeholder="e.g. Karunalayam, Helping Hands..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <select name="reporterName" value={form.reporterName} onChange={handleChange}>
                {MOCK_USERNAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Attach Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ padding: '8px' }}
              />
              {imagePreview && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={submitting}
            >
              {uploading ? 'Uploading Image...' : submitting ? 'Submitting...' : '📢 Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;

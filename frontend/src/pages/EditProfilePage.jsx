import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Wrench, Heart, Briefcase, GraduationCap,
  Award, FileText, Plus, X, CheckCircle2, ChevronLeft,
} from 'lucide-react';
import Navbar from '../components/Navbar';

/* ─── Static option lists (matches Register) ───────────────────────── */
const SKILL_OPTIONS = [
  'Teaching', 'Medical / First Aid', 'Construction', 'IT / Tech',
  'Legal Aid', 'Counselling', 'Logistics', 'Fundraising',
  'Graphic Design', 'Translation', 'Cooking', 'Driving',
];
const CAUSE_OPTIONS = [
  'Education', 'Environment', 'Healthcare', 'Poverty Relief',
  'Animal Welfare', 'Disaster Relief', 'Women Empowerment',
  'Elderly Care', 'Child Welfare', 'Human Rights',
];
const SECTOR_OPTIONS = [
  'Education', 'Environment', 'Healthcare', 'Poverty / Hunger',
  'Animal Welfare', 'Disaster Relief', 'Women Empowerment',
  'Elderly Care', 'Child Welfare', 'Human Rights',
];

/* ─── Shared styles ─────────────────────────────────────────────────── */
const S = {
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-light)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--bg-warm)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 800,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
};

/* ─── Chip / tag selector ────────────────────────────────────────────── */
function ChipGroup({ options, selected, onChange }) {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
              background: active ? 'var(--primary)' : 'transparent',
              color: active ? '#fff' : 'var(--text-light)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Toast notification ─────────────────────────────────────────────── */
function Toast({ show }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : '12px'})`,
      opacity: show ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      background: '#1e293b',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      pointerEvents: 'none',
      zIndex: 2000,
    }}>
      <CheckCircle2 size={18} color="#4ade80" /> Profile saved!
    </div>
  );
}

/* ─── Section card wrapper ───────────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bento-card" style={{ marginBottom: '20px' }}>
      <div style={S.sectionHead}>
        <Icon size={20} color="var(--primary)" strokeWidth={2.2} />
        <h2 style={S.sectionTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
const EditProfilePage = ({ user, setAuth }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    website: '',
    about: '',
    skills: [],
    causes: [],
    sectors: [],
    experience: [],   // [{ title, description }]
    education: [],    // [{ degree, institution, year }]
    certifications: [], // [string]
    // org-specific
    orgType: '',
    registrationNumber: '',
    contactPerson: '',
    description: '',
  });

  // Fetch and pre-fill
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = res.data;
      setProfileData(d);
      setForm({
        name: d.name || d.orgName || '',
        phone: d.phone || '',
        website: d.website || '',
        about: d.about || '',
        skills: d.skills || [],
        causes: d.causes || [],
        sectors: d.sectors || [],
        experience: d.experience || [],
        education: d.education || [],
        certifications: d.certifications || [],
        orgType: d.orgType || '',
        registrationNumber: d.registrationNumber || '',
        contactPerson: d.contactPerson || '',
        description: d.description || '',
      });
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
  }, [user, navigate, fetchProfile]);

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // Experience helpers
  const addExperience = () =>
    setForm(f => ({ ...f, experience: [...f.experience, { title: '', description: '' }] }));
  const updateExp = (idx, key, val) =>
    setForm(f => ({ ...f, experience: f.experience.map((e, i) => i === idx ? { ...e, [key]: val } : e) }));
  const removeExp = (idx) =>
    setForm(f => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) }));

  // Education helpers
  const addEducation = () =>
    setForm(f => ({ ...f, education: [...f.education, { degree: '', institution: '', year: '' }] }));
  const updateEdu = (idx, key, val) =>
    setForm(f => ({ ...f, education: f.education.map((e, i) => i === idx ? { ...e, [key]: val } : e) }));
  const removeEdu = (idx) =>
    setForm(f => ({ ...f, education: f.education.filter((_, i) => i !== idx) }));

  // Certifications helpers
  const addCert = () => setForm(f => ({ ...f, certifications: [...f.certifications, ''] }));
  const updateCert = (idx, val) =>
    setForm(f => ({ ...f, certifications: f.certifications.map((c, i) => i === idx ? val : c) }));
  const removeCert = (idx) =>
    setForm(f => ({ ...f, certifications: f.certifications.filter((_, i) => i !== idx) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/auth/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state" style={{ marginTop: '80px' }}>Loading profile...</div>;

  const isVol = profileData?.role === 'Volunteer';

  return (
    <div className="app-container bg-aura-dashboard" style={{ minHeight: '100vh' }}>
      <Navbar user={user} setAuth={setAuth} />
      <Toast show={showToast} />

      <div className="container" style={{ maxWidth: '720px', paddingBottom: '80px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link to="/profile" style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600 }}>
            <ChevronLeft size={18} /> Back to Profile
          </Link>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Edit Profile</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '6px' }}>
            Shape how the world sees your contributions.
          </p>
        </div>

        <form onSubmit={handleSave}>

          {/* ── 1. Basic Info ────────────────────────────────── */}
          <Section icon={User} title="Basic Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={S.label}>{isVol ? 'Full Name' : 'Organization Name'}</label>
                <input style={S.input} value={form.name} onChange={field('name')} placeholder="Your name" />
              </div>
              <div>
                <label style={S.label}>Phone</label>
                <input style={S.input} value={form.phone} onChange={field('phone')} placeholder="+1 555 000 0000" type="tel" />
              </div>
            </div>

            {!isVol && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={S.label}>Contact Person</label>
                  <input style={S.input} value={form.contactPerson} onChange={field('contactPerson')} placeholder="Jane Doe" />
                </div>
                <div>
                  <label style={S.label}>Registration Number</label>
                  <input style={S.input} value={form.registrationNumber} onChange={field('registrationNumber')} placeholder="NGO-2024-XXXX" />
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <label style={S.label}>Website</label>
              <input style={S.input} value={form.website} onChange={field('website')} placeholder="https://yoursite.com" type="url" />
            </div>
          </Section>

          {/* ── 2. Skills (Volunteer only) ───────────────────── */}
          {isVol && (
            <Section icon={Wrench} title="Skills">
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: 0, marginBottom: '14px' }}>
                Select skills you can offer
              </p>
              <ChipGroup options={SKILL_OPTIONS} selected={form.skills} onChange={v => setForm(f => ({ ...f, skills: v }))} />
            </Section>
          )}

          {/* ── 3. Interest Causes (Volunteer) / Sectors (Org) ── */}
          {isVol ? (
            <Section icon={Heart} title="Causes I Care About">
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: 0, marginBottom: '14px' }}>
                What issues drive you?
              </p>
              <ChipGroup options={CAUSE_OPTIONS} selected={form.causes} onChange={v => setForm(f => ({ ...f, causes: v }))} />
            </Section>
          ) : (
            <Section icon={Heart} title="Focus Sectors">
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: 0, marginBottom: '14px' }}>
                Areas your organization operates in
              </p>
              <ChipGroup options={SECTOR_OPTIONS} selected={form.sectors} onChange={v => setForm(f => ({ ...f, sectors: v }))} />
            </Section>
          )}

          {/* ── 4. Experience (Volunteer only) ───────────────── */}
          {isVol && (
            <Section icon={Briefcase} title="Experience">
              {form.experience.map((exp, idx) => (
                <div
                  key={idx}
                  style={{ background: 'var(--bg-warm)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '12px', position: 'relative' }}
                >
                  <button type="button" onClick={() => removeExp(idx)} style={{ ...S.removeBtn, position: 'absolute', top: '12px', right: '12px' }} title="Remove">
                    <X size={16} />
                  </button>
                  <label style={S.label}>Role / Title</label>
                  <input
                    style={{ ...S.input, marginBottom: '12px' }}
                    value={exp.title}
                    onChange={e => updateExp(idx, 'title', e.target.value)}
                    placeholder="e.g. Volunteer Coordinator"
                  />
                  <label style={S.label}>Description</label>
                  <textarea
                    style={{ ...S.input, resize: 'vertical', minHeight: '72px' }}
                    value={exp.description}
                    onChange={e => updateExp(idx, 'description', e.target.value)}
                    placeholder="What you did, what you learned…"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Plus size={16} /> Add Experience
              </button>
            </Section>
          )}

          {/* ── 5. Education (Volunteer only) ────────────────── */}
          {isVol && (
            <Section icon={GraduationCap} title="Education">
              {form.education.map((edu, idx) => (
                <div
                  key={idx}
                  style={{ background: 'var(--bg-warm)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '12px', position: 'relative' }}
                >
                  <button type="button" onClick={() => removeEdu(idx)} style={{ ...S.removeBtn, position: 'absolute', top: '12px', right: '12px' }} title="Remove">
                    <X size={16} />
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={S.label}>Degree</label>
                      <input style={S.input} value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} placeholder="e.g. B.Sc. Computer Science" />
                    </div>
                    <div>
                      <label style={S.label}>Year</label>
                      <input style={S.input} value={edu.year} onChange={e => updateEdu(idx, 'year', e.target.value)} placeholder="e.g. 2022" type="number" min="1950" max="2030" />
                    </div>
                  </div>
                  <label style={S.label}>Institution</label>
                  <input style={S.input} value={edu.institution} onChange={e => updateEdu(idx, 'institution', e.target.value)} placeholder="e.g. University of Delhi" />
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Plus size={16} /> Add Education
              </button>
            </Section>
          )}

          {/* ── 6. Certifications (Volunteer only) ───────────── */}
          {isVol && (
            <Section icon={Award} title="Certifications & Training">
              {form.certifications.map((cert, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    style={{ ...S.input, flex: 1 }}
                    value={cert}
                    onChange={e => updateCert(idx, e.target.value)}
                    placeholder="e.g. First Aid Certification — Red Cross"
                  />
                  <button type="button" onClick={() => removeCert(idx)} style={{ ...S.removeBtn, flexShrink: 0 }} title="Remove">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCert}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Plus size={16} /> Add Certification
              </button>
            </Section>
          )}

          {/* ── 7. About Me / Description ────────────────────── */}
          <Section icon={FileText} title={isVol ? 'About Me' : 'Organization Description'}>
            <label style={S.label}>{isVol ? 'A few words about yourself' : 'Mission & activities'}</label>
            <textarea
              style={{ ...S.input, resize: 'vertical', minHeight: '110px' }}
              value={isVol ? form.about : form.description}
              onChange={field(isVol ? 'about' : 'description')}
              placeholder={isVol
                ? 'What drives you to volunteer? What are you passionate about?'
                : "Describe your organization's mission and what you do…"}
              maxLength={600}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'right', margin: '4px 0 0' }}>
              {(isVol ? form.about : form.description).length} / 600
            </p>
          </Section>

          {/* ── Save button ──────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Link to="/profile" className="btn btn-outline" style={{ padding: '11px 28px' }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn"
              style={{ padding: '11px 36px', opacity: saving ? 0.7 : 1, minWidth: '140px' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;

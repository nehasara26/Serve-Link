import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

/* ─── Skill & cause options ─────────────────────────────── */
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

const ORG_TYPES = [
  'NGO / Non-profit', 'Community Group', 'Government Body',
  'Social Enterprise', 'Religious Organisation', 'Other',
];

const SECTOR_OPTIONS = [
  'Education', 'Environment', 'Healthcare', 'Poverty / Hunger',
  'Animal Welfare', 'Disaster Relief', 'Women Empowerment',
  'Elderly Care', 'Child Welfare', 'Human Rights',
];

/* ─── Small helper: multi-select chip ───────────────────── */
function ChipGroup({ options, selected, onChange, color = '#2563eb' }) {
  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${active ? color : '#cbd5e1'}`,
              background: active ? color : 'transparent',
              color: active ? '#fff' : '#64748b',
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

/* ─── Main component ─────────────────────────────────────── */
const Register = ({ setAuth }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null | 'Volunteer' | 'Organization'
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /* volunteer fields */
  const [vForm, setVForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    skills: [], causes: [],
  });

  /* organization fields */
  const [oForm, setOForm] = useState({
    orgName: '', email: '', password: '', confirmPassword: '',
    orgType: '', registrationNumber: '', website: '',
    description: '', sectors: [], contactPerson: '', phone: '',
  });

  const onVChange = (e) => setVForm({ ...vForm, [e.target.name]: e.target.value });
  const onOChange = (e) => setOForm({ ...oForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side password check
    const pwd = role === 'Volunteer' ? vForm.password : oForm.password;
    const cpwd = role === 'Volunteer' ? vForm.confirmPassword : oForm.confirmPassword;
    if (pwd !== cpwd) { setErrorMsg('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const payload =
        role === 'Volunteer'
          ? { name: vForm.name, email: vForm.email, password: vForm.password, role: 'Volunteer', skills: vForm.skills, causes: vForm.causes }
          : { name: oForm.orgName, email: oForm.email, password: oForm.password, role: 'Organization', orgType: oForm.orgType, registrationNumber: oForm.registrationNumber, website: oForm.website, description: oForm.description, sectors: oForm.sectors, contactPerson: oForm.contactPerson, phone: oForm.phone };

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      setAuth(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Styles ── */
  const pageStyle = {
    minHeight: '100vh',
    background: '#FFFBF9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px 80px',
  };

  const bentoWrap = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    width: '100%',
    maxWidth: '680px',
    marginTop: '32px',
  };

  const bentoCard = (active, accent) => ({
    background: active ? accent : '#fff',
    border: `1.5px solid ${active ? accent : '#F3F4F6'}`,
    borderRadius: '24px',
    padding: '40px 32px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? `0 12px 30px ${accent}22` : '0 4px 12px rgba(0,0,0,0.03)',
    transform: active ? 'translateY(-6px)' : 'translateY(0)',
  });

  const formCard = {
    background: '#fff',
    borderRadius: '24px',
    padding: '44px 48px',
    width: '100%',
    maxWidth: '580px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
    marginTop: '40px',
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    border: '1px solid #F3F4F6',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '6px',
    marginTop: '16px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc',
    boxSizing: 'border-box',
  };

  const submitBtn = (accent) => ({
    width: '100%',
    marginTop: '28px',
    padding: '13px',
    background: accent,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s',
    boxShadow: `0 4px 14px ${accent}55`,
  });

  const VOL_COLOR = '#FF8C42';
  const ORG_COLOR = '#FF6B6B';

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>
          Join Serve-Link
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
          Choose how you'd like to make a difference
        </p>
      </div>

      {/* Bento selector */}
      <div style={bentoWrap}>
        {/* Volunteer card */}
        <div onClick={() => setRole('Volunteer')} style={bentoCard(role === 'Volunteer', VOL_COLOR)}>
          <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🙋</div>
          <h3 style={{ margin: '0 0 8px', color: role === 'Volunteer' ? '#fff' : '#1e293b', fontSize: '18px', fontWeight: 800 }}>
            Volunteer
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: role === 'Volunteer' ? 'rgba(255,255,255,0.85)' : '#64748b', lineHeight: 1.5 }}>
            Offer your skills and time to causes you care about
          </p>
          {role === 'Volunteer' && (
            <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.25)', borderRadius: '8px', padding: '4px 10px', display: 'inline-block', fontSize: '12px', color: '#fff', fontWeight: 700 }}>
              ✓ Selected
            </div>
          )}
        </div>

        {/* Organization card */}
        <div onClick={() => setRole('Organization')} style={bentoCard(role === 'Organization', ORG_COLOR)}>
          <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🏢</div>
          <h3 style={{ margin: '0 0 8px', color: role === 'Organization' ? '#fff' : '#1e293b', fontSize: '18px', fontWeight: 800 }}>
            Organization
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: role === 'Organization' ? 'rgba(255,255,255,0.85)' : '#64748b', lineHeight: 1.5 }}>
            Post opportunities and connect with passionate volunteers
          </p>
          {role === 'Organization' && (
            <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.25)', borderRadius: '8px', padding: '4px 10px', display: 'inline-block', fontSize: '12px', color: '#fff', fontWeight: 700 }}>
              ✓ Selected
            </div>
          )}
        </div>
      </div>

      {/* ─── Volunteer Form ─────────────────────── */}
      {role === 'Volunteer' && (
        <div style={formCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>🙋</span>
            <h2 style={{ margin: 0, color: VOL_COLOR, fontWeight: 800, fontSize: '1.35rem' }}>Volunteer Registration</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 20px' }}>Tell us about yourself</p>

          {errorMsg && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Full Name *</label>
            <input name="name" type="text" required placeholder="Jane Smith" value={vForm.name} onChange={onVChange} style={inputStyle} />

            <label style={labelStyle}>Email Address *</label>
            <input name="email" type="email" required placeholder="jane@example.com" value={vForm.email} onChange={onVChange} style={inputStyle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <input name="password" type="password" required placeholder="••••••••" value={vForm.password} onChange={onVChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input name="confirmPassword" type="password" required placeholder="••••••••" value={vForm.confirmPassword} onChange={onVChange} style={inputStyle} />
              </div>
            </div>

            <label style={labelStyle}>Skills</label>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#94a3b8' }}>Select all that apply</p>
            <ChipGroup options={SKILL_OPTIONS} selected={vForm.skills} onChange={(v) => setVForm({ ...vForm, skills: v })} color={VOL_COLOR} />

            <label style={labelStyle}>Interest Causes</label>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#94a3b8' }}>What causes do you care about?</p>
            <ChipGroup options={CAUSE_OPTIONS} selected={vForm.causes} onChange={(v) => setVForm({ ...vForm, causes: v })} color={VOL_COLOR} />

            <button type="submit" disabled={loading} style={submitBtn(VOL_COLOR)}>
              {loading ? 'Creating Account…' : 'Create Volunteer Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: VOL_COLOR, fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      )}

      {/* ─── Organization Form ───────────────────── */}
      {role === 'Organization' && (
        <div style={formCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>🏢</span>
            <h2 style={{ margin: 0, color: ORG_COLOR, fontWeight: 800, fontSize: '1.35rem' }}>Organization Registration</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 20px' }}>Set up your organization profile</p>

          {errorMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Organization Name *</label>
                <input name="orgName" type="text" required placeholder="Helping Hands NGO" value={oForm.orgName} onChange={onOChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Organization Type *</label>
                <select name="orgType" required value={oForm.orgType} onChange={onOChange} style={inputStyle}>
                  <option value="">Select type…</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <label style={labelStyle}>Official Email Address *</label>
            <input name="email" type="email" required placeholder="contact@helpinghands.org" value={oForm.email} onChange={onOChange} style={inputStyle} />

            {/* Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <input name="password" type="password" required placeholder="••••••••" value={oForm.password} onChange={onOChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input name="confirmPassword" type="password" required placeholder="••••••••" value={oForm.confirmPassword} onChange={onOChange} style={inputStyle} />
              </div>
            </div>

            {/* Row 4 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Registration Number</label>
                <input name="registrationNumber" type="text" placeholder="NGO-2024-XXXX" value={oForm.registrationNumber} onChange={onOChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input name="website" type="url" placeholder="https://yourorg.org" value={oForm.website} onChange={onOChange} style={inputStyle} />
              </div>
            </div>

            {/* Row 5 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Contact Person *</label>
                <input name="contactPerson" type="text" required placeholder="John Doe" value={oForm.contactPerson} onChange={onOChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input name="phone" type="tel" placeholder="+1 555 000 0000" value={oForm.phone} onChange={onOChange} style={inputStyle} />
              </div>
            </div>

            {/* Description */}
            <label style={labelStyle}>Organization Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Briefly describe your organization's mission and activities…"
              value={oForm.description}
              onChange={onOChange}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            />

            {/* Focus sectors */}
            <label style={labelStyle}>Focus Sectors</label>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#94a3b8' }}>Select the areas your org operates in</p>
            <ChipGroup options={SECTOR_OPTIONS} selected={oForm.sectors} onChange={(v) => setOForm({ ...oForm, sectors: v })} color={ORG_COLOR} />

            <button type="submit" disabled={loading} style={submitBtn(ORG_COLOR)}>
              {loading ? 'Creating Account…' : 'Register Organization →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: ORG_COLOR, fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      )}

      {/* No role selected yet */}
      {!role && (
        <p style={{ color: '#94a3b8', marginTop: '24px', fontSize: '14px' }}>
          👆 Pick a role above to get started
        </p>
      )}

      {/* Sign-in link */}
      <p style={{ color: '#64748b', marginTop: '24px', fontSize: '13px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Sign in here</Link>
      </p>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select option { background: #fff; }
      `}</style>
    </div>
  );
};

export default Register;

import React from 'react';

const JobCard = ({ job }) => {
  const isPlatform = job.source === 'platform';

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-org">{job.orgName}</p>
        </div>
        <span className={`badge ${isPlatform ? 'badge-platform' : 'badge-scraped'}`}>
          {isPlatform ? '🏛️ Platform Original' : '🔗 Scraped'}
        </span>
      </div>

      <div className="job-meta">
        <span className="job-meta-item">📍 {job.location}</span>
        <span className="job-meta-item">⏰ Deadline: {job.deadline}</span>
        <span className={`experience-badge ${job.experienceRequired ? 'exp-required' : 'exp-none'}`}>
          {job.experienceRequired ? '🎓 Experience Required' : '✅ No Experience Needed'}
        </span>
      </div>

      {job.description && (
        <p className="job-description">{job.description}</p>
      )}

      <div className="job-card-footer">
        {isPlatform ? (
          <button className="btn btn-sm">Apply Now</button>
        ) : (
          <a
            href={job.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
          >
            🌐 Visit NGO Website
          </a>
        )}
      </div>
    </div>
  );
};

export default JobCard;

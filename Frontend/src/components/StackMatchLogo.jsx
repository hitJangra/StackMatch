import React from 'react';

const StackMatchLogo = ({ compact = false, className = '' }) => (
    <span className={`stackmatch-logo ${compact ? 'stackmatch-logo--compact' : ''} ${className}`} aria-label="StackMatch">
        <svg viewBox="0 0 36 36" role="img" aria-hidden="true">
            <rect x="2" y="2" width="32" height="32" rx="10" fill="currentColor" />
            <path d="M11 13.5h14M11 18h10M11 22.5h7" fill="none" stroke="var(--logo-ink)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="26" cy="22.5" r="2.5" fill="var(--logo-ink)" />
        </svg>
        {!compact && <span>StackMatch</span>}
    </span>
);

export default StackMatchLogo;

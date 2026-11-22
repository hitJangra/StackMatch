// react library
import React from 'react';
import { WaveLoader } from './Loaders';

const LoadingSpinner = ({ message = 'Loading...', fullscreen = false }) => (
    <div className={fullscreen ? 'auth-loading-screen' : 'page-loading-area'} role="status">
        <div className="loader-theme-card">
            <WaveLoader label={message} />
        </div>
    </div>
);

export default LoadingSpinner;

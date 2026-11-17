// react library
import React from 'react'
// spinner animations and styles
import './spinner.scss'

// full screen loading spinner component — premium glassmorphic edition
const Spinner = ({ message = "Loading..." }) => (
    // centered screen overlay with ambient glow background
    <main className='spinner-screen'>
        {/* glassmorphic card container */}
        <div className='spinner-card'>
            {/* dual-ring CSS spinner */}
            <div className='spinner' />
            {/* animated dot trio */}
            <div className='spinner-dots'>
                <span />
                <span />
                <span />
            </div>
            {/* customizable loading status text */}
            <p className='spinner__msg'>{message}</p>
        </div>
    </main>
)

// export spinner
export default Spinner

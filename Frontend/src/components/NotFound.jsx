// react library
import React from 'react'
// navigation hook
import { useNavigate } from 'react-router'
// styles for 404 page
import './notfound.scss'

// 404 error page component
const NotFound = () => {
    // navigation router
    const navigate = useNavigate()

    return (
        // main error container
        <main className='notfound'>
            {/* http status code */}
            <h1 className='notfound__code'>404</h1>
            {/* title */}
            <p className='notfound__title'>Page not found</p>
            {/* helper message */}
            <p className='notfound__sub'>The page you're looking for doesn't exist or has been moved.</p>
            {/* redirect back to dashboard */}
            <button className='button primary-button' onClick={() => navigate('/')}>
                Go Home
            </button>
        </main>
    )
}

// export notfound component
export default NotFound

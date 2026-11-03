import React from 'react'
import { useNavigate } from 'react-router'
import './notfound.scss'

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <main className='notfound'>
            <h1 className='notfound__code'>404</h1>
            <p className='notfound__title'>Page not found</p>
            <p className='notfound__sub'>The page you're looking for doesn't exist or has been moved.</p>
            <button className='button primary-button' onClick={() => navigate('/')}>
                Go Home
            </button>
        </main>
    )
}

export default NotFound

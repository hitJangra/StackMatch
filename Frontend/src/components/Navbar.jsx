import React from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useToast } from './Toast'
import './navbar.scss'

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        addToast("Logged out successfully", "success")
        navigate("/login")
    }

    return (
        <nav className='navbar'>
            <span className='navbar__brand' onClick={() => navigate('/')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
                InterviewAI
            </span>

            {user && (
                <div className='navbar__user'>
                    <div className='navbar__avatar'>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className='navbar__username'>{user.username}</span>
                    <button className='navbar__logout' onClick={onLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    )
}

export default Navbar

// react library
import React from 'react'
// navigation hook
import { useNavigate } from 'react-router'
// auth hook for current user and logout
import { useAuth } from '../features/auth/hooks/useAuth'
// toast notification helper
import { useToast } from './Toast'
// navbar stylesheet
import './navbar.scss'

// top navigation bar component
const Navbar = () => {
    // get user object and logout method
    const { user, handleLogout } = useAuth()
    // toast triggers
    const { addToast } = useToast()
    // navigation router
    const navigate = useNavigate()

    // logout click handler
    const onLogout = async () => {
        // clear session and cookie
        await handleLogout()
        // notify user
        addToast("Logged out successfully", "success")
        // redirect to login page
        navigate("/login")
    }

    return (
        // navigation container
        <nav className='navbar'>
            {/* brand logo and link to home */}
            <span className='navbar__brand' onClick={() => navigate('/')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6h16v2H4zm2 5h12v2H6zm3 5h6v2H9z"/>
                </svg>
                StackMatch
            </span>

            {/* show user profile and logout button if signed in */}
            {user && (
                <div className='navbar__user'>
                    {/* user initials avatar */}
                    <div className='navbar__avatar'>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    {/* display username */}
                    <span className='navbar__username'>{user.username}</span>
                    {/* sign out button */}
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

// export navbar
export default Navbar

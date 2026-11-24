// react library
import React from 'react'
// navigation hook
import { useNavigate } from 'react-router'
// 404 error page component
const NotFound = () => {
    // navigation router
    const navigate = useNavigate()

    return (
        // main error container
        <main className="auth-page">
            <div className="auth-card text-center">
                <h1 className="text-5xl font-extrabold text-[#163300] dark:text-[#9FE870] m-0">404</h1>
                <p className="text-lg font-semibold mt-4 mb-6">Page not found</p>
                <button
                    className="wise-primary-pill"
                    onClick={() => navigate('/')}
                >
                    Go home
                </button>
            </div>
        </main>
    )
}

// export notfound component
export default NotFound

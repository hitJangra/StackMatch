// router provider to render configured routes
import { RouterProvider } from "react-router"
// router definition
import { router } from "./app.routes.jsx"
// auth context provider
import { AuthProvider } from "./features/auth/auth.context.jsx"
// interview state provider
import { InterviewProvider } from "./features/interview/interview.context.jsx"
// dark / light theme provider
import { ThemeProvider } from "./features/theme/theme.context.jsx"
// toast notifications provider
import { ToastProvider } from "./components/Toast.jsx"

// root component wrapping app with all global context providers
function App() {
  return (
    // dark/light theme context
    <ThemeProvider>
      {/* alert toast notifications */}
      <ToastProvider>
        {/* authentication and logged-in user state */}
        <AuthProvider>
          {/* interview reports and active analysis state */}
          <InterviewProvider>
            {/* route views */}
            <RouterProvider router={router} />
          </InterviewProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

// export app
export default App

// react strict mode wrapper
import { StrictMode } from 'react'
// react 18 client root renderer
import { createRoot } from 'react-dom/client'
// main root component
import App from './App.jsx'
// global base styles
import "./index.css"
// app theme and utility styles
import "./style.scss"

// mount react application into dom root div
createRoot(document.getElementById('root')).render(
  // enable react strict mode checks in development
  <StrictMode>
    {/* root app entry */}
    <App />
  </StrictMode>,
)

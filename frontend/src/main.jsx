import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log('Starting React app...')
console.log('Root element:', document.getElementById('root'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

console.log('React app rendered')

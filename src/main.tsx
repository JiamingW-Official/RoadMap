import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { App } from './ui/App'
import { Boardroom } from './ui/Boardroom'
import { Talent } from './ui/Talent'
import { Settings } from './ui/Settings'
import { SelectionProvider } from './store/selection'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/boardroom', element: <Boardroom /> },
  { path: '/talent', element: <Talent /> },
  { path: '/settings', element: <Settings /> },
], { basename: import.meta.env.BASE_URL })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SelectionProvider>
      <RouterProvider router={router} />
    </SelectionProvider>
  </React.StrictMode>,
)

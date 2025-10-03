import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { router } from './Routes/Routes.jsx'
import AuthProvider from './providers/AuthProvider.jsx'

const queryClient = new QueryClient()


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <div className="max-w-screen-2xl mx-auto">
        <RouterProvider router={router} />
        </div>
    </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)

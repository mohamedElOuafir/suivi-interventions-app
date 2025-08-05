import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ActiveLinkProvider } from './context/activeLinkContext.tsx'
import { ProfileProvider } from './context/ProfileContext.tsx'

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <ActiveLinkProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </ActiveLinkProvider>
  </StrictMode>

)

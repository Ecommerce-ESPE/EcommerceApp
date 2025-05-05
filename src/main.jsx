import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//IMPORTS
import {EcommerceApp} from './EcommerceApp'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EcommerceApp />
    </BrowserRouter>
  </StrictMode>,
)

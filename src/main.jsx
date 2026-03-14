import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { authConfig, isCognitoConfigured } from './config/auth'
import './index.css'
import App from './App.jsx'

if (isCognitoConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: authConfig.userPoolId,
        userPoolClientId: authConfig.userPoolClientId,
        identityPoolId: authConfig.identityPoolId,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
        userAttributes: { email: { required: true } },
      },
    },
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

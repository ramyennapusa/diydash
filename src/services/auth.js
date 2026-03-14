// Cognito auth via Amplify v6 – only used when VITE_COGNITO_* env vars are set
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { isCognitoConfigured } from '../config/auth';

export const auth = {
  async signUp({ email, password, name }) {
    if (!isCognitoConfigured) throw new Error('Cognito is not configured.');
    const username = (email || '').trim().toLowerCase();
    if (!username || !password) throw new Error('Email and password are required.');
    const { isSignUpComplete, nextStep } = await amplifySignUp({
      username,
      password,
      options: {
        userAttributes: {
          email: username,
          ...(name && name.trim() ? { name: name.trim() } : {}),
        },
      },
    });
    return { isSignUpComplete, nextStep, email: username };
  },

  async confirmSignUp(email, code) {
    if (!isCognitoConfigured) throw new Error('Cognito is not configured.');
    const username = (email || '').trim().toLowerCase();
    if (!username || !code) throw new Error('Email and code are required.');
    await amplifyConfirmSignUp({
      username,
      confirmationCode: String(code).trim(),
    });
    return { email: username };
  },

  async signIn(email, password) {
    if (!isCognitoConfigured) throw new Error('Cognito is not configured.');
    const username = (email || '').trim().toLowerCase();
    if (!username || !password) throw new Error('Email and password are required.');
    const { isSignUpComplete, nextStep } = await amplifySignIn({ username, password });
    return { isSignUpComplete, nextStep, email: username };
  },

  async signOut() {
    if (!isCognitoConfigured) return;
    try {
      await amplifySignOut();
    } catch (e) {
      console.warn('Auth signOut:', e);
    }
  },

  /** Returns current user email if authenticated, else null. */
  async getCurrentUserEmail() {
    if (!isCognitoConfigured) return null;
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession({ forceRefresh: false });
      const payload = session?.tokens?.idToken?.payload;
      const email = payload?.email || payload?.['cognito:username'] || user?.signInDetails?.loginId;
      return email ? String(email).trim().toLowerCase() : null;
    } catch {
      return null;
    }
  },

  /** Returns raw Id Token JWT for API Authorization header, or null. */
  async getIdToken() {
    if (!isCognitoConfigured) return null;
    try {
      const session = await fetchAuthSession({ forceRefresh: false });
      const token = session?.tokens?.idToken;
      return token ? token.toString() : null;
    } catch {
      return null;
    }
  },

  /** Force refresh and return Id Token (e.g. before API call after long idle). */
  async getIdTokenFresh() {
    if (!isCognitoConfigured) return null;
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const token = session?.tokens?.idToken;
      return token ? token.toString() : null;
    } catch {
      return null;
    }
  },
};

export { isCognitoConfigured };

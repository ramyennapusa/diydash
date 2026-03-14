// Cognito User Pool + Identity Pool config for Draft2Done
// Set in .env.local: VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID, VITE_COGNITO_IDENTITY_POOL_ID, VITE_REGION

const region = import.meta.env.VITE_REGION || import.meta.env.VITE_AWS_REGION || 'us-west-2';
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;

export const authConfig = {
  region,
  userPoolId: userPoolId || '',
  userPoolClientId: userPoolClientId || '',
  identityPoolId: identityPoolId || '',
};

export const isCognitoConfigured = Boolean(
  authConfig.userPoolId && authConfig.userPoolClientId && authConfig.identityPoolId
);

/** Cognito IdP login key for GetCredentialsForIdentity */
export function getCognitoIdpLoginKey() {
  if (!authConfig.userPoolId || !region) return null;
  return `cognito-idp.${region}.amazonaws.com/${authConfig.userPoolId}`;
}

import * as t from '@babel/types'

/**
 * Jest runs in Node and does not support import.meta. Vite injects import.meta.env at build time.
 * Rewrite import.meta.env to a plain object backed by process.env for tests.
 */
function importMetaEnvPlugin() {
  return {
    visitor: {
      MemberExpression(path) {
        const { node } = path
        if (
          node.object?.type === 'MetaProperty' &&
          node.object.meta?.name === 'import' &&
          node.object.property?.name === 'meta' &&
          node.property?.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          const str = (k, fallback = '') =>
            t.objectProperty(
              t.identifier(k),
              t.stringLiteral(process.env[k] ?? fallback)
            )
          path.replaceWith(
            t.objectExpression([
              str('VITE_API_BASE_URL'),
              str('VITE_S3_MEDIA_BUCKET'),
              str('VITE_REGION'),
              str('VITE_AWS_REGION'),
              str('VITE_COGNITO_USER_POOL_ID'),
              str('VITE_COGNITO_CLIENT_ID'),
              str('VITE_COGNITO_IDENTITY_POOL_ID'),
              t.objectProperty(t.identifier('MODE'), t.stringLiteral(process.env.NODE_ENV || 'test')),
              t.objectProperty(t.identifier('DEV'), t.booleanLiteral(process.env.NODE_ENV !== 'production')),
              t.objectProperty(t.identifier('PROD'), t.booleanLiteral(process.env.NODE_ENV === 'production')),
            ])
          )
        }
      },
    },
  }
}

export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [importMetaEnvPlugin],
}
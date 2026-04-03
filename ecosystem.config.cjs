module.exports = {
  apps: [
    {
      name: 'token-gen-dev',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'token-gen-prod',
      script: 'npm',
      args: 'run preview',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

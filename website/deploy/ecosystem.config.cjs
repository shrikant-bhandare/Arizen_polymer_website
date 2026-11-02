// PM2 process file for a VPS without Docker:  pm2 start deploy/ecosystem.config.cjs
// Run from the website/ folder after `npm ci && npm run build`.
module.exports = {
  apps: [
    {
      name: 'arizen-website',
      cwd: __dirname + '/..',
      script: 'server/dist/index.js',
      node_args: '--env-file=server/.env.production',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production', TRUST_PROXY: '1' },
      out_file: '/var/log/arizen/app.log',
      error_file: '/var/log/arizen/error.log',
      time: true,
    },
  ],
};

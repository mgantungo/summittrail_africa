// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'summittrail',
    script: './.output/server/index.mjs',
    instances: 2, // or 'max' for all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3250,
      HOST: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
}
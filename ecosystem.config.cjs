// PM2 Ecosystem Configuration
// Use: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'rdv-frontend',
      script: '.output/server/index.mjs',
      instances: 'max', // Usa todos os CPUs disponíveis
      exec_mode: 'cluster', // Modo cluster para melhor performance
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      // Logs
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};

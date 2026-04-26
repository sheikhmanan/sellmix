module.exports = {
  apps: [
    {
      name: 'sellmix-api',
      script: 'server.js',
      cwd: '/var/www/sellmix/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/sellmix/error.log',
      out_file: '/var/log/sellmix/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};

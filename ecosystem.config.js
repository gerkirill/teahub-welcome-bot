module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : 'teahub',
      script    : 'index.ts',
      interpreter: 'node_modules/.bin/ts-node',
      env: {
        TZ: 'Europe/Kiev'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'ubuntu',
      host : 'moydomen.com',
      ref  : 'origin/master',
      repo : 'git@github.com:gerkirill/teahub-welcome-bot.git',
      path : '/home/ubuntu/teahub-welcome-bot-dev',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }/*,
    dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }*/
  }
};

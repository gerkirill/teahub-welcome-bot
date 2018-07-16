module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : 'teahub-prod',
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
      path : '/home/ubuntu/teahub-welcome-bot-prod',
      'post-deploy' :'[ -s $HOME/.nvm/nvm.sh ] && \. $HOME/.nvm/nvm.sh && npm install && pm2 startOrRestart ecosystem.config.js --env production',
      env  : {
        NODE_ENV: 'production'
      }
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

const deployEnv = DEPLOY_ENV;
module.exports = require(`./config_${deployEnv.replace(/"/g, '')}`);

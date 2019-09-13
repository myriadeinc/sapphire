const path = require('path');

const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

const config = require('src/util/config.js');
const logger = require('src/util/logger.js');


let server;

const start = async () => {
  logger.core.info('Starting sapphire');
  



  const port = config.get('port');
  const app = require('./app');
  server = app.listen(port, () => {
    logger.core.info(`Service started on port ${port}`);
  });
};

const gracefulShutdown = () => {
  server.close(async () => {
    logger.core.info('Gracefully closing the app');
    cache.close();
    
    } finally {
      process.exit(0);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  logger.core.error('Unhandled promise rejection!', err);
  process.exit(1);
});

start()
    .catch((err) => {
      logger.core.error(err);
      process.exit(1);
    });

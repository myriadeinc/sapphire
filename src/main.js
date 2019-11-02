const path = require('path');

const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

const config = require('src/util/config.js');
const logger = require('src/util/logger.js');
const db = require('src/util/db.js');
const mq = require('src/util/mq.js');

let server;

const main = async () => {
  logger.core.info(`Starting Sapphire service`);

  logger.core.info('Initializing messaging queue RabbitMQ');
  await mq.init(config.get('rabbitmq:url'));
  logger.core.info('Messaging queue initialized');

  logger.core.info('Initializing database.');
  await db.init(config.get('db'),logger.db);
  logger.core.info('Database initialized.');

  
  const port = config.get('port');
  const app = require('./app');

  server = app.listen(port, () => {
    logger.core.info(`Service started on port ${port}`);
  });
};

const gracefulShutdown = () => {
  server.close(async () => {
    logger.core.info('Gracefully closing the app');
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  logger.core.error('Unhandled promise rejection!', err);
  process.exit(1);
});

main()
  .catch((err) => {
    logger.core.error(err);
    process.exit(1);
  });

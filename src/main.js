const path = require("path");

const rootPath = path.resolve(`${__dirname}/..`);
require("app-module-path").addPath(rootPath);

const config = require("src/util/config.js");
const logger = require("src/util/logger.js");
const db = require("src/util/db.js");
const cache = require('src/util/cache.js');
const metrics = require('src/util/metrics.js');

const mq = require("src/util/mq.js");
const MoneroApi = require('src/api/monero.api.js')

let server;
const redisUrl = config.get("redis") || 'redis://localhost:6379'
const main = async () => {
  logger.core.info(`Starting Sapphire service`);
  logger.core.info('Starting Internal Server Metrics');
  metrics.init('Sapphire');
  // global.blockHeight = MoneroApi().getCurrentBlockHeight

  logger.core.info("Initializing database.");
  await db.init(config.get("db"), logger.db);
  logger.core.info("Database initialized.");

  await cache.init({
    url: redisUrl
  });
  logger.core.info("Initializing messaging queue RabbitMQ");
  await mq.init(config.get("rabbitmq:url"));

  const port = config.get("port");
  const app = require("./app");

  server = app.listen(port, async () => {
    logger.core.info(`Service started on port ${port}`);

    logger.core.info("Registering MinerMetrics service listener");
    let blockHeight = BigInt(0)
    try {
      blockHeight = await MoneroApi.getInfo();
      if (blockHeight){
        blockHeight = BigInt(blockHeight.height);
      }
    }catch(e){
      logger.core.error(e)
      logger.core.error("could not init blockheight from monero daemon api")
    }
    try {
      await require("src/service/miner.metrics.service.js").init(blockHeight);
      logger.core.info(`MinerMetrics service listener registered with blockHeight ${blockHeight}`);
    } catch(e){
      logger.core.error(e)
      logger.core.error("could not init miner metrics service. can't process incoming shares")
    }
    
  });
};

const gracefulShutdown = () => {
  server.close(async () => {
    logger.core.info("Gracefully closing the app");
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err) => {
  logger.core.error("Unhandled promise rejection!", err);
  process.exit(1);
});

main().catch((err) => {
  logger.core.error(err);
  process.exit(1);
});

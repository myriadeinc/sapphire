## Sapphire Service

A stateful miner metrics processing service.

[![CircleCI](https://circleci.com/gh/myriadeinc/sapphire.svg?style=svg)](https://circleci.com/gh/myriadeinc/sapphire)

Gets requests from emerald and updates the databse. Rabbitmq is set up on Sapphire as a listener. It uses sequelize to process and update the database.

**Local URL**: localhost:8081, 9870

**Staging URL**: https://staging.myriade.io/metrics

## Setup
`Sapphire` requires `Redis`, `Rabitmq`, and a database `URL` to run. To run it locally, set up the docker instance as outlined in Web.

## Purpose
**TLDR** Two main jobs:
- Receive data from `emerald` and save it properly (mapped to hashrate, shares, and credits)
- Expose relevant data (with authentication) to clients (show their historical hashrate, myriade credits, etc. )

`Sapphire` is designed to accept incoming data from `Emerald` and save it to the main database for users. It is also designed to provide metrics/analytics for the users via a `GraphQL` interface.

## Structure

```

├── Dockerfile, Dockerfile.dev, docker-compose.yml, Makefile -> For deployment
├── migrations
│   ├── Stored migrations for the DB
├── package.json, README.md -> Self explanatory
├── scripts
│   ├── NPM scripts for managing DB migrations
├── src
│   ├── api
│   │   └── monero.api.js
│   ├── app.js -> Hosts express and GraphQL server
│   ├── main.js -> Main executable, initializes all services
│   ├── middleware
│   │   ├── contains authentication and validation middleware
│   ├── models
│   │   ├── Each model file corresponds to a table in the DB
│   ├── repository
│   │   ├── Provides proper functions to fetch data from the DB
│   ├── routes
│   │   ├── Handlers for API/GraphQL endpoints
│   ├── schemas
│   │   └── Schema model to relate to DB
│   ├── service
│   │   ├── miner.metrics.service.js
│   │   └── payout.service.js
│   └── util
│       ├── cache.js -> Handler for Redis
│       ├── config.js -> Handler for config file
│       ├── db.js -> Handler for DB connection
│       ├── error.js -> Throw proper errors
│       ├── logger.js -> Logger, connects to LogDNA
│       └── mq.js -> Handler for RabbitMQ connection
└── test
    ├── Tests...

```
## Sapphire Service

A stateful miner metrics processing service.

[![CircleCI](https://circleci.com/gh/myriadeinc/sapphire.svg?style=svg)](https://circleci.com/gh/myriadeinc/sapphire)

Gets requests from emerald and updates the databse. Rabbitmq is set up on Sapphire as a listener. It uses sequelize to process and update the database.

**Local URL**: localhost:8081, 9870

**Staging URL**: https://staging.myriade.io/metrics

## Setup
Sapphire requeires Redis, Rabitmq, and a database URL to run. To run it locally, set up the docker instance as outlined in Web.

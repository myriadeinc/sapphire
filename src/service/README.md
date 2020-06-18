# Sapphire Services

## Miner Metrics

The core functionality of `Sapphire` is to provide miner stats and specific miner actions. In order to do so, we need information about each miner, and the Miner Metrics pulls data from `Emerald` via `RabbitMQ` and saves into persistence (database)
## Myriade Credits and XMR

Currently, XMR has a base amount: ie. 1 XMR, exensible to 12 decimal places, the smallest unit being called an *atomic unit*. Since we store everything down to the atomic unit, the number can exceed 2^53 which is Javascript's limitation for the `Number` class. Therefore, it is imperative that we keep values as `BIGINT`s
## Credit Event

What is a credit event? It's used to denote a generic event where a miner's credit is locked for some reason, which could be:
- They entered a raffle/drawing where their funds are locked for a certain amount of time
- They initiated a withdrawal, meaning that they want a payout
- Their account has been flagged(!) and their funds are locked to prevent fraud
Since all events regarding a miner's funds require a lock of some type (whether it be a payout, or otherwise) we can have this generic model and build on top of it at a later time

Here is an explanation of the different fields for a credit event:
```
id: Unique integer id of the credit event
uuid: uuid of the miner
amount: (in Myriade Credits) the amount of funds locked 
lockType: Type of credit lock:
0 -> Admin event, the admin has decided to lock the funds for some specified reason
1 -> Raffle event, the miner has bought a ticket and their funds have been subtracted the ticket price
2 -> Withdrawal event, the funds are set to be withdrawn
3... -> To be defined

status: Status of the locked funds: 
-1 -> Error, there is an issue with the funds in question
0 -> To be collected into a central fund
1 -> Active lock, should be moved after an event trigger

eventTime: Time of the credit lock

comments: User defined, can add notes here for further clarity/info

```
# TeaHub welcome telegram bot

The bot which says "hello" to all the _TeaHUB_ telegram group members, once they enter the office.

Uses _office time_ application on behalf of the authorized user to access the office entry events for the other people. Also, supports `/who` command which lists chat members who entered office today (that does _not_ mean chat member is _currently_ in the office though). 

## Setup

```
npm install
cp config-sample.ts config.ts
```

Set proper values in the `config.ts`:

 - `botToken` - Telegram bot token
 - `apiToken` - Is a login / password information in a basic auth format for the _office time_ application (header part after `Authorization: Basic `). You can lookup the token in the _office time_ application using browser debug panel, or generate it e.g. [here](https://www.blitter.se/utils/basic-authentication-header-generator/).
 - `chatId` - Telegram chat ID. There are some telegram bots which allow you to lookup the group chat ID.

 ## Run in development mode

 `npm run dev`

 This command starts the bot using ts-node-dev. This means bot will be re-started each time you update the code. Also, if program exists for whatever reason - it will be re-started.

 ## Run for real with pm2

 `npm start`

___Important:__ This command requires [pm2](http://pm2.keymetrics.io/) process manager installed globally._

It starts a background process, known to pm2 as "teahub". You may use that to see the process' status overview with `pm2 list`, detailed status with `pm2 show teahub`, view logs with `pm2 logs teahub`.

To stop background process - run `npm stop` or `pm2 stop teahub`.

___Note:__ in this mode process is not restarted upon file changes. You need to restart it manually with `pm2 restart teahub`._

## Deploy
___TODO__: document deploy process with pm2._

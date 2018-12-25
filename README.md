# TeaHub welcome telegram bot

The bot which says "hello" to all the _TeaHUB_ telegram group members, once they enter the office.

Uses _office time_ application on behalf of the authorized user to get the list of the people in the office.

## Setup

```
npm install
cp config-sample.ts config.ts
```

Edit config.ts. There:

 - `botToken` - Telegram bot token
 - `apiToken` - Is a login / password information in a basic auth format for the _office time_ application (header part after `Authorization: Basic `). You can lookup the token in the _office time_ application using browser debug panel, or generate it e.g. [here](https://www.blitter.se/utils/basic-authentication-header-generator/).
 - `chatId` - Telegram chat ID. There are some telegram bots which allow you to lookup the group chat ID.

 ## Run in development mode

 `npm run dev`
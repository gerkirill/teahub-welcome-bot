import * as  TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs-extra';
import * as path from 'path';
// -1001156466676

import {
  fetchOfficeTimeEvents, OfficeLocation, OfficeTimeEvent,
  PassDirection, OfficeTimeUnauthorizedError 
} from 'gl-office-time-api';

import { EMPLOYEES } from './employees';
import { JOKES } from './jokes';
import { config } from './config';

const BOT_TOKEN: string = config.botToken;
const API_TOKEN: string = config.apiToken
const CHAT_ID: string = config.chatId;

const IDLE_INTERVAL_MINUTES = 1;
const IDLE_INTERVAL = IDLE_INTERVAL_MINUTES * 60 * 1000;
const OFFICE_TIME_TIMEOUT = 10 * 1000;
const TODAY_CACHE_FILE = path.join(__dirname, 'data', 'today.json');

let today = {
  date: 0,
  employees: <number[]>[]
};
try {
  today = fs.readJsonSync(TODAY_CACHE_FILE);
} catch (e) { }

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/who/, msg => {
  const inOfficeStr = EMPLOYEES.filter((emp) => today.employees.includes(emp.id))
    .map((emp) => emp.name)
    .join(', ');
  bot.sendMessage(msg.chat.id, inOfficeStr ? `Были замечены в офисе: ${inOfficeStr}` : 'Пока никто в офис не приходил.');
});

async function main() {
  try {
    const from = new Date().setHours(7, 0, 0, 0);
    const till = new Date().setHours(23, 59, 59, 0);
    if (today.date != from) {
      today.date = from;
      today.employees = [];
    }
    const onesToCheck = EMPLOYEES.filter(emp => !today.employees.includes(emp.id));

    const responses = await Promise.all(
      onesToCheck.map(async employee => {
        var events: OfficeTimeEvent[] = [];
        try {
          events = await fetchOfficeTimeEvents(OfficeLocation.ODS, employee.id, from, till, API_TOKEN, OFFICE_TIME_TIMEOUT);
        } catch (err) {
          console.error(`Error obtaining user events from the Office Time: ` + err);
          if (err instanceof OfficeTimeUnauthorizedError) throw err;
        }
        // const json = JSON.parse('[{"timestamp":"2018\/07\/09 08:46:33","locationid":16,"direction":"in","area":"ODS4","working":true},{"timestamp":"2018\/07\/09 09:41:07","locationid":17,"direction":"out","area":"ODS4","working":true}]');
        return { employee: employee, atWork: events.some(record => record.direction === PassDirection.in) };
      })
    );
    responses.filter(resp => resp.atWork).forEach(resp => {
      console.log(`${resp.employee.name} теперь в офисе!`);

      let prefix = '';
      if (resp.employee.special) {
        prefix = JOKES[Math.round(Math.random() * (JOKES.length - 1))] + ' ';
      }
      bot.sendMessage(CHAT_ID, prefix + `${resp.employee.name} теперь в офисе!`);
      today.employees.push(resp.employee.id);
      fs.writeJsonSync(TODAY_CACHE_FILE, today);
    });
  } catch (e) {
    console.error(e);
    if (e instanceof OfficeTimeUnauthorizedError) {
      console.error('Office Time returns 401 Unauthorized. Terminating to avoid account lock.');
      return;
    }
  }
  setTimeout(main, IDLE_INTERVAL);
}

main();


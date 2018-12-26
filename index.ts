import * as fetch from 'node-fetch';
import * as  TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs-extra';
import * as path from 'path';
// -1001156466676
import { config } from './config';

class FetchStatusError extends Error {
  response: any
}

class OfficeTimeUnauthorizedError extends Error {

}

enum OfficeTimeZone {
  ODS = 'ODS'
}

const BOT_TOKEN = config.botToken;
const API_TOKEN = config.apiToken
const CHAT_ID = config.chatId;

const IDLE_INTERVAL_MINUTES = 1;
const IDLE_INTERVAL = IDLE_INTERVAL_MINUTES * 60 * 1000;
const OFFICE_TIME_TIMEOUT = 10 * 1000;
const TODAY_CACHE_FILE = path.join(__dirname, 'data', 'today.json');

const EMPLOYEES = [
  { id: 190, name: 'Кирилл', special: true },
  { id: 330, name: 'Таня', special: false },
  { id: 403, name: 'Денис', special: false },
  { id: 331, name: 'Максим', special: false },
  { id: 258, name: 'Тарас', special: false },
  { id: 371, name: 'Света', special: true },
  { id: 388, name: 'Саша', special: false },
  { id: 313, name: 'Наташа', special: false },
  { id: 96, name: 'Алёнка', special: false },
  { id: 315, name: 'Алёна', special: false },
  { id: 370, name: 'Маша', special: false },
];
const JOKES = [
  'Очешуеть!',
  'Это шо ж такое творится?',
  'Ви таки не повегите...',
  'Мечты сбываются.', 
  'Сначала Плутон – не планета, а тут и',
  'Сохраняйте спокойствие,',
  'Чувствуете, как всё изменилось? Это потому, что',
  'Грабьте караваны, не щадите гусей, ведь',
  'Всё страньше и страньше, всё чудесатее и чудесатее. Вот и',
  'Никогда такого не было, и вот опять:',
  'Ёбышки-воробышки..',
  'ААААААААААА!',
  'Нет слов.',
  'Ой всё.',
  'Вжу-у-у-у-у-х! и..'
];
let today = {
  date: 0,
  employees: []
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
        var events = [];
        try {
          events = await fetchOfficeTimeEvents(OfficeTimeZone.ODS, employee.id, from, till, API_TOKEN, OFFICE_TIME_TIMEOUT);
        } catch (err) {
          console.error(`Error obtaining user events from the Office Time: ` + err);
          if (err instanceof FetchStatusError && err.response.status === 401) throw new OfficeTimeUnauthorizedError();
        }
        // const json = JSON.parse('[{"timestamp":"2018\/07\/09 08:46:33","locationid":16,"direction":"in","area":"ODS4","working":true},{"timestamp":"2018\/07\/09 09:41:07","locationid":17,"direction":"out","area":"ODS4","working":true}]');
        return { employee: employee, atWork: events.some(record => record.direction == 'in') };
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

async function fetchOfficeTimeEvents(
  zone: OfficeTimeZone,
  employeeId: number,
  fromTime: number,
  tillTime: number,
  basicAuthToken: string,
  timeout: number
  ) {
  const resp = await fetch(
    `https://portal-ua.globallogic.com/officetime/json/events.php?` + 
    `zone=${zone}&employeeId=${employeeId}&from=${fromTime}&till=${tillTime}`,
    { headers: { Authorization: `Basic ${basicAuthToken}` }, timeout: timeout },
  );
  const respText = await resp.text();
  if (!resp.ok) {
    const err = new FetchStatusError('response was not OK. Status:' + resp.status +' Text:' + respText);
    err.response = resp;
    throw err;
  }
  return JSON.parse(respText);
}

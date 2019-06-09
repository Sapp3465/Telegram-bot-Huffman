'use strict';

function dictionary(text) {
  const freqs = text => [...text].reduce((fs, c) => (fs[c] ? (fs[c] = fs[c] + 1, fs) : (fs[c] = 1, fs)), {});
  const topairs = freqs => Object.keys(freqs).map(c => [c, freqs[c]]);
  const sortps = pairs  => pairs.sort((a, b) => a[1] - b[1]);
  const tree = ps => (ps.length < 2 ? ps[0] : tree(sortps([[ps.slice(0, 2), ps[0][1] + ps[1][1]]].concat(ps.slice(2)))));
  const codes = (tree, pfx = '')  => (tree[0] instanceof Array ? Object.assign(codes(tree[0][0], pfx + '0'), codes(tree[0][1], pfx + '1')) : { [tree[0]]: pfx });
  return codes(tree(sortps(topairs(freqs(text)))));
}

function encode(str) {
  let output = 'Encoded text:';
  for (const l in str) {
    output = output + ' ' + dictionary(str)[str[l]];
  }
  return output;
}

function decode(str, dictionary) {
  const arr = str.split(' ');
  let output = 'Decoded text: ';
  const lettersArr = Object.keys(dictionary);
  const valuesArr = Object.values(dictionary);
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < valuesArr.length; j++) {
      if (arr[i] == valuesArr[j]) {
        output += lettersArr[j];
      }
    }
  }
  return output;
}

const TelegramBot = require('node-telegram-bot-api');
const token = 'here_is_my_token';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hi, I\'m an Encoder, what can I help?', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Encrypt the text',
            callback_data: 'Encrypt'
          },
          {
            text: 'Decrypt the text',
            callback_data: 'Decrypt'
          }
        ]
      ]
    }
  });
});

const comands = [];
const massages = [];
const dictionaries = [];

bot.on('callback_query', query => {
  const id = query.message.chat.id;
  const data = query.data;
  if (data === 'Encrypt') {
    bot.sendMessage(id, 'Enter a text:');
    comands[0] = 'Encrypt';
  }
  if (data === 'Decrypt') {
    bot.sendMessage(id, 'Enter encoded text:');
    comands[0] = 'Decrypt';
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  massages[0] = msg.text;
  if (comands[0] == 'Encrypt' && massages[0] != '/start') {
    const test = dictionary(massages[0]);
    bot.sendMessage(chatId, 'Dictionary: ' + JSON.stringify(test));
    bot.sendMessage(chatId, encode(massages[0]));
    comands[0] = null;
  }
  if (comands[0] == 'Decrypt' && massages[0] != '/start' && dictionaries.length == 0) {
    dictionaries[0] = msg.text;
    bot.sendMessage(chatId, 'Enter a dictionary:');
  }
  if (comands[0] == 'Decrypt' && massages[0] != '/start' && dictionaries.length == 1) {
    const dict = JSON.parse(massages[0]);
    bot.sendMessage(chatId, decode(dictionaries[0], dict));
    dictionaries.shift();
  }
});

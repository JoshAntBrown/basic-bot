'use strict';

const natural = require('natural');
const TfIdf = natural.TfIdf;
const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length; // Helper function

class Bot {
  constructor() {
    this.tfidf = new TfIdf();
    this.commands = {};
  }

  createCommand(id, examples, callback) {
    if (examples.length < 0) throw new Error('Must define an example command as array');

    this.commands[id] = {
      examples,
      execute: callback
    };

    this.updateCommands();
  }

  updateCommands() {
    for(let id in this.commands) {
      let command = this.commands[id];
      this._addCommand(id, command.examples);
    }
  }

  _addCommand(id, examples) {
    examples.forEach(example => {
      this.tfidf.addDocument(example, id);
    });
  }

  parse(query, callback) {
    let request = {
      query
    };

    let measurements = {};
    this.tfidf.tfidfs(query, function(idx, measurement, commandId) {
      measurements[commandId] = measurements[commandId] || [];
      measurements[commandId].push(measurement);
    });

    let commands = [];
    for (var id in measurements) {
      commands.push({
        id,
        averageScore: average(measurements[id])
      });
    }

    commands = commands.sort((a, b) => b.averageScore - a.averageScore);
    let command = commands[0];

    if (command.averageScore <= 0) return callback('Sorry, I don\'t understand what you said!');

    return this.commands[command.id].execute(request, callback);
  }
}

let bot = new Bot();

bot.createCommand('age', [
  'How old are you?',
  'How young are you?',
  'Whens your birthday?',
  'When is your birthday?'
], (req, callback) => {
  callback('old.');
});

bot.createCommand('name', [
  'Whats your name?',
  'What is your name?',
  'name?',
  'what are you called?'
], (req, callback) => {
  callback('bot.');
});

bot.parse('yo dawg, whatz your name?', (res) => {
  console.log(res);
  bot.parse('how old are ya?', (res) => {
    console.log(res);
    bot.parse('yo the weather like today?', (res) => {
      console.log(res);
    });
  });
});

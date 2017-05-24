const Rabbit = require('redox-rabbit');
const fs = require('fs');
const Observable = require('rxjs/Rx').Observable;

const activeQueueName = 'NEW_ACTIVE_1';

const rabbit = Rabbit.createClient();

const process = m => Observable.create(o => {
  const id = m.content.id;
  const delay = m.content.delay;
  const source = m.content.source;
  console.log('***')
  console.log(`receiving ${id}:${source}`);
  setTimeout(() => {
    console.log(`processed ${id}:${source}`);
    o.next(m);
    o.complete();
  }, delay);
});


var handler = (() => {
  var cache = {};
  return message => {
    if (!message.content.reject) {
      console.log('resolving')
      message.ack();
    } else if (cache[message.content.id] > 1) {
      console.log('resolving');
      message.ack();
    } else {
      cache[message.content.id] = (cache[message.content.id] || 0) + 1;
      message.nack();
    }
  }
})()


rabbit.then(client => {
  client.observe(activeQueueName)
    .concatMap(process)
    .subscribe(handler, a => console.log(a), e => console.log(e));
});


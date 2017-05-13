const Rabbit = require('redox-rabbit');
const fs = require('fs');
const Observable = require('rxjs/Rx').Observable;

const activeQueueName = 'ACTIVE';

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

rabbit.then(client => {
  client.observe(activeQueueName)
    .concatMap(process)
    .subscribe(message => {
      if (message.content.reject) {
        message.ack()
      } else {
        message.ack();
      }
    }, a => console.log(a), e => console.log(e));
});


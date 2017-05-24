'use strict';

const createClient = require('redox-rabbit').createClient;
const Observable = require('rxjs/Rx').Observable;
const sourceQueueNames = ['SOURCE-1'];
const activeQueueName = 'ACTIVE';

const rabbit = createClient();

rabbit.then(Rabbit => {


  Rabbit.addQueue('NEW_SOURCE_1', { destination: 'NEW_ACTIVE_1', ordered: false }).then(() => {
    Observable.interval(4000)
      .take(8)
      .do(i => console.log(`sending ${i}`))
      .concatMap(i =>
        Rabbit.send('NEW_SOURCE_1', {
          id: i,
          delay: 1000 * i,
          reject: i % 3 === 1
        })
        .then(() => i)
      )
      .subscribe(i => {
        console.log(`sent ${i}`);
      });
  });

/*
  function createSourceQueue(name, options){
    Rabbit.addQueue(name, options, function(err){
      if(err){
        return console.error(err);
      }
      for(let i = count; i > 0; i--){
        const id = count - i; //in increasing order
        const msg = {
          id: id,
          source: name,
          delay: 1000 * i
        };
        //send a few immediately to test timing
        if(id < 3){
          Rabbit.send(name, msg, err => {
            err ?
              console.error('error',err) :
              console.log('sent', msg); });
        } else if (id === 4) {
          msg.reject = true;
          setTimeout(() =>
            Rabbit.send(name, msg, err => {
              err ?
                console.error('error',err) :
                console.log('sent', msg); 
            }), 4000);
        } else {
          setTimeout(() => {
            Rabbit.send(name, msg, err => {
              err ?
                console.error('error',err) :
                console.log('sent', msg);
            });
          }, id * 500);
        }
      }
    });
  }

  //send test jobs for each source
  //these MUST maintain order
  //in this case we're sending the longest processing first
  //to confirm jobs returns in order regardless of proessing time
  sourceQueueNames.forEach(name => createSourceQueue(name, {
    destination: activeQueueName
  }));
  */
});

const keys = require('./keys')
const redis = require('redis')

const client = redis.createClient({
    host: keys.redis_host,
    port: keys.redis_port,
    retry_strategy: ()=> 1000
});

const sub = client.duplicate();

fib = (idx) => {
    if(idx<2) {
        return 1;
    }
    return fib(idx-1) + fib(idx-2); 
}

sub.subscribe('insert');

sub.on('message', (channel, msg) => {
    client.hset('values', msg, this.fib(parseInt(msg)))
});

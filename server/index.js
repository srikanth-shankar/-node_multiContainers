const keys = require('./keys')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    password: keys.pgPwd,
    database: keys.pgDb,
    port: keys.pgPort,
    host: keys.pgHost
});

pgClient.on('error', () => console.log("Lost pg conn'n"))

pgClient
    .query('create table if not exists values (number INT)')
    .catch(err => console.log)

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redis_host,
    port: keys.redis_port
});

const redisPub = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send('hi')
});

app.get('/values/all', async (req, res)=>{
    const vals = await pgClient.query('select * from values')
    res.send(vals.rows);
});

app.get('/values/current', (req, res)=>{
    redisClient.hgetall('values', async (err, vals) => {
        res.send(vals);
    })
});

app.post('/values', (req, res)=>{
    const idx = req.body.idx;
    redisClient.hset('values', index, 'nothing yet')
    redisPub.publish('insert', idx)
    pgClient.query('insert into values(number) VALUES($1)', [idx])
    res.send('working')
})

app.listen(3000, ()=>{
    console.log('listening')
})
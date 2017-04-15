'use strict';

const crypto = require('crypto');
const Koa = require('koa');
const _ = require('koa-route');
const bodyParser = require('koa-bodyparser');
const axios = require('axios');

const HOST = 'api.line.me';
const {
  CHANNEL_SECRET,
  CHANNEL_ACCESS_TOKEN,
  FIXED_MESSAGE,
} = process.env;
const PORT = process.env.PORT || 3000;

const app = new Koa();

// axios
axios.defaults.headers.common.Authorization = `Bearer ${CHANNEL_ACCESS_TOKEN}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// axios.interceptors.request.use(function (config) {
//   console.log(config);
//   return config;
// }, function (error) {
//   console.log(error);
//   return Promise.reject(error);
// });

function sendMessage(message) {
  return axios.post(`https://${HOST}/v2/bot/message/reply`, message);
}

function validateSignature(signature, body) {
  return signature === crypto.createHmac('sha256', CHANNEL_SECRET)
    .update(Buffer.from(JSON.stringify(body))).digest('base64');
}

async function validater(ctx, next) {
  if (!validateSignature(ctx.get('x-line-signature'), ctx.request.body)) {
    ctx.throw(403);
  } else {
    await next();
  }
}

async function responseTime(ctx, next) {
  const start = Date.now();
  await next();
  const elapsed = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${elapsed}ms`);
}

async function error(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
}

const routes = {
  callback: async (ctx) => {
    const { body } = ctx.request;
    const webhookEvent = (body.events && body.events[0]) || {};
    const eventType = webhookEvent.type;
    const messageType = webhookEvent.message && webhookEvent.message.type;

    if (eventType !== 'message' || messageType !== 'text') {
      ctx.status = 500;
      ctx.body = 'NG';
      return;
    }

    const receivedText = webhookEvent.message.text;
    const responseText = FIXED_MESSAGE || receivedText;
    const message = {
      replyToken: webhookEvent.replyToken,
      messages: [{
        type: 'text',
        text: responseText,
      }],
    };

    await sendMessage(message);
    ctx.body = 'OK';
  },
};

app.use(responseTime);
app.use(bodyParser());
app.use(error);
app.use(validater);
app.use(_.post('/callback', routes.callback));
app.listen(PORT);

console.log(`Server running at ${PORT}`);

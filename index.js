require = require("esm")(module);

const { Server, Origins } = require('boardgame.io/server');
const static = require('koa-static');
const mount = require('koa-mount');
const { Briscola } = require("./src/Game");

const server = Server({
  games: [Briscola],

  origins: [
    // Allow your game site to connect.
    'https://briscola.webabile.it',
    // Allow localhost to connect
    Origins.LOCALHOST
  ],
});

server.app.use(mount('/app', static('./build')));

server.run(process.env.SERVER_PORT);
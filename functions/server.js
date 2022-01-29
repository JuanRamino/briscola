require = require("esm")(module);

const serverless = require('serverless-http');
const { Server, Origins } = require('boardgame.io/server');
const { Briscola } = require("../src/Game");

const server = Server({
  games: [Briscola],

  origins: [
    // Allow your game site to connect.
    'https://briscola.webabile.it',
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT
  ],
});

module.exports = server;
exports.handler = serverless(server.app);
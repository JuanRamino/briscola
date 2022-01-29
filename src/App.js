import "./styles.css";
import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { SocketIO } from 'boardgame.io/multiplayer'
import { Briscola } from "./Game";
import Board from "./Board";

var BriscolaClient = Client({
  board: Board,
  game: Briscola,
  debug: true,
  multiplayer: SocketIO({ server: "http://briscola.webabile.it/.netlify/functions/server" })
});

export default function App() {
  return (
    <div id="App">
      <BriscolaClient playerID="0" />
      <BriscolaClient playerID="1" />
    </div>
  );
}

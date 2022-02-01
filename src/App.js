import "./styles.css";
import React, { useEffect, useState } from "react";
import { Client } from "boardgame.io/react";
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer'
import { Briscola } from "./Game";
import Board from "./Board";

const lobbyClient = new LobbyClient({
  server: `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`
});

var BriscolaClient = Client({
  board: Board,
  game: Briscola,
  debug: true,
  multiplayer: SocketIO({ server: `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}` }),
});

export default function App() {
  const [matches, setMatches] = useState("");
  const [playerID, setPlayer] = useState("");

  useEffect(() => {
    const fetchMatches= async () => {
        try {
            const { matches }  = await lobbyClient.listMatches('default');
            console.log(matches);
            setMatches(matches);
        } catch (error) {
            console.log("error", error);
        }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    const createMatch= async () => {
        try {
          const { matchID } = await lobbyClient.createMatch('default', {
            numPlayers: 2
          });
          console.log(matchID);
          setMatches([...matches, matchID]);
        } catch (error) {
          console.log("error", error);
        }
    };
    createMatch();
  }, []);

  useEffect(() => {
    const joinMatch= async () => {
        try {
          const { playerCredentials, playerID } = await lobbyClient.joinMatch(
            'default',
            'T7K2xkOiHnM',
            {
              playerName: 'Alice',
            }
          );
          console.log(playerID);
          setPlayer(playerID);
        } catch (error) {
          console.log("error", error);
        }
    };
    joinMatch();
  }, [match]);

  useEffect(() => {
    const leaveMatch= async () => {
        if (playerID) {
          try {
            await lobbyClient.leaveMatch('default', 'matchID', {
              playerID: '0',
              credentials: 'playerCredentials',
            });
            console.log(playerID);
            setPlayer(null);
          } catch (error) {
            console.log("error", error);
          }
        }
    };
    leaveMatch();
  }, [playerID]);

  // const { nextMatchID } = await lobbyClient.playAgain('default', 'matchID', {
  //  playerID: '0',
  //  credentials: 'playerCredentials',
  // });

  return (
    <div id="App">
      <BriscolaClient playerID="0" />
      <BriscolaClient playerID="1" />
    </div>
  );
}

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
  const [match, setMatche] = useState("");
  const [player, setPlayer] = useState({ID: null, credentials: null});

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
        console.log('create match');
        const { matchID } = await lobbyClient.createMatch('default', {
          numPlayers: 2
        });
        console.log('created match %s', matchID);
        setMatches([...matches, matchID]);
        setMatche(matchID);
      } catch (error) {
        console.log("error", error);
      }
    };
    createMatch();
  }, []);

  useEffect(() => {
    const joinMatch= async () => {
      if (match) {
        try {
          console.log('join match', match);
          const { playerCredentials, playerID } = await lobbyClient.joinMatch(
            'default',
            match,
            {
              playerName: 'Alice',
            }
          );
          console.log('player %s join match with credentials %s', playerID, playerCredentials);
          setPlayer({
            ID: playerID,
            credentials: playerCredentials,
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    };
    joinMatch();
  }, [match]);

  useEffect(() => {
    const leaveMatch= async () => {
      if (player.ID) {
        try {
          console.log('player %s leave match %s', player.ID, match);
          await lobbyClient.leaveMatch('default', match, {
            playerID: player.ID,
            credentials: player.credentials,
          });
          setPlayer({
            ID: null,
            credentials: null
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    };
    leaveMatch();
  }, [player]);

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

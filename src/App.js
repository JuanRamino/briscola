import "./styles.css";
import React, { useEffect, useState } from "react";
import { Client } from "boardgame.io/react";
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer'
import { generateUsername } from "unique-username-generator";
import { Briscola } from "./Game";
import Board from "./Board";

const lobbyClient = new LobbyClient({
  server: `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`
});

const replace = (array, index, ...items) => [
  ...array.slice(0, index),
  ...items, 
  ...array.slice(index + 1)
];

var BriscolaClient = Client({
  board: Board,
  game: Briscola,
  debug: true,
  multiplayer: SocketIO({ server: `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}` }),
});

export default function App() {
  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState("");
  const [player, setPlayer] = useState({ID: null, credentials: null, name: generateUsername("_", 0, 13)})

  const createMatch = async () => {
    try {
      console.log('create match');
      const { matchID } = await lobbyClient.createMatch('default', {
        numPlayers: 2
      });
      console.log('created match %s', matchID);
      await joinMatch(matchID);
      
      const matchData  = await lobbyClient.getMatch('default', matchID);
      const foundIndex = matches.findIndex((m) => m.matchID === matchID);

      setMatches(replace(matches, foundIndex, matchData));
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchMatches = async () => {
    try {
        const { matches }  = await lobbyClient.listMatches('default');
        console.log('Match list %s', matches);
        setMatches(matches);
    } catch (error) {
        console.log("error", error);
    }
  };

  const joinMatch= async (matchID, playerName) => {
    if (matchID) {
      try {
        console.log('join match %s', matchID);
        const { playerCredentials, playerID } = await lobbyClient.joinMatch(
          'default',
          matchID,
          {
            playerName,
          }
        );
        console.log('player %s join match with credentials %s', playerID, playerCredentials);
        setPlayer({
          ID: playerID,
          credentials: playerCredentials,
          name: playerName
        });
        setMatch(matchID)
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const leaveMatch = async () => {
    if (player.ID && match) {
      try {
        console.log('player %s leave match %s', player.ID, match);
        await lobbyClient.leaveMatch('default', match, {
          playerID: player.ID,
          credentials: player.credentials,
        });
        setPlayer({
          ...player,
          ID: null,
          credentials: null
        });
        setMatch("");
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const playAgain = async () => {
    if (player.ID) {
      try {
        console.log('player %s leave match %s', player.ID, match);
        const { nextMatchID } = await lobbyClient.playAgain('default', match, {
          playerID: player.ID,
          credentials: player.credentials,
        });
        setMatch(nextMatchID);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [match]);

  const drawLobby = () => {
    const list = matches.map(({ matchID, players }, i) => {
      return (
        <li key={i}>
          <button
            disabled={!!match || (players.filter((p) => p.name).length === 2)}
            onClick={() => joinMatch(matchID, player.name)}
          >
            join
          </button>
          <button
            disabled={!match || match !== matchID}
            onClick={() => leaveMatch()}
          >
            leave
          </button>
          <span>
            { matchID } - { players.map((p) => p.name).join(' | ') }
          </span>
        </li>
      );
    });

    return (
      <div>
        <p>Player: {player.name}</p>
        <ul>{list}</ul>
        <button disabled={!!match} onClick={ () => createMatch() }>create match</button>
      </div>
    ); 
  }

  return (
    <div id="App">
      { drawLobby() }
      { player.ID && player.credentials && match
        && <BriscolaClient credentials={player.credentials} playerID={player.ID} matchID={match} /> }
    </div>
  );
}

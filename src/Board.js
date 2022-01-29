import React from "react";
import "./board.css";

export default function Board({ G, ctx, moves, isActive, playerID }) {
  const drawHand = () => {
    const hand = G.hand.find((h) => h.playerID === playerID);
    const desk = G.hand.find((h) => h.desk);

    const cells = hand.cards.map((card, i) => (
      <td
        key={i}
        className={isActive ? "" : "disabled"}
        onClick={() => moves.playCard(i)}
      >
        {card.value}
        <br />
        {card.seed}
      </td>
    ));

    return (
      <div>
        <p>
          Hand: {desk.count[0]}/{desk.count[1]}
        </p>
        <table className="hand">
          <tbody>
            <tr>{cells}</tr>
          </tbody>
        </table>
      </div>
    );
  };

  const drawDesk = () => {
    const desk = G.hand.find((h) => h.desk);
    const cells = desk.cards.map((card, i) => (
      <td key={i}>
        {card.value}
        <br />
        {card.seed}
      </td>
    ));

    const lastResult =
      desk.lastResult && desk.lastResult.winner ? (
        <div>
          <p>Last result:</p>
          <ul>
            <li>Player {desk.lastResult.winner} win</li>
            <li>{desk.lastResult.hand}</li>
          </ul>
        </div>
      ) : (
        <div></div>
      );

    return (
      <div>
        <p>Desk</p>
        <table className="desk">
          <tbody>
            <tr>{cells}</tr>
          </tbody>
        </table>
        {lastResult}
      </div>
    );
  };

  let winner = "";
  if (ctx && ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div className="winner">
          Game Winner is Player {ctx.gameover.winner} with {ctx.gameover.score}{" "}
          points
        </div>
      ) : (
        <div className="winner">Draw!</div>
      );
  }

  return (
    <div className="board">
      <p>
        <span>Player {playerID}</span>
        {isActive && <span>&nbsp;Your turn!</span>}
      </p>
      <p>Briscola is: {G.briscola.seed}</p>
      <table className="briscola">
        <tbody>
          <tr>
            <td>
              {G.briscola.value}
              <br />
              {G.briscola.seed}
            </td>
          </tr>
        </tbody>
      </table>
      {drawHand()}
      {drawDesk()}
      <p>{winner}</p>
    </div>
  );
}

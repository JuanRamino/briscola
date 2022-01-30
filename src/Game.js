import shuffle from "lodash/shuffle";
import every from "lodash/every";
import sortBy from "lodash/sortBy";

const seeds = Object.freeze(["spade", "bastoni", "coppe", "denari"]);
const values = Object.freeze([
  "2",
  "4",
  "5",
  "6",
  "7",
  "fante",
  "cavallo",
  "re",
  "tre",
  "asso"
]);
const score = Object.freeze({
  fante: 2,
  cavallo: 3,
  re: 4,
  tre: 10,
  asso: 11
});

const getScore = (value) => score[value] || 0;

const getWinner = (G) => {
  const reducer = (acc, card) => acc + getScore(card.value);
  const scored = G.score.map((s) => ({
    playerID: s.playerID,
    score: s.cards.reduce(reducer, 0)
  }));

  if (scored[0].score === scored[1].score) {
    return { draw: true };
  }

  const sorted = sortBy(scored, "score");
  return { winner: sorted[1].playerID, score: sorted[1].score };
};

const prepareDeck = (ctx) => {
  // dealer play first
  const dealer = ctx.playOrder[0];
  const player = ctx.playOrder[1];
  const deck = [];

  for (const seed of seeds) {
    for (const value of values) {
      deck.push({
        seed,
        value
      });
    }
  }

  const shuffled = shuffle(deck);
  const dealerCards = shuffled.splice(0, 3);
  const playerCards = shuffled.splice(0, 3);
  const briscola = shuffled.shift();
  shuffled.push(briscola);

  return {
    // [{ value: 'due', seed: 'spade' }]
    deck: shuffled,
    // [{ playerID: 0, cards: [{ value: 'due', seed: 'spade' }] }]
    hand: [
      {
        playerID: dealer,
        cards: dealerCards
      },
      {
        playerID: player,
        cards: playerCards
      },
      {
        desk: true,
        cards: [],
        lastResult: {
          winner: null,
          hand: null
        },
        count: [0, (seeds.length * values.length) / 2]
      }
    ],
    // { value: 'due', seed: 'spade' }
    briscola,
    // [{ playerID: 0, cards: [{ value: 'due', seed: 'spade' }] }]
    score: [
      {
        playerID: player,
        cards: []
      },
      {
        playerID: dealer,
        cards: []
      }
    ]
  };
};

const playCard = (G, ctx, i) => {
  const hand = G.hand.find((h) => h.playerID === ctx.currentPlayer);
  const card = hand.cards.splice(i, 1)[0];
  card.playerID = ctx.currentPlayer;

  const desk = G.hand.find((h) => h.desk);
  desk.cards.push(card);

  if (desk.cards.length === 2) {
    endTurn(G, ctx);
  }
};

const getHandWinner = (firstCard, lastCard, briscolaSeed) => {
  if (
    (firstCard.seed === lastCard.seed &&
      values.indexOf(lastCard.value) > values.indexOf(firstCard.value)) ||
    lastCard.seed === briscolaSeed
  ) {
    return {
      winner: lastCard,
      loser: firstCard
    };
  }

  return {
    loser: lastCard,
    winner: firstCard
  };
};

const endTurn = (G, ctx) => {
  const desk = G.hand.find((h) => h.desk);
  const firstCard = desk.cards[0];
  const lastCard = desk.cards[1];

  const { winner, loser } = getHandWinner(firstCard, lastCard, G.briscola.seed);
  const winnerScore = G.score.find((s) => s.playerID === winner.playerID);

  winnerScore.cards = winnerScore.cards.concat(desk.cards.splice(0, 2));
  desk.lastResult = {
    winner: winner.playerID,
    hand: `${winner.value} ${winner.seed} > ${loser.value} ${loser.seed}`
  };
  ctx.events.endTurn({ next: winner.playerID });
};

const drawCard = (G, ctx) => {
  const hand = G.hand.find((h) => h.playerID === ctx.currentPlayer);
  const desk = G.hand.find((h) => h.desk);
  if (ctx.currentPlayer === ctx.playOrder[0]) {
    desk.count[0] = desk.count[0] + 1;
  }

  if (G.deck.length && hand.cards.length < 3) {
    hand.cards.push(G.deck.shift());
  }
};

export const Briscola = {
  setup: (ctx) => ({
    ...prepareDeck(ctx)
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
    onBegin: drawCard
  },
  moves: {
    playCard
  },

  endIf: (G, _ctx) => {
    const playersHand = G.hand.filter((h) => !h.desk);
    if (
      G.deck.length === 0 &&
      every(playersHand, (h) => h.cards.length === 0)
    ) {
      return getWinner(G);
    }
  },

  minPlayers: 2,
  maxPlayers: 2
};

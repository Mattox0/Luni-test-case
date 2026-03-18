# Luni Test Case

## Requirements

- Node.js >= 18
- Yarn

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
yarn start:dev

# production
yarn build && yarn start:prod
```

The server starts on `http://localhost:3000`.

## API

### GET /users/:userId/series/:seriesId/feed
Returns the ordered list of episodes in a series for a given user, with their unlock status and progress.

### POST /users/:userId/unlock
Unlocks a single premium episode.
```json
{ "episodeId": "ep-104" }
```

### POST /users/:userId/unlock-batch
Unlocks all remaining locked episodes in a series at the batch price (7 coins/episode).
```json
{ "seriesId": "series-1" }
```

### GET /users/:userId/next
Returns the next episode to watch for each series the user has activity in.

## Pricing

| Context | Price |
|---|---|
| Single unlock (normal) | 10 coins |
| Single unlock (happy hour 18h–20h UTC) | 8 coins |
| Batch unlock (per episode) | 7 coins |

## Tests

```bash
# unit tests
yarn test

# unit tests (watch)
yarn test:watch

# coverage
yarn test:cov
```

## Data

Static JSON files loaded at startup from `data/`:
- `catalog.json` — series and episodes
- `users.json` — users, balances and watch history

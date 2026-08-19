# Apify — AI Skill

## Capability
Apify web scraping and automation platform integration. Manage actors, runs, datasets, key-value stores, schedules, and tasks via the Apify API.

## Auth
JWT token required. Apify API key must be configured via settings endpoint first.

## API Endpoints

### Settings (API Key)
- **GET /api/apify/settings** — Check if API key is configured (returns: { hasKey, maskedKey })
- **POST /api/apify/settings** — Save API key (body: { apiKey: "apify_api_..." })
- **DELETE /api/apify/settings** — Remove API key

### Actor Store
- **GET /api/apify/store** — Browse Apify actor store (query: ?search=keyword&limit=20&offset=0&category=)

### My Actors
- **GET /api/apify/actors** — List user's actors (query: ?limit=20&offset=0)
- **GET /api/apify/actors/:actorId** — Get actor details

### Run Actor
- **POST /api/apify/actors/:actorId/run** - Run an actor. Use `maxItems` for
  pay-per-result or `maxTotalChargeUsd` for pay-per-event pricing. Never send both.

### Runs
- **GET /api/apify/runs** — List user's runs (query: ?limit=20&offset=0&status=RUNNING|SUCCEEDED|FAILED|ABORTED)
- **GET /api/apify/runs/:runId** — Get run details
- **GET /api/apify/runs/:runId/log** — Get run log (returns: { log: "..." })
- **POST /api/apify/runs/:runId/abort** — Abort a running run
- **POST /api/apify/runs/:runId/resurrect** — Resurrect a failed/aborted run

### Datasets
- **GET /api/apify/datasets** — List datasets (query: ?limit=20&offset=0)
- **GET /api/apify/datasets/:datasetId/items** — Get dataset items (query: ?limit=50&offset=0)

### Key-Value Stores
- **GET /api/apify/kv-stores** — List key-value stores (query: ?limit=20&offset=0)
- **GET /api/apify/kv-stores/:storeId/keys** — List keys in a store (query: ?limit=50)
- **GET /api/apify/kv-stores/:storeId/records/:recordKey** — Get a record value

### Schedules
- **GET /api/apify/schedules** — List schedules (query: ?limit=20&offset=0)
- **POST /api/apify/schedules** — Create schedule (body: Apify schedule object)
- **DELETE /api/apify/schedules/:scheduleId** — Delete a schedule

### Tasks
- **GET /api/apify/tasks** — List actor tasks (query: ?limit=20&offset=0)
- **POST /api/apify/tasks** — Create an actor task (body: Apify task object)
- **POST /api/apify/tasks/:taskId/run** — Run a task (body: { input?: {} })
- **DELETE /api/apify/tasks/:taskId** — Delete a task

### Account
- **GET /api/apify/account** — Get Apify account info (username, email, plan, usage)

## Typical Workflows

### Run a web scraper
1. POST /api/apify/settings with API key (if not already set)
2. GET /api/apify/store?search=web+scraper to find an actor
3. POST /api/apify/actors/{actorId}/run with input JSON
4. GET /api/apify/runs/{runId} to check status (poll until SUCCEEDED)
5. GET /api/apify/datasets/{datasetId}/items to get results

### Check run results
1. GET /api/apify/runs to list recent runs
2. GET /api/apify/runs/{runId} for details (includes defaultDatasetId)
3. GET /api/apify/datasets/{datasetId}/items for scraped data

## Xquik X Actor Recipes

Use these Actors for X data. Open each listing and check its current pricing
before every run:

- [X Tweet Scraper](https://apify.com/xquik/x-tweet-scraper)
- [X Follower Scraper](https://apify.com/xquik/x-follower-scraper)

Set Actor input limits plus exactly one pricing-specific API run ceiling.
Both Xquik Actors currently use pay-per-event pricing, so these examples use
`maxTotalChargeUsd`. Replace `USER_APPROVED_CAP` before sending the request.

### Search X posts and creators

POST `/api/apify/actors/xquik~x-tweet-scraper/run`

```json
{
  "input": {
    "mode": "search",
    "twitterContent": "web scraping OR #datascience",
    "maxItems": 100,
    "outputVariant": "rich",
    "fieldStyle": "camelCase",
    "outputPreset": "flat"
  },
  "options": {
    "maxTotalChargeUsd": "USER_APPROVED_CAP"
  }
}
```

Supported tweet modes: `legacy`, `tweet`, `tweets`, `search`,
`profileTweets`, `profileReplies`, `profileMedia`, `profileLikes`,
`listTweets`, `article`, `replies`, `quotes`, `thread`, `retweeters`, and
`favoriters`.

Use the matching live-schema target field for each explicit mode. Common fields
include `twitterHandles`, `tweetIds`, `tweetUrls`, `profileUrls`, `listIds`,
`articleTweetIds`, `replyTweetIds`, `quoteTweetIds`, `threadTweetIds`,
`retweeterTweetIds`, and `favoriterTweetIds`.

### Export and compare X audiences

POST `/api/apify/actors/xquik~x-follower-scraper/run`

```json
{
  "input": {
    "twitterHandles": ["nasa", "spacex"],
    "relation": "followers",
    "maxItems": 100,
    "maxItemsPerTarget": 50,
    "outputMode": "full",
    "includeTargetMetadata": true,
    "overlapMode": true
  },
  "options": {
    "maxTotalChargeUsd": "USER_APPROVED_CAP"
  }
}
```

Supported relations: `followers`, `following`, `verified_followers`,
`list_members`, `list_followers`, and `community_members`. Use
`twitterHandles`, `listIds`, `communityIds`, or supported X URLs as targets.

`overlapMode` merges duplicate profiles while retaining every source target.
Useful filters include `minFollowers`, `maxFollowers`, `verifiedOnly`,
`verifiedType`, `hasWebsite`, `bioContains`, `locationContains`,
`usernameContains`, `minFollowing`, and `minStatuses`.

Xquik is an independent third-party service. Not affiliated with X Corp.
"Twitter" and "X" are trademarks of X Corp.

## Storage
API key stored in user settings (server-side). No local database tables.

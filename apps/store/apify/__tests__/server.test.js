const assert = require('node:assert/strict');
const test = require('node:test');

const createServer = require('../server');
const { buildRunQuery } = createServer;

test('buildRunQuery preserves one pricing-specific run ceiling', () => {
  assert.equal(
    buildRunQuery({
      memory: '512',
      timeout: 300,
      build: ' latest ',
      maxItems: '100'
    }),
    '?memory=512&timeout=300&build=latest&maxItems=100'
  );
  assert.equal(
    buildRunQuery({ maxTotalChargeUsd: '1.25' }),
    '?maxTotalChargeUsd=1.25'
  );
});

test('buildRunQuery omits controls that were not provided', () => {
  assert.equal(buildRunQuery(), '');
  assert.equal(buildRunQuery({}), '');
});

test('buildRunQuery rejects unsafe option values', () => {
  const invalidOptions = [
    null,
    [],
    { memory: true },
    { timeout: [300] },
    { memory: 0 },
    { timeout: 1.5 },
    { build: '   ' },
    { maxItems: -1 },
    { maxItems: Number.MAX_SAFE_INTEGER + 1 },
    { maxTotalChargeUsd: 'not-a-number' },
    { maxItems: 100, maxTotalChargeUsd: 1.25 }
  ];

  for (const options of invalidOptions) {
    assert.throws(() => buildRunQuery(options), TypeError);
  }
});

test('run route rejects invalid bodies before contacting Apify', async () => {
  const definition = createServer({
    authMiddleware: (_req, _res, next) => next(),
    getUserSettings: () => ({ apify_api_key: 'test-token' }),
    saveUserSettings: () => {}
  });
  const route = definition.routes.find(
    (candidate) => candidate.path === '/api/apify/actors/:actorId/run'
  );
  const handler = route.handlers.at(-1);
  const responses = [];
  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      responses.push({ status: this.statusCode, body });
    }
  };

  await handler(
    {
      body: { input: [] },
      params: { actorId: 'xquik~x-tweet-scraper' },
      user: { username: 'tester' }
    },
    response
  );
  await handler(
    {
      body: { input: {}, options: false },
      params: { actorId: 'xquik~x-follower-scraper' },
      user: { username: 'tester' }
    },
    response
  );
  await handler(
    {
      body: {
        input: {},
        options: { maxItems: 100, maxTotalChargeUsd: 1.25 }
      },
      params: { actorId: 'xquik~x-tweet-scraper' },
      user: { username: 'tester' }
    },
    response
  );

  assert.deepEqual(responses, [
    { status: 400, body: { error: 'input must be an object' } },
    { status: 400, body: { error: 'options must be an object' } },
    {
      status: 400,
      body: { error: 'select one pricing-specific run ceiling' }
    }
  ]);
});

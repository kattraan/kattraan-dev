const crypto = require('crypto');
const {
  verifyBunnyWebhookSignature,
  handleBunnyStreamWebhook,
} = require('../controllers/webhooks/bunnyStreamWebhook.controller');

jest.mock('../models/VideoContent', () => ({
  findOne: jest.fn(),
}));
jest.mock('../helpers/bunnyStream', () => ({
  getBunnyVideo: jest.fn(),
}));

const VideoContent = require('../models/VideoContent');

describe('Bunny webhook signature verification', () => {
  const secret = 'bunny-read-only-key';
  const rawBody = '{"VideoLibraryId":666121,"VideoGuid":"abc","Status":3}';

  beforeEach(() => {
    process.env.BUNNY_STREAM_WEBHOOK_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.BUNNY_STREAM_WEBHOOK_SECRET;
    delete process.env.BUNNY_API_KEY;
  });

  function sign(body) {
    return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  }

  it('accepts a valid signature', () => {
    expect(() =>
      verifyBunnyWebhookSignature(rawBody, {
        'x-bunnystream-signature': sign(rawBody),
        'x-bunnystream-signature-version': 'v1',
        'x-bunnystream-signature-algorithm': 'hmac-sha256',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid signature', () => {
    expect(() =>
      verifyBunnyWebhookSignature(rawBody, {
        'x-bunnystream-signature': 'deadbeef'.repeat(8),
        'x-bunnystream-signature-version': 'v1',
        'x-bunnystream-signature-algorithm': 'hmac-sha256',
      }),
    ).toThrow(/Invalid Bunny webhook signature/);
  });

  it('rejects when secret is missing', () => {
    delete process.env.BUNNY_STREAM_WEBHOOK_SECRET;
    delete process.env.BUNNY_API_KEY;
    expect(() =>
      verifyBunnyWebhookSignature(rawBody, {
        'x-bunnystream-signature': sign(rawBody),
      }),
    ).toThrow(/signing secret is not configured/);
  });
});

describe('Bunny webhook library ID gate', () => {
  const secret = 'bunny-read-only-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BUNNY_STREAM_WEBHOOK_SECRET = secret;
    process.env.BUNNY_LIBRARY_ID = '666121';
  });

  afterEach(() => {
    delete process.env.BUNNY_STREAM_WEBHOOK_SECRET;
    delete process.env.BUNNY_LIBRARY_ID;
  });

  function mockRes() {
    return {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  function signedReq(bodyObj) {
    const rawBody = JSON.stringify(bodyObj);
    const signature = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    return {
      rawBody,
      body: bodyObj,
      headers: {
        'x-bunnystream-signature': signature,
        'x-bunnystream-signature-version': 'v1',
        'x-bunnystream-signature-algorithm': 'hmac-sha256',
      },
    };
  }

  it('rejects mismatched library IDs', async () => {
    const req = signedReq({ VideoLibraryId: 999999, VideoGuid: 'abc', Status: 3 });
    const res = mockRes();
    await handleBunnyStreamWebhook(req, res);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Library ID mismatch/i);
    expect(VideoContent.findOne).not.toHaveBeenCalled();
  });
});

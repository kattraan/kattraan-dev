/**
 * Re-require csrf middleware with different CLIENT_URL values.
 */
describe('CSRF origin exact matching', () => {
  const originalClientUrl = process.env.CLIENT_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl;
    process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
  });

  function loadCsrf(clientUrl, nodeEnv = 'production') {
    jest.resetModules();
    process.env.CLIENT_URL = clientUrl;
    process.env.NODE_ENV = nodeEnv;
    return require('../middleware/csrf');
  }

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

  it('allows exact CLIENT_URL origin', () => {
    const csrf = loadCsrf('https://www.kattraan.com');
    const req = { method: 'POST', path: '/api/courses', headers: { origin: 'https://www.kattraan.com' } };
    const res = mockRes();
    const next = jest.fn();
    csrf(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects prefix-spoofed origins', () => {
    const csrf = loadCsrf('https://www.kattraan.com');
    const req = {
      method: 'POST',
      path: '/api/courses',
      headers: { origin: 'https://www.kattraan.com.evil.tld' },
    };
    const res = mockRes();
    const next = jest.fn();
    csrf(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it('supports comma-separated CLIENT_URL allowlist', () => {
    const csrf = loadCsrf('https://www.kattraan.com,https://app.kattraan.com');
    const req = {
      method: 'POST',
      path: '/api/cart',
      headers: { origin: 'https://app.kattraan.com' },
    };
    const res = mockRes();
    const next = jest.fn();
    csrf(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

const config = {
  test: true
}
const ct = require('./')('secret', config);
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

function create(data, exp='1s') {
  const config = {
    expiresIn: exp,
  };
  return jwt.sign(
    data, 'secret', config
  );
}

beforeEach(() => {
  this.t1 = create({sub: 'userid1'});
  this.d1 = jwt.decode(this.t1);
  jest.useFakeTimers();
})

test('Just check', async () => {
  expect.assertions(1);
  try {
    const checked = await ct.check(this.t1);
    expect(checked).toEqual(this.d1);
  } catch (e) {
    expect(e).toEqual(undefined);
  }
});

test('Freeze token', async () => {
  expect.assertions(1);
  try {
    ct.freeze(this.t1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('jwt frozen');
  }
});

test('Freeze token, wait exp', async () => {
  expect.assertions(1);
	try {
    ct.freeze(this.t1);
    jest.runAllTimers();
    let clock = sinon.useFakeTimers(this.d1.exp * 1000 + 1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('TokenExpiredError: jwt expired');
  }
});

test('Freeze subscriber', async () => {
  expect.assertions(1);
  try {
    ct.freezeSub(this.t1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('jwt subscriber frozen');
  }
});

test('Freeze subscriber, try another token', async () => {
  const t2 = create({sub: 'userid1'});
  expect.assertions(2);
  try {
    ct.freezeSub(this.t1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('jwt subscriber frozen');
  }
  try {
    const checked = await ct.check(t2);
  } catch (e) {
    expect(e.message).toEqual('jwt subscriber frozen');
  }
});

test('Freeze subscriber, wait exp', async () => {
  expect.assertions(1);
	try {
    ct.freezeSub(this.t1);
    jest.runAllTimers();
    var clock = sinon.useFakeTimers(this.d1.exp * 1000 + 1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('TokenExpiredError: jwt expired');
  }
});

test('Freeze subscriber, try token issued afterwards', async () => {
  expect.assertions(2);
	try {
    ct.freezeSub(this.t1);
    jest.runAllTimers();
    let clock = sinon.useFakeTimers(this.d1.exp * 1000 + 1);
    const checked = await ct.check(this.t1);
  } catch (e) {
    expect(e.message).toEqual('TokenExpiredError: jwt expired');
  }
  try {
    const t2 = create({sub: 'userid1'});
    const d2 = jwt.decode(t2);
    const checked = await ct.check(t2);
    expect(checked).toEqual(d2);
  } catch (e) {
    expect(e.message).toEqual(undefined);
  }
});
const {resolve} = require('path')
const isCI = require('is-ci');
const {render, cleanup} = require('../pure')
const {fireEvent} = require('../events')
const {waitFor} = require('../wait-for')
const {default: userEvent} = require('../user-event')

const isWindowsCI = isCI && process.platform === "win32";

afterEach(async () => {
  if (isWindowsCI) return;
  await cleanup()
})

test('fireEvent write works', async () => {
  const props = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer.js'),
  ])

  const {clear, findByText} = props

  const instance = await findByText('First option')

  expect(instance).toBeTruthy()

  // Windows uses ">", Linux/MacOS use "❯"
  expect(await findByText(/[❯>] One/)).toBeTruthy()

  clear()

  const down = '\x1B\x5B\x42'
  fireEvent(instance, 'write', {value: down})

  expect(await findByText(/[❯>] Two/)).toBeTruthy()

  clear()

  const enter = '\x0D'
  fireEvent(instance, 'write', {value: enter})

  expect(await findByText('First option: Two')).toBeTruthy()
})

test('FireEvent SigTerm works', async () => {
  // @see https://github.com/crutchcorn/cli-testing-library/issues/3
  // eslint-disable-next-line jest/no-if
  if (isWindowsCI) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(true).toBeTruthy();
    return;
  }
  const {findByText} = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer.js'),
  ])

  const instance = await findByText('First option')

  expect(instance).toBeTruthy()

  await fireEvent.sigterm(instance)

  await waitFor(() => expect(instance.hasExit()).toBeTruthy())
})

test('FireEvent SigKill works', async () => {
  // @see https://github.com/crutchcorn/cli-testing-library/issues/3
  // eslint-disable-next-line jest/no-if
  if (isWindowsCI) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(true).toBeTruthy();
    return;
  }
  const {findByText} = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer.js'),
  ])

  const instance = await findByText('First option')

  expect(instance).toBeTruthy()

  await fireEvent.sigkill(instance)

  await waitFor(() => expect(instance.hasExit()).toBeTruthy())
})

test('userEvent basic keyboard works', async () => {
  const {findByText} = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer-input.js'),
  ])

  const instance = await findByText('What is your name?')
  expect(instance).toBeTruthy()

  userEvent.keyboard(instance, 'Test')

  expect(await findByText('Test')).toBeTruthy()
})

test('userEvent basic keyboard works when bound', async () => {
  // @see https://github.com/crutchcorn/cli-testing-library/issues/3
  // eslint-disable-next-line jest/no-if
  if (isWindowsCI) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(true).toBeTruthy();
    return;
  }
  const {findByText, userEvent: userEventLocal} = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer-input.js'),
  ])

  const instance = await findByText('What is your name?')
  expect(instance).toBeTruthy()

  userEventLocal.keyboard('Test')

  expect(await findByText('Test')).toBeTruthy()
})

test('UserEvent.keyboard enter key works', async () => {
  const props = await render('node', [
    resolve(__dirname, './execute-scripts/stdio-inquirer.js'),
  ])

  const {clear, findByText, userEvent: userEventLocal} = props

  const instance = await findByText('First option')

  expect(instance).toBeTruthy()

  // Windows uses ">", Linux/MacOS use "❯"
  expect(await findByText(/[❯>] One/)).toBeTruthy()

  clear()

  userEventLocal.keyboard('[ArrowDown]')

  expect(await findByText(/[❯>] Two/)).toBeTruthy()

  clear()

  userEventLocal.keyboard('[Enter]')

  expect(await findByText('First option: Two')).toBeTruthy()
})

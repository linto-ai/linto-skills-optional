const assert = require('assert')
const helper = require('node-red-node-test-helper')
const welcome = require('../welcome.js')

const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check greeting intent from welcome node', function () {
  let testOutput, intentGreeting

  before(function () {
    testOutput = {
      en: require('../locales/en-US/welcome').welcome.response,
      fr: require('../locales/fr-FR/welcome').welcome.response
    }

    intentGreeting = {
      nlu: {
        intent: 'greeting',
      },
      conversationData: {}
    }
  })

  beforeEach(function (done) {
    process.env.DEFAULT_LANGUAGE = 'fr-FR'
    const settings = {
      functionGlobalContext: {
        utility: require('linto-utility')
      }
    }
    helper.startServer(settings, done)
  })

  afterEach(function () {
    helper.unload()
  })

  it('it should say welcome (fr)', function (done) {
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.hello)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGreeting
      })
    })
  })

  it('it should say welcome (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.hello)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGreeting
      })
    })
  })
})
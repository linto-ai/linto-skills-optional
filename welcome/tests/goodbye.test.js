const assert = require('assert')
const helper = require('node-red-node-test-helper')
const welcome = require('../welcome.js')

const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check goodbye intent from welcome node', function () {
  let testOutput, intentGoodbye

  before(function () {
    testOutput = {
      en: require('../locales/en-US/welcome').welcome.response,
      fr: require('../locales/fr-FR/welcome').welcome.response
    }

    intentGoodbye = {
      nlu: {
        intent: 'goodbye',
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

  it('it should say goodbye (fr)', function (done) {
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.bye)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGoodbye
      })
    })
  })

  it('it should say goodbye (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.bye)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGoodbye
      })
    })
  })
})


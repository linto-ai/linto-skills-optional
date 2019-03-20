const assert = require('assert')
const helper = require('node-red-node-test-helper')

const datetime = require('../datetime.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check time intent from datetime node', function () {
  let testOutput

  before(function () {
    testOutput = {
      en: require('../locales/en-US/datetime').datetime.response,
      fr: require('../locales/fr-FR/datetime').datetime.response
    }

    intentDatetime = {
      nlu: {
        intent: 'time',
        entitiesNumber: 0,
        entities: []
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

  it('it should get the current time', function (done) {
    helper.load(datetime, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.time) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentDatetime
      })
    })
  })
})
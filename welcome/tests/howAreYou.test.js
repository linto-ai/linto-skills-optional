const assert = require('assert')
const helper = require('node-red-node-test-helper')

const welcome = require('../welcome.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check howAreYou intent from welcome node', function () {
  let testOutput, intentHowAreYou, intentConvHowAreYou


  before(function () {
    testOutput = {
      en: require('../locales/en-US/welcome').welcome.response,
      fr: require('../locales/fr-FR/welcome').welcome.response
    }
    intentHowAreYou = {
      nlu: {
        intent: 'howareyou'
      },
      conversationData: {}
    }

    intentConvHowAreYou = {
      nlu: {
        intent: 'howareyou',
        entitiesNumber: 1,
        entities: [{
          entity: '' // will be populate in test
        }]
      },
      conversationData: {
        intent: 'howareyou',
      }
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

  it('it should init the conversation process (fr)', function (done) {
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.ask, testOutput.fr.status)
        assert.equal(msg.payload.behavior.conversationData, intentHowAreYou.nlu)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentHowAreYou
      })
    })
  })

  it('it should init the conversation process (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.ask, testOutput.en.status)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentHowAreYou
      })
    })
  })

  // intentConv don't have entitie
  it('it should not know what to do (fr)', function (done) {
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.status_unk)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentConvHowAreYou
      })
    })
  })

  // intentConv don't have entitie
  it('it should not know what to do (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.status_unk)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentConvHowAreYou
      })
    })
  })

  it('it should be an ok status (fr)', function (done) {
    let myIntentConvHowAreYou = intentConvHowAreYou
    myIntentConvHowAreYou.nlu.entities[0].entity = 'isok'

    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.isOk)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentConvHowAreYou
      })
    })
  })

  it('it should be an ok status (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentConvHowAreYou = intentConvHowAreYou
    myIntentConvHowAreYou.nlu.entities[0].entity = 'isok'

    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.isOk)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentConvHowAreYou
      })
    })
  })

  it('it should be an ko status (fr)', function (done) {
    let myIntentConvHowAreYou = intentConvHowAreYou
    myIntentConvHowAreYou.nlu.entities[0].entity = 'isko'

    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.isKo)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentConvHowAreYou
      })
    })
  })

  it('it should be an ko status (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentConvHowAreYou = intentConvHowAreYou
    myIntentConvHowAreYou.nlu.entities[0].entity = 'isko'

    helper.load(welcome, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.isKo)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentConvHowAreYou
      })
    })
  })
})
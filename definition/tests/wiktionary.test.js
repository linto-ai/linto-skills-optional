const assert = require('assert')
const helper = require('node-red-node-test-helper')

const definition = require('../definition.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check news intent for wiktionary api', function () {
  let testOutput, intentDefinition

  before(function () {
    testOutput = {
      en: require('../locales/en-US/definition').definition.response.wiktionary,
      fr: require('../locales/fr-FR/definition').definition.response.wiktionary
    }

    intentDefinition = {
      nlu: {
        intent: 'definition',
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

  it('it should get an error, data are missing (fr)', function (done) {
    helper.load(definition, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.error_entities_number)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentDefinition
      })
    })
  })

  it('it should give the definition of the given word (fr)', function (done) {
    let myIntentDefinition = intentDefinition
    myIntentDefinition.nlu.entitiesNumber = 1
    myIntentDefinition.nlu.entities = [{
      entity: 'objet',
      value: 'arbre'
    }]

    helper.load(definition, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.start + myIntentDefinition.nlu.entities[0].value) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentDefinition
      })
    })
  })

  it('it should give the definition of the given word (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentDefinition = intentDefinition
    myIntentDefinition.nlu.entitiesNumber = 1
    myIntentDefinition.nlu.entities = [{
      entity: 'objet',
      value: 'tree'
    }]

    helper.load(definition, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.start + myIntentDefinition.nlu.entities[0].value) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentDefinition
      })
    })
  })
})
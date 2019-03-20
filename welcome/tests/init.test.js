const assert = require('assert')
const helper = require('node-red-node-test-helper')

const welcome = require('../welcome.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check loading welcome node', function () {
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

  it('it should load the welcome node', function (done) {
    helper.load(welcome, flow, function () {
      let n1 = helper.getNode('n1')
      assert.equal(n1.name, 'nodeName')
      done()
    })
  })
})
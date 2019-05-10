/*
 * Copyright (c) 2018 Linagora.
 *
 * This file is part of Linto-Skills-Optional
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict'

const assert = require('assert'),
  helper = require('node-red-node-test-helper'),

  definition = require('../definition.js'),
  flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check news intent for wiktionary api', function() {
  let testOutput, intentDefinition

  before(function() {
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

  beforeEach(function(done) {
    process.env.DEFAULT_LANGUAGE = 'fr-FR'
    const settings = {
      functionGlobalContext: {
        utility: require('linto-utility')
      }
    }
    helper.startServer(settings, done)
  })

  afterEach(function() {
    helper.unload()
  })

  it('it should get an error, data are missing (fr)', function(done) {
    helper.load(definition, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.error_entities_number)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentDefinition
      })
    })
  })

  it('it should give the definition of the given word (fr)', function(done) {
    let myIntentDefinition = intentDefinition
    myIntentDefinition.nlu.entitiesNumber = 1
    myIntentDefinition.nlu.entities = [{
      entity: 'objet',
      value: 'arbre'
    }]

    helper.load(definition, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let myEntitie = myIntentDefinition.nlu.entities,
          res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.fr.start + myEntitie[0].value) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentDefinition
      })
    })
  })

  it('it should give the definition of the given word (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentDefinition = intentDefinition
    myIntentDefinition.nlu.entitiesNumber = 1
    myIntentDefinition.nlu.entities = [{
      entity: 'objet',
      value: 'tree'
    }]

    helper.load(definition, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let myEntitie = myIntentDefinition.nlu.entities,
          res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.en.start + myEntitie[0].value) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentDefinition
      })
    })
  })
})

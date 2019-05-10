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

  memo = require('../memo.js'),
  flow = require('./data/flow.json')


helper.init(require.resolve('node-red'))

describe('check memo intent from node', function() {
  let testOutput, intentMemo

  before(function() {
    testOutput = {
      en: require('../locales/en-US/memo').memo.response,
      fr: require('../locales/fr-FR/memo').memo.response
    }

    intentMemo = {
      nlu: {
        intent: 'memo',
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

  it('it should say that data are missing (fr)', function(done) {
    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.error_data_missing)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentMemo
      })
    })
  })

  it('it should say that data are missing (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.error_data_missing)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentMemo
      })
    })
  })

  it('it should say that the reminder is missing (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'action_create',
      value: 'creer'
    }]

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.error_create_reminder_missing)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should create a memo (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 2
    myIntentMemo.nlu.entities = [{
      entity: 'action_create',
      value: 'creer'
    },
    {
      entity: 'expression',
      value: 'appeler patrick'
    }
    ]

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let entities = myIntentMemo.nlu.entities
        assert.equal(msg.payload.behavior.say, testOutput.fr.create + entities[1].value)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should say that no memo are create (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'action_list',
      value: 'list'
    }]

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.empty)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should ask to delete all user memo (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'action_delete',
      value: 'delete'
    }]

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.ask, testOutput.fr.delete)
        assert(msg.payload.behavior.conversationData)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should ask to delete all user memo (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'action_delete',
      value: 'delete'
    }]

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.ask, testOutput.en.delete)
        assert(msg.payload.behavior.conversationData)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should cancel the delete (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'isko',
      value: 'delete'
    }]
    myIntentMemo.conversationData.intent = 'memo'

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.isNotDeleted)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should delete all the memo (fr)', function(done) {
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'isok',
      value: 'delete'
    }]
    myIntentMemo.conversationData.intent = 'memo'

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.isDeleted)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })

  it('it should delete all the memo (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentMemo = intentMemo
    myIntentMemo.nlu.entitiesNumber = 1
    myIntentMemo.nlu.entities = [{
      entity: 'isok',
      value: 'delete'
    }]
    myIntentMemo.conversationData.intent = 'memo'

    helper.load(memo, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.isDeleted)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentMemo
      })
    })
  })
})

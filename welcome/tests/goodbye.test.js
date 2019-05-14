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
  welcome = require('../welcome.js'),

  flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check goodbye intent from welcome node', function() {
  let testOutput, intentGoodbye

  before(function() {
    testOutput = {
      en: require('../locales/en-US/welcome').welcome.response,
      fr: require('../locales/fr-FR/welcome').welcome.response
    }

    intentGoodbye = {
      nlu: {
        intent: 'goodbye'
      },
      conversationData: {}
    }
  })

  beforeEach(function(done) {
    process.env.DEFAULT_LANGUAGE = 'fr-FR'

    const settings = {
      functionGlobalContext: {
        utility: require('@linto-ai/linto-skills-toolbox')
      }
    }

    helper.startServer(settings, done)
  })

  afterEach(function() {
    helper.unload()
  })

  it('it should say goodbye (fr)', function(done) {
    helper.load(welcome, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.fr.bye)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGoodbye
      })
    })
  })

  it('it should say goodbye (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(welcome, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say, testOutput.en.bye)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentGoodbye
      })
    })
  })
})


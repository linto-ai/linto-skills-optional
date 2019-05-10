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

  datetime = require('../datetime.js'),
  flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check time intent from datetime node', function() {
  let testOutput, intentDatetime

  before(function() {
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

  it('it should get the current time', function(done) {
    helper.load(datetime, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.time) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentDatetime
      })
    })
  })
})

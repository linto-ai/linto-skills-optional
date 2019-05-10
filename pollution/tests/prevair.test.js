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

  pollution = require('../pollution.js'),
  flow = require('./data/flow.json'),
  flowNoCity = require('./data/flowNoCity.json')


helper.init(require.resolve('node-red'))

describe('check pollution intent for prevair api', function() {
  const defaultCity = 'Paris'
  let testOutput, intentPollution

  before(function() {
    testOutput = {
      en: require('../locales/en-US/pollution').pollution.response.prevair,
      fr: require('../locales/fr-FR/pollution').pollution.response.prevair
    }

    intentPollution = {
      nlu: {
        intent: 'pollution',
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

  it('it should get the pollution from default node settings (fr)', function(done) {
    helper.load(pollution, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.seuil) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(defaultCity.toUpperCase()) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentPollution
      })
    })
  })

  it('it should get the pollution from default node settings (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'

    helper.load(pollution, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.seuil) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(defaultCity.toUpperCase()) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentPollution
      })
    })
  })

  it('it should get the pollution from given city (fr)', function(done) {
    let myIntentPollution = intentPollution,
      citySearch = 'Toulouse'
    myIntentPollution.nlu.entitiesNumber = 1
    myIntentPollution.nlu.entities = [{
      entity: 'location',
      value: citySearch
    }]

    helper.load(pollution, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.seuil) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(citySearch.toUpperCase()) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentPollution
      })
    })
  })

  it('it should throw an error, city not found (fr)', function(done) {
    let myIntentPollution = intentPollution
    myIntentPollution.nlu.entitiesNumber = 1
    myIntentPollution.nlu.entities = [{
      entity: 'location',
      value: 'Error_Unknow_City'
    }]

    helper.load(pollution, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.error_city_unfound) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentPollution
      })
    })
  })
})

describe('check pollution intent for prevair api without default city', function() {
  let testOutput, intentPollution

  before(function() {
    testOutput = {
      en: require('../locales/en-US/pollution').pollution.response.prevair,
      fr: require('../locales/fr-FR/pollution').pollution.response.prevair
    }

    intentPollution = {
      nlu: {
        intent: 'pollution',
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

  it('it should say an error, city not found (fr)', function(done) {
    helper.load(pollution, flowNoCity, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.error_no_city) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentPollution
      })
    })
  })

  it('it should say an error, city not found (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    helper.load(pollution, flowNoCity, function() {
      helper.getNode('n2').on('input', function(msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.error_no_city) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentPollution
      })
    })
  })
})

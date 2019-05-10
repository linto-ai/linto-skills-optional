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

  weather = require('../weather.js'),
  flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check weather intent for microsoft api', function() {
  const defaultCity = 'Paris'
  let testOutput, intentWeather

  before(function() {
    testOutput = {
      en: require('../locales/en-US/weather').weather.response.microsoft,
      fr: require('../locales/fr-FR/weather').weather.response.microsoft
    }

    intentWeather = {
      nlu: {
        intent: 'weather',
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

  it('it should get the weather from default settings (fr)', function(done) {
    helper.load(weather, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.fr.temperatureToday) > -1, true)
        assert.equal(res.indexOf(testOutput.fr.weatherTodayIs) > -1, true)
        assert.equal(res.indexOf(defaultCity) > -1, true)
        console.log(res)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentWeather
      })
    })
  })
/*
  it('it should get the weather from given city (fr)', function(done) {
    let myIntentWeather = intentWeather,
      citySearch = 'Toulouse'
    myIntentWeather.nlu.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: citySearch
    }]

    helper.load(weather, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.fr.temperatureToday) > -1, true)
        assert.equal(res.indexOf(testOutput.fr.weatherTodayIs) > -1, true)
        assert.equal(res.indexOf(citySearch) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should get the weather from given city (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentWeather = intentWeather,
      citySearch = 'Rennes'
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: citySearch
    }]

    helper.load(weather, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.en.temperatureToday) > -1, true)
        assert.equal(res.indexOf(testOutput.en.weatherTodayIs) > -1, true)
        assert.equal(res.indexOf(citySearch) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should say an error, city not found (fr)', function(done) {
    let myIntentWeather = intentWeather
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: ''
    }]

    helper.load(weather, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.fr.error_api) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should say an error, city not found (en)', function(done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentWeather = intentWeather
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: ''
    }]

    helper.load(weather, flow, function() {
      helper.getNode('n2').on('input', function(msg) {
        let res = msg.payload.behavior.say
        assert.equal(res.indexOf(testOutput.en.error_api) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })*/
})

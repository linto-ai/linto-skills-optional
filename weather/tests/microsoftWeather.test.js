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

const assert = require('assert')
const helper = require('node-red-node-test-helper')

const weather = require('../weather.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check weather intent for microsoft api', function () {
  const defaultCity = 'Paris'
  let testOutput, intentWeather

  before(function () {
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

  it('it should get the weather from default node settings (fr)', function (done) {
    helper.load(weather, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.temperatureToday) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.weatherTodayIs) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(defaultCity) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentWeather
      })
    })
  })

  it('it should get the weather from given city (fr)', function (done) {
    let myIntentWeather = intentWeather
    let citySearch = 'Toulouse'
    myIntentWeather.nlu.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: citySearch
    }]

    helper.load(weather, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.temperatureToday) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.weatherTodayIs) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(citySearch) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should get the weather from given city (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentWeather = intentWeather
    let citySearch = 'Rennes'
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: citySearch
    }]

    helper.load(weather, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.temperatureToday) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.weatherTodayIs) > -1, true)
        assert.equal(msg.payload.behavior.say.indexOf(citySearch) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should say an error, city not found (fr)', function (done) {
    let myIntentWeather = intentWeather
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: ''
    }]

    helper.load(weather, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.error_api) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })

  it('it should say an error, city not found (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentWeather = intentWeather
    myIntentWeather.entitiesNumber = 1
    myIntentWeather.nlu.entities = [{
      entity: 'location',
      value: ''
    }]

    helper.load(weather, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.error_api) > -1, true)
        done()
      })
      helper.getNode('n1').receive({
        payload: myIntentWeather
      })
    })
  })
})
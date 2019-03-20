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

const news = require('../news.js')
const flow = require('./data/flow.json')

helper.init(require.resolve('node-red'))

describe('check news intent for lemonde api', function () {
  let testOutput, intentNews
  let testNews = []

  before(function () {
    testOutput = {
      en: require('../locales/en-US/news').news.response.lemonde,
      fr: require('../locales/fr-FR/news').news.response.lemonde
    }

    intentNews = {
      nlu: {
        intent: 'news',
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

  it('it should get the default news (fr)', function (done) {
    helper.load(news, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.title) > -1, true)
        assert.equal(testNews.includes(msg.payload.behavior.say), false)
        testNews.push(msg.payload.behavior.say)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentNews
      })
    })
  })

  it('it should get the sports news (fr)', function (done) {
    let myIntentNews = intentNews
    myIntentNews.nlu.entitiesNumber = 1
    myIntentNews.nlu.entities = [{
      entity: 'type_sport',
      value: 'sport'
    }]

    helper.load(news, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.title) > -1, true)
        assert.equal(testNews.includes(msg.payload.behavior.say), false)
        testNews.push(msg.payload.behavior.say)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentNews
      })
    })
  })

  it('it should get the cultural news (fr)', function (done) {
    let myIntentNews = intentNews
    myIntentNews.nlu.entitiesNumber = 1
    myIntentNews.nlu.entities = [{
      entity: 'type_cultural',
      value: 'cultural'
    }]

    helper.load(news, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.title) > -1, true)
        assert.equal(testNews.includes(msg.payload.behavior.say), false)
        testNews.push(msg.payload.behavior.say)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentNews
      })
    })
  })

  it('it should get the data processing news (fr)', function (done) {
    let myIntentNews = intentNews
    myIntentNews.nlu.entitiesNumber = 1
    myIntentNews.nlu.entities = [{
      entity: 'type_pixel',
      value: 'pixel'
    }]

    helper.load(news, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.fr.title) > -1, true)
        assert.equal(testNews.includes(msg.payload.behavior.say), false)
        testNews.push(msg.payload.behavior.say)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentNews
      })
    })
  })

  it('it should get the data processing news (en)', function (done) {
    process.env.DEFAULT_LANGUAGE = 'en-US'
    let myIntentNews = intentNews
    myIntentNews.nlu.entitiesNumber = 1
    myIntentNews.nlu.entities = [{
      entity: 'type_pixel',
      value: 'pixel'
    }]

    helper.load(news, flow, function () {
      helper.getNode('n2').on('input', function (msg) {
        assert.equal(msg.payload.behavior.say.indexOf(testOutput.en.title) > -1, true)
        assert.equal(testNews.includes(msg.payload.behavior.say), false)
        testNews.push(msg.payload.behavior.say)
        done()
      })
      helper.getNode('n1').receive({
        payload: intentNews
      })
    })
  })
})
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

module.exports = function(RED) {
  const debug = require('debug')('redmanager:flow:optional:skill:openpaas:cal')
  const utility = require('@linto-ai/linto-skills-toolbox')
  const intent = require('./data/intent')
  const OpJcal = require('./api/opCalConector')
  const supportedTTS = ['en-US', 'fr-FR']
  const CalendarLogicSkill = require('./logic/calendar')

  function OpenPaasCalendar(config) {
    RED.nodes.createNode(this, config)
    let node = this
    // Setup language text for TTS
    let language = this.context().flow.get('language')
    let openPaasJcal, lintoTTS

    if (config.user && config.password && config.host) {
      openPaasJcal = new OpJcal(config.user, config.password, config.host, language.split('-')[0])
    } else {
      node.error(RED._('lintoTemplate.error.op_connector_param_missing'))
    }

    // Check language otherwise load DEFAULT_LANGUAGE
    if (language && supportedTTS.indexOf(language) > -1) {
      lintoTTS = require('./locales/' + language + '/tts.json')
    } else {
      lintoTTS = require('./locales/' + process.env.DEFAULT_LANGUAGE + '/tts.json')
      node.error(RED._('lintoTemplate.error.init_language_tts'))
    }
    const calSkill = new CalendarLogicSkill(openPaasJcal, lintoTTS)

    node.on('input', async function(msg) {

      const intentDetection = utility.intentDetection(msg.payload, intent.key, true)
      if (intentDetection.isIntent) {
        let response

        if (!openPaasJcal.authorization || !openPaasJcal.userId) {
          // error configuration
          response = { say: lintoTTS.error.config }
        } else if (intentDetection.isConversational) {
          // conversational
          response = await calSkill.conversationCreate(msg.payload)
        } else {
          // not conversational
          response = await calSkill.sayIntent(msg.payload, this.context().flow.memo)
        }

        msg.payload = {
          behavior: response
        }

        this.send(msg)
      } else {
        debug('Nothing to do')
      }
    })

    node.on('close', function() {
      node.status({})
    })
  }
  RED.nodes.registerType('calendar-skill', OpenPaasCalendar)
}

// 2019-07-05T15:00:00Z

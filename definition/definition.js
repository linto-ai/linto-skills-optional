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
  const debug = require('debug')('redmanager:flow:optional:skill:definition')
  const intent = require('./data/intent'),
    DefinitionApi = require('./api/definitionApi'),
    utility = require('@linto-ai/linto-skills-toolbox')
  let lintoResponse

  function Definition(config) {
    RED.nodes.createNode(this, config)
    if (utility) {
      this.status({})
      let language
      try {
        language = this.context().flow.get('language')
        lintoResponse = utility.loadLanguage(__filename, 'definition', language)
      } catch (err) {
        this.error(RED._('definition.error.init_language'), err)
      }

      const definitionApi = new DefinitionApi(config.api, lintoResponse)

      this.on('input', async function(msg) {
        const intentDetection = utility.intentDetection(msg.payload, intent.key)
        if (intentDetection.isIntent) {
          msg.payload = {
            behavior: {
              say: await definitionApi.getDefinition(msg.payload, language)
            }
          }
          this.send(msg)
        } else {
          debug('Nothing to do')
        }
      })
    } else {
      this.status({
        fill: 'red',
        shape: 'ring',
        text: RED._('definition.error.utility_undefined')
      })
      this.error(RED._('definition.error.utility_error'))
    }
  }
  RED.nodes.registerType('definition-skill', Definition)
}

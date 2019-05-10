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
  const debug = require('debug')('redmanager:flow:optional:skill:light')
  const intent = require('./data/intent'),
    HueConnect = require('./api/hueConnect'),
    utility = require('linto-utility')

  let lintoResponse, hue

  function brightToPercent(value) {
    value = (value * 255) / 100
    return value | 0
  }

  function doActionLight(payload, isOn, language) {
    let lightName = utility.extractEntityFromType(payload, intent.entities.object),
      ordinalEntity = utility.extractEntityFromType(payload, intent.entities.ordinal),
      ordinal

    // Prepare data
    try {
      if (ordinalEntity && typeof parseInt(ordinalEntity.value)) {
        ordinal = utility.wordsToNumber(ordinal, language)
        ordinal = brightToPercent(ordinal)
      }
    } catch (err) {
      ordinal = undefined
    }

    // Do request
    if (lightName) {
      if (ordinal) {
        hue.switchBrightByName(lightName.value, ordinal, false)
      } else {
        hue.switchLightByName(lightName.value, isOn)
      }
    } else {
      if (ordinal) {
        hue.switchAllBright(ordinal, false)
      } else {
        hue.switchAllLight(isOn)
      }
    }
  }

  function doActionBright(payload, isBrightUp, language) {
    let ordinal = 50,
      lightName = utility.extractEntityFromType(payload, intent.entities.object),
      ordinalEntity = utility.extractEntityFromType(payload, intent.entities.ordinal)

    // Prepare data
    try {
      if (ordinalEntity && typeof parseInt(ordinalEntity.value))
        ordinal = utility.wordsToNumber(ordinal, language)
    } catch (err) {
      ordinal = 50
    }

    ordinal = brightToPercent(ordinal)
    if (!isBrightUp)
      ordinal = ordinal * -1

    // Do request
    if (lightName) {
      hue.switchBrightByName(lightName.value, ordinal, true)
    } else {
      hue.switchAllBright(ordinal, true)
    }
  }

  function LightHue(config) {
    RED.nodes.createNode(this, config)
    var node = this
    let language
    // Configure the skill language for linto has deployment flow bases on language
    try {
      language = this.context().flow.get('language')
      lintoResponse = utility.loadLanguage(__filename, 'light', language)
    } catch (err) {
      this.error(RED._('light.error.init_language'), err)
    }

    let clientRemote = {
      clientId: config.clientId,
      clientSecret: config.clientSecret
    }
    hue = new HueConnect(clientRemote, config.userKey, config.authToken, config.refreshToken)

    // Do your stuff when an input is detected
    node.on('input', function(msg) {
      let payload = msg.payload
      // Check if message receive match the intent in data
      const intentDetection = utility.intentDetection(payload, intent.key)
      if (intentDetection.isIntent) {
        let actionEntity = utility.extractEntityFromPrefix(payload, intent.entities.prefix)

        switch (true) {
          case (!actionEntity):
            return utility.formatToSay(lintoResponse.error_data_missing)
          case (actionEntity.entity === intent.entities.action_on):
            doActionLight(payload, true, language)
            break
          case (actionEntity.entity === intent.entities.action_off):
            doActionLight(payload, false, language)
            break
          case (actionEntity.entity === intent.entities.action_up):
            doActionBright(payload, true, language)
            break
          case (actionEntity.entity === intent.entities.action_down):
            doActionBright(payload, false, language)
            break
          default:
            return utility.formatToSay(lintoResponse.unknown)
        }
      } else {
        node.error(RED._('light.text.example')) // Print an error into node-red-debug panel ui
      }
    })
  }
  // Register the node to the user interface
  RED.nodes.registerType('light-skill', LightHue)
}

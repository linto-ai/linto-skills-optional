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

const debug = require('debug')('redmanager:flow:optional:skill:definition:wiktionary')
const wd = require('word-definition'),
  utility = require('linto-utility')

const itemEntities = 'objet'
let lintoResponse

class Wiktionary {
  constructor(response,) {
    lintoResponse = response
  }

  /**
     * @summary Allow to get a definition of a specific word
     *
     * @param {String} payload the words to get a defintion
     * @param {String} language the language word
     *
     * @returns {String} The words definition
     **/
  async callApi(words, language) {
    return new Promise((resolve, reject) => {
      wd.getDef(words, language, null, function(definitionResponse) {
        if (definitionResponse.definition) {
          resolve(lintoResponse.start + words +
            lintoResponse.middle + definitionResponse.definition)
        } else {
          resolve(lintoResponse.error_unknown_word + words)
        }

        reject(lintoResponse.error_unknown_word + words)
      })
    })
  }

  async getDefinition(payload, language) {
    try {
      if (!language)
        language = process.env.DEFAULT_LANGUAGE

      if (utility.checkEntitiesRequire(payload, [itemEntities])) {
        language = language.split('-')[0]
        return await this.callApi(payload.nlu.entities[0].value, language)
      } else {
        return lintoResponse.error_entities_number
      }
    } catch (error) {
      return error
    }
  }
}

module.exports = Wiktionary

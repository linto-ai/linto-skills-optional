/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
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

const debug = require('debug')('redmanager:flow:optional:skill:definition:wiktionary')
const wd = require('word-definition')
let lintoResponse

class Wiktionary {
    constructor(response) {
        lintoResponse = response
    }

    async callApi(words, langue) {
        langue = langue.split('-')[0]
        return new Promise((resolve, reject) => {
            wd.getDef(words, langue, null, function (definitionResponse) {
                if (definitionResponse.definition)
                    resolve(lintoResponse.start + words + lintoResponse.middle + definitionResponse.definition)
                else
                    resolve(lintoResponse.error_unknown_word + words)
            })
        })
    }

    async getDefinition(nlu, langue) {
        try {
            if (nlu.entitiesNumber === 1) {
                return await this.callApi(nlu.entities[0].value, langue)
            } else {
                return lintoResponse.error_entities_number
            }
        } catch (error) {
            return error
        }
    }
}

module.exports = Wiktionary
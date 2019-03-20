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

const debug = require('debug')('redmanager:flow:optional:skill:definition:api')
const Wikitionary = require('./wiktionary')

class DefinitionApi {
    constructor(api, templateResponse, utility) {
        switch (api) {
            case 'wiktionary':
                this.definitionApi = new Wikitionary(templateResponse.wiktionary, utility)
                break
            default:
                this.definitionApi = new Wikitionary(templateResponse.wiktionary, utility)
        }
        return this
    }

    async getDefinition(payload, config) {
        try {
            return await this.definitionApi.getDefinition(payload, config)
        } catch (err) {
            return err
        }
    }
}

module.exports = DefinitionApi
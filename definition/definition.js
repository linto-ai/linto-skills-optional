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

module.exports = function (RED) {
    const debug = require('debug')('redmanager:flow:optional:skill:definition')
    const intent = require('./data/intent')
    const DefinitionApi = require('./api/definitionApi')
    const utility = RED.settings.functionGlobalContext.utility
    let lintoResponse

    function Definition(config) {
        RED.nodes.createNode(this, config)
        if (utility) {
            this.status({})

            try {
                lintoResponse = utility.loadLanguage(__filename, 'definition', this.context().flow.get('language'))
            } catch (err) {
                this.error(RED._("definition.error.init_language"), err)
            }

            const definitionApi = new DefinitionApi(config.api, lintoResponse, utility)

            this.on('input', async function (msg) {
                const intentDetection = utility.intentDetection(msg.payload, intent.key)
                if (intentDetection.isIntent) {
                    msg.payload = {
                        behavior: {
                            say: await definitionApi.getDefinition(msg.payload, this.context().flow.get('language'))
                        }
                    }
                    this.send(msg)
                } else {
                    debug("Nothing to do")
                }
            })
        } else {
            this.status({
                fill: "red",
                shape: "ring",
                text: RED._("definition.error.utility_undefined")
            });
            this.error(RED._("definition.error.utility_error"))
        }
    }
    RED.nodes.registerType("definition-skill", Definition)
}
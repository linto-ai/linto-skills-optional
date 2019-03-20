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
    const debug = require("debug")("redmanager:flow:optional:skill:welcome")
    const intent = require("./data/intent")
    const utility = RED.settings.functionGlobalContext.utility
    let lintoResponse

    function conversationIntent(payload) {
        if (!!payload.conversationData && payload.conversationData.intent === intent.keys.howareyou) {
            let say = lintoResponse.status_unk
            if (payload.nlu.entitiesNumber !== 1)
                say = lintoResponse.status_unk
            else if (payload.nlu.entities[0].entity === intent.entities.isOk)
                say = lintoResponse.isOk
            else if (payload.nlu.entities[0].entity === intent.entities.isKo)
                say = lintoResponse.isKo
            return {
                say
            }
        }
    }

    function sayIntent(payload) {
        if (payload.nlu.intent === intent.keys.greeting) {
            return {
                say: lintoResponse.hello
            }
        } else if (payload.nlu.intent === intent.keys.goodbye) {
            return {
                say: lintoResponse.bye
            }
        } else if (payload.nlu.intent === intent.keys.howareyou) {
            return {
                ask: lintoResponse.status,
                conversationData: payload.nlu
            }
        }
    }

    function Welcome(config) {
        RED.nodes.createNode(this, config)
        if (utility) {
            this.status({})
            try {
                lintoResponse = utility.loadLanguage(__filename, 'welcome', this.context().flow.get('language'))
            } catch (err) {
                this.error(RED._("welcome.error.init_language"), err)
            }

            this.on("input", function (msg) {
                const intentDetection = utility.multipleIntentDetection(msg.payload, intent.keys, true)
                if (intentDetection.isIntent) {
                    let response
                    if (intentDetection.isConversational) {
                        response = conversationIntent(msg.payload)
                    } else {
                        response = sayIntent(msg.payload)
                    }

                    msg.payload = {
                        behavior: response
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
                text: RED._("welcome.error.utility_undefined")
            });
            this.error(RED._("welcome.error.utility_error"))
        }
    }
    RED.nodes.registerType("welcome-skill", Welcome)
}
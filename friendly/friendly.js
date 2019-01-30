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

module.exports = function (RED) {
    const debug = require("debug")("redmanager:flow:optional:skill:friendly")
    const intent = require("./data/intent")
    let lintoResponse

    function loadLanguage(language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE
        lintoResponse = require("./locales/" + language + "/friendly").friendly.response
    }

    // This skill is multiple intention
    function intentDetection(input) {
        return (
            (input.conversationData !== undefined && input.conversationData.intent === intent.keys.status) || intent.keys.hasOwnProperty(input.nlu.intent)
        )
    }

    function outputDetection(input) {
        // Is conversational
        if (input.conversationData !== undefined && input.conversationData.intent === intent.keys.status) {
            let say = lintoResponse.status_unk
            if (input.nlu.entitiesNumber !== 1)
                say = lintoResponse.status_unk
            else if (input.nlu.entities[0].entity === intent.entities.isOk)
                say = lintoResponse.isOk
            else if (input.nlu.entities[0].entity === intent.entities.isKo)
                say = lintoResponse.isKo
            return {
                say
            }
        } // Is say
        else if (input.nlu.intent === intent.keys.greeting) {
            return {
                say: lintoResponse.hello
            }
        } else if (input.nlu.intent === intent.keys.goodbye) {
            return {
                say: lintoResponse.bye
            }
        } else if (input.nlu.intent === intent.keys.status) {
            return {
                ask: lintoResponse.status,
                conversationData: input.nlu
            }
        }
    }

    function Friendly(config) {
        RED.nodes.createNode(this, config)
        let node = this

        try {
            loadLanguage(this.context().flow.get("language"))
        } catch (err) {
            node.error(RED._("friendly.error.init_language"), err)
        }

        node.on("input", function (msg) {
            if (intentDetection(msg.payload)) {
                msg.payload = {
                    behavior: outputDetection(msg.payload)
                }
                node.send(msg)
            } else {
                debug("Nothing to do")
            }
        })
    }
    RED.nodes.registerType("friendly-skill", Friendly)
}
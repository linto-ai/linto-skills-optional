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
    const debug = require('debug')('redmanager:flow:optional:skill:datetime')
    const intent = require('./data/intent')
    let lintoResponse

    function loadLanguage(language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE
        lintoResponse = require('./locales/' + language + '/datetime').datetime.response
    }

    // This skill is multiple intention but no conversational skills
    function intentDetection(input) {
        return (input.conversationData === undefined && intent.keys.hasOwnProperty(input.nlu.intent))
    }

    function dateTimeIntent(inputNlu) {
        if (inputNlu.intent === intent.keys.date) {
            return lintoResponse.date + getDate()
        } else if (inputNlu.intent === intent.keys.time) {
            return lintoResponse.time + getTime()
        }
    }

    function getDate() {
        return (new Date().toISOString().split('T')[0])
    }

    function getTime() {
        let now = new Date()
        let hours = now.getHours()
        let min = now.getMinutes()
        return (hours + "h" + min)
    }

    function Datetime(config) {
        RED.nodes.createNode(this, config)
        let node = this

        try {
            loadLanguage(this.context().flow.get('language'))
        } catch (err) {
            node.error(RED._("datetime.error.init_language"), err)
        }

        node.on('input', function (msg) {
            if (intentDetection(msg.payload)) {
                msg.payload = {
                    behavior: {
                        say: dateTimeIntent(msg.payload.nlu)
                    }
                }
                node.send(msg)
            } else {
                debug("Nothing to do")
            }
        })
    }
    RED.nodes.registerType("datetime-skill", Datetime)
}
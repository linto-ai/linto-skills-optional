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
    const debug = require('debug')('redmanager:flow:optional:skill:calendar')
    const CalendarApi = require('./api/calendarApi')
    const intent = require('./data/intent')
    let lintoResponse

    function loadLanguage(language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE
        lintoResponse = require('./locales/' + language + '/calendar').calendar.response
    }

    function intentDetection(input) {
        return (!!input.conversationData && input.nlu.intent === intent.key)
    }

    function Calendar(config) {
        RED.nodes.createNode(this, config)
        let node = this

        try {
            loadLanguage(this.context().flow.get('language'))
        } catch (err) {
            node.error(RED._("calendar.error.init_language"), err)
        }

        let calendarApi = new CalendarApi(config.api, lintoResponse)
        node.on('input', async function (msg) {
            if (intentDetection(msg.payload)) {
                msg.payload = {
                    behavior: await calendarApi.getCalendar(msg.payload.nlu, config)
                }
                node.send(msg)
            } else {
                debug("Nothing to do")
            }
        })
    }
    RED.nodes.registerType("calendar-skill", Calendar)
}
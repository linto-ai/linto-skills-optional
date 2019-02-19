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
    const utility = RED.settings.functionGlobalContext.utility
    const intent = require('./data/intent')
    let lintoResponse

    function Calendar(config) {
        RED.nodes.createNode(this, config)
        if (utility) {
            this.status({})
            try {
                lintoResponse = utility.loadLanguage(__filename, 'calendar', this.context().flow.get('language'))
            } catch (err) {
                this.error(RED._("calendar.error.init_language"), err)
            }

            const calendarApi = new CalendarApi(config.api, lintoResponse, utility)

            this.on('input', async function (msg) {
                const intentDetection = utility.intentDetection(msg.payload, intent.key)
                if (intentDetection.isIntent) {
                    msg.payload = {
                        behavior: await calendarApi.getCalendar(msg.payload, config)
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
                text: RED._("calendar.error.utility_undefined")
            });
            this.error(RED._("calendar.error.utility_error"))
        }
    }
    RED.nodes.registerType("calendar-skill", Calendar)
}
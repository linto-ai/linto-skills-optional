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
    const debug = require('debug')('redmanager:flow:optional:skill:datetime')
    const intent = require('./data/intent')
    const utility = RED.settings.functionGlobalContext.utility
    let lintoResponse

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
        return (hours + lintoResponse.unit + min)
    }

    function Datetime(config) {
        RED.nodes.createNode(this, config)
        if (utility) {
            this.status({})
            try {
                lintoResponse = utility.loadLanguage(__filename, 'datetime', this.context().flow.get('language'))
            } catch (err) {
                this.error(RED._("datetime.error.init_language"), err)
            }

            this.on('input', function (msg) {
                const intentDetection = utility.multipleIntentDetection(msg.payload, intent.keys)
                if (intentDetection.isIntent) {
                    msg.payload = {
                        behavior: {
                            say: dateTimeIntent(msg.payload.nlu)
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
                text: RED._("datetime.error.utility_undefined")
            });
            this.error(RED._("datetime.error.utility_error"))
        }
    }
    RED.nodes.registerType("datetime-skill", Datetime)
}
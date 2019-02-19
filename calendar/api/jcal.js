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

const debug = require("debug")("redmanager:flow:optional:skill:calendar:jcal");
const request = require("request");
const calendarAction = require('./data/jcal').type_action
let JCAL_HOST, JCAL_TOKEN

class JcalCalendar {
    constructor(response, utility) {
        this.lintoResponse = response;
        this.utility = utility
    }

    async connectionDav(method, path, body) {
        let option = {
            method: method,
            url: JCAL_HOST + path,
            headers: {
                authorization: JCAL_TOKEN,
                accept: 'text/plain',
                'content-type': 'application/json'
            }
        }
        if (body) {
            option.body = body
            option.json = true
        }
        return new Promise((resolve, reject) => {
            request(option, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body)
                } else {
                    reject({
                        errorMsg: error
                    })
                }
            })
        })
    }

    async createEvent(body) {
        let path = ''
        body = {
            summary: "my linto test",
            location: "in linto",
            when: "2019-02-02T14:30:00"
        }
        try {
            let result = await this.connectionDav('POST', path, body)
            return this.lintoResponse.create
        } catch (err) {
            return this.lintoResponse.error_create

        }
    }

    async deleteNextEvent() {
        let path = '/next'
        try {
            let result = await this.connectionDav('DELETE', path)
            return this.lintoResponse.delete
        } catch (err) {
            return this.lintoResponse.error_delete

        }
    }

    async listNextEvent() {
        let path = '/next'
        try {
            let nextMetting = await this.connectionDav('GET', path)
            return nextMetting
        } catch (err) {
            return this.lintoResponse.error_list

        }
    }

    async getCalendar(payload, config) {
        JCAL_HOST = config.url
        JCAL_TOKEN = config.key

        let actionEntity = this.utility.extractEntityFromPrefix(payload, calendarAction.prefix)
        try {
            switch (true) {
                case (actionEntity === undefined):
                    return await this.listNextEvent()
                case (actionEntity.entity === calendarAction.action_delete):
                    return await this.deleteNextEvent()
                case (actionEntity.entity === calendarAction.action_list):
                    return await this.listNextEvent()
                case (actionEntity.entity === calendarAction.action_create):
                    return this.lintoResponse.error_not_implemented
                default:
                    return await this.listNextEvent()
            }
        } catch (err) {
            return this.lintoResponse.error_jcal
        }
    }
}

module.exports = JcalCalendar
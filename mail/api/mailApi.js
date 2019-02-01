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

const debug = require('debug')('redmanager:flow:optional:skill:mail:api')
const JmapMail = require('./jmap')

class MailApi {
    constructor(api, templateResponse) {
        switch (api) {
            case 'jmap':
                this.mailApi = new JmapMail(templateResponse.jmap)
                break
            default:
                this.mailApi = new JmapMail(templateResponse.jmap)
        }
        return this
    }

    async getMail(nlu, config) {
        try {
            return await this.mailApi.getMail(nlu, config)
        } catch (err) {
            return err
        }
    }
}

module.exports = MailApi
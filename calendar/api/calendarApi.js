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
'use strict'

const debug = require('debug')('redmanager:flow:optional:skill:calendar:api')
const JcalCalendar = require('./jcal')

class CalendarApi {
  constructor(api, templateResponse) {
    switch (api) {
      case 'jcal':
        this.calendarApi = new JcalCalendar(templateResponse.jcal)
        break
      default:
        this.calendarApi = new JcalCalendar(templateResponse.jcal)
    }
    return this
  }

  async getCalendar(payload, config) {
    try {
      return await this.calendarApi.getCalendar(payload, config)
    } catch (err) {
      return err
    }
  }
}

module.exports = CalendarApi

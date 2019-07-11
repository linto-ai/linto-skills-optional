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

const debug = require('debug')('redmanager:flow:linto:api:openpaas:icalToJcal')
const uuidv1 = require('uuid/v1')
const ical = require('ical.js')

class OpenPaasIcalToJcal {
  constructor() {
  }

  formatDate(date) {
    let formatedDate = (date.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0])
    return formatedDate
  }

  generateJcal(host, event, mail) {
    let iCalendarData = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:' + uuidv1(),
      'CLASS:PUBLIC',
      'TRANSP:OPAQUE'
    ]
    let dateStart = new Date(event.date)
    let dateEnd = new Date(event.date)
    dateEnd = new Date(dateEnd.setHours(dateEnd.getHours() + 1))

    iCalendarData.push('DTSTART;TZID=Europe/Berlin:' + this.formatDate(dateStart))
    iCalendarData.push('DTEND;TZID=Europe/Berlin:' + this.formatDate(dateEnd))
    iCalendarData.push('SUMMARY:' + event.title)
    iCalendarData.push('ORGANIZER:mailto:' + mail)

    if (event.isVisio) {
      iCalendarData.push('X-OPENPAAS-VIDEOCONFERENCE:' + host + '/videoconf/' + uuidv1())
    } else {
      iCalendarData.push('LOCATION:' + event.location)
    }
    if (event.attendee) {
      for (let attendee of event.attendee) {
        iCalendarData.push('ATTENDEE:mailto:' + attendee)
      }
    }
    // iCalendarData.push('ATTENDEE:mailto:' + mail)

    iCalendarData.push('END:VEVENT')
    iCalendarData.push('END:VCALENDAR')
    iCalendarData = iCalendarData.join('\r\n')
    const jcalData = ical.parse(iCalendarData)

    return jcalData
  }
}

module.exports = new OpenPaasIcalToJcal()

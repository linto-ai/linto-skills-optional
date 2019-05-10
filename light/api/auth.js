/*
 * Copyright (c) 2018 Linagora.
 *
 * This file is part of Linto-Utility
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
'use strict'

const debug = require('debug')('auth')
const request = require('request')
const HUE_API_REFRESH = 'https://api.meethue.com/oauth2/refresh'

class HueAuth {
  make_base_auth(user, password) {
    let auth = user + ':' + password,
      hash = Buffer.from(auth).toString('base64')
    return 'Basic ' + hash
  }

  async refreshAccesToken(clientRemote, refreshToken) {
    var options = {
      method: 'POST',
      url: HUE_API_REFRESH,
      qs: { grant_type: 'refresh_token' },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: this.make_base_auth(clientRemote.clientId, clientRemote.clientSecret)
      },
      form: { refresh_token: refreshToken }
    }

    return new Promise(async(resolve, reject) => {
      request(options, async function(error, response, body) {
        if (error) reject(error)
        resolve(JSON.parse(body))
      })
    })
  }
}

module.exports = new HueAuth()

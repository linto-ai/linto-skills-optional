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

const debug = require('debug')('redmanager:flow:linto:api:openpaas:cal')
const request = require('request')
const uuidv1 = require('uuid/v1')
const opJcal = require('./lintoJcal')

class OpenPaasJcal {
  constructor(mail, password, host, language) {
    this.host = host
    let user = {
      mail,
      password
    }
    this.mail = mail
    this.language = language
    this.generateToken(user)
  }

  async generateToken(user) {
    let auth = await this.login(user)
    let userId = await this.userInfo(user)
    this.authorization = auth
    this.userId = userId
  }

  async login(user) {
    let options = {
      method: 'POST',
      url: this.host + '/api/jwt/generate',
      headers: {
        authorization: 'Basic ' +
          new Buffer.from(user.mail + ':' + user.password).toString('base64')
      }
    }

    let authToken = await this.makeRequest(options).then((data) => {
      return 'Bearer ' + data.body.substr(1).slice(0, -1)
    }, (err) => {
      console.error(err)
      debug('Unable to generate the authorization token')
    })
    return authToken
  }

  async userInfo(user) {
    var options = {
      method: 'GET',
      url: this.host + '/api/user',
      headers: {
        authorization: 'Basic ' +
          new Buffer.from(user.mail + ':' + user.password).toString('base64')
      }
    }

    let userId = await this.makeRequest(options).then((data) => {
      let res = JSON.parse(data.body)
      return res.id
    }, (err) => {
      console.error(err)
      debug('Unable to get user Id')
    })
    return userId
  }

  async searchPeople(name) {
    var options = {
      method: 'POST',
      url: this.host + '/api/people/search',
      headers: {
        'content-type': 'application/json',
        authorization: this.authorization
      },
      body: { q: name, objectTypes: ['user', 'contact', 'ldap'], limit: 10 },
      json: true
    }

    return await this.makeRequest(options).then((data) => {
      return data
    }, (err) => {
      console.error(err)
      debug('Unable to get the next event')
      return err
    })
  }

  async getNext() {
    var options = {
      method: 'GET',
      url: this.host + '/calendar/api/events/next',
      headers: {
        authorization: this.authorization
      }
    }
    return await this.makeRequest(options).then((data) => {
      return data
    }, (err) => {
      console.error(err)
      debug('Unable to get the next event')
      return err
    })
  }

  async vcalCreateEvent(event) {
    let jcal = opJcal.generateJcal(this.host, event, this.mail)
    var options = {
      method: 'PUT',
      url: this.host + '/dav/api/calendars/' + this.userId + '/' + this.userId
        + '/' + uuidv1() + '.ics',
      headers: {
        'content-type': 'application/calendar+json',
        authorization: this.authorization
      },
      body: jcal,
      json: true
    }

    return await this.makeRequest(options).then((data) => {
      return data
    }, (err) => {
      console.error(err)
      debug('Unable to create an event')
      return err
    })
  }

  async deleteNext() {
    var options = {
      method: 'DELETE',
      url: this.host + '/calendar/api/events/next',
      headers: {
        authorization: this.authorization
      }
    }
    return await this.makeRequest(options).then((data) => {
      return data
    }, (err) => {
      console.error(err)
      debug('Unable to delete the next event')
      return err
    })
  }

  makeRequest(options) {
    return new Promise(function(resolve, reject) {
      try {
        request(options, function(err, resp, body) {
          if (err) {
            reject(err)
          } else if (resp.statusCode === 401) { // Unauthorized
            reject({ body: 'Unauthorized', status: resp.statusCode })
          } else if (resp.statusCode === 500) { // Internal Server Error from the API
            reject({ body: 'Server Error', status: resp.statusCode })
          } else if (resp.statusCode === 200) { // OK
            resolve({ body, status: resp.statusCode })
          } else if (resp.statusCode === 201) { // OK
            resolve({ body, status: resp.statusCode })
          } else if (resp.statusCode === 404) { // OK - Nothing to do or find
            resolve({ body, status: resp.statusCode })
          } else { // Unknow status
            reject('OpenPaas Error')
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = OpenPaasJcal

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

const debug = require('debug')('hue')
const request = require('request'),
  auth = require('./auth.js')

const HUE_API_BRIDGE = 'https://api.meethue.com/bridge',
  UNAUTHORIZED_CODE = 401

class HueConnect {
  constructor(clientRemote, userId, accessToken, refreshToken) {
    this.clientRemote = clientRemote
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    this.setLight()
  }

  async setLight(){
    this.light = await this.getLightsMapping()
  }

  async makeRequest(options, isRefresh = true) {
    return new Promise(async(resolve, reject) => {
      request(options, async(error, response, body) => {
        if (error)
          throw new Error(error)

        if (response.statusCode === UNAUTHORIZED_CODE) {

          let responseJson = JSON.parse(body),
            errorCode = responseJson.fault.detail.errorcode

          if (errorCode === 'keymanagement.service.access_token_expired') {
            if (isRefresh) {
              let newToken = await auth.refreshAccesToken(this.clientRemote, this.refreshToken)
              this.accessToken = newToken.access_token
              this.refreshToken = newToken.refresh_token
              this.makeRequest(options, false)
            } else {
              debug('refresh_token_error', response)
              reject(response)
            }
          } else {
            debug('auth error', response)
            reject(response)
          }
        }
        debug(body)
        resolve(body)
        debug('status code', response.statusCode)
      })
    })
  }

  async switchLight(lightId, isOn, brigh) {
    let body = { on: isOn }
    if (brigh)
      body.bri = brigh

    var options = {
      method: 'PUT',
      url: HUE_API_BRIDGE + '/' + this.userId + '/lights/' + lightId + '/state',
      headers:
      {
        authorization: 'Bearer ' + this.accessToken,
        'content-type': 'application/json'
      },
      json: true,
      body
    }
    try {
      return await this.makeRequest(options)
    } catch (err) {
      return err
    }
  }

  async manageLight(lightId, brigh = 100, isInc = false) {
    let body = {}
    if (isInc) {
      body.bri_inc = brigh
    } else {
      body.bri = brigh
    }

    var options = {
      method: 'PUT',
      url: HUE_API_BRIDGE + '/' + this.userId + '/lights/' + lightId + '/state',
      headers:
      {
        authorization: 'Bearer ' + this.accessToken,
        'content-type': 'application/json'
      },
      json: true,
      body
    }
    try {
      return await this.makeRequest(options)
    } catch (err) {
      return err
    }
  }

  async getLightsData() {
    var options = {
      method: 'GET',
      url: HUE_API_BRIDGE + '/' + this.userId + '/lights',
      headers: { authorization: 'Bearer ' + this.accessToken }
    }
    try {
      return await this.makeRequest(options)
    } catch (err) {
      return err
    }
  }

  async getBridgeConfig() {
    var options = {
      method: 'GET',
      url: HUE_API_BRIDGE + '/' + this.userId + '/config',
      headers: { authorization: 'Bearer ' + this.accessToken }
    }
    try {
      return await this.makeRequest(options)
    } catch (err) {
      return err
    }
  }

  async getLightsMapping() {
    let lightsData = await this.getLightsData(),
      jsonLightsData = JSON.parse(lightsData)
    var keys = Object.keys(jsonLightsData)
    let output = []
    for (var i = 0; i < keys.length; i++) {
      output.push({ id: keys[i], name: jsonLightsData[keys[i]].name })
    }
    return output
  }

  async switchAllLight(isOn) {
    for (let i in this.light) {
      debug(this.light[i].id)
      await this.switchLight(this.light[i].id, isOn)
    }
  }

  async switchLightByName(name, isOn) {
    for (let i in this.light) {
      debug(this.light[i].name)
      if (this.light[i].name.indexOf(name) > -1) {
        await this.switchLight(this.light[i].id, isOn)
        return true
      }
    }
    return false
  }

  async switchAllBright(brigh, isInc) {
    for (let i in this.light) {
      await this.manageLight(this.light[i].id, brigh, isInc)
    }
  }
  async switchBrightByName(name, brigh, isInc) {
    for (let i in this.light) {
      debug(this.light[i].name)
      if (this.light[i].name.indexOf(name) > -1) {
        await this.manageLight(this.light[i].id, brigh, isInc)
        return true
      }
    }
    return false
  }
}

module.exports = HueConnect

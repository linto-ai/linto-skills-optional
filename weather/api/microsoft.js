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

const debug = require('debug')('redmanager:flow:optional:skill:weather:microsoft')
const weather = require('weather-js')
let lintoResponse
const KEY_ENTITIE_LOCATION = 'location'
const KEY_ENTITIE_TIME = 'time'

class WeatherMicrosoft {
    constructor(response, utility) {
        lintoResponse = response
        this.utility = utility
    }

    async callApi(requestInfo) {
        return new Promise((resolve, reject) => {
            try {
                weather.find({
                    search: requestInfo.city,
                    degreeType: requestInfo.temperature,
                    lang: requestInfo.language.split('-')[0]
                }, function (err, result) {
                    if (result !== undefined && result.length !== 0)
                        resolve(result)
                    reject(lintoResponse.error_city_weather + requestInfo.city)
                })
            } catch (err) {
                reject(lintoResponse.error_city_weather + requestInfo.city)
            }
        })
    }

    formatResponse(response, today) {
        if (today)
            return (response[0].location.name + lintoResponse.temperatureToday + response[0].current.temperature + response[0].location.degreetype + ', ' +
                lintoResponse.weatherTodayIs + response[0].current.skytext)
        else
            return (response[0].location.name + lintoResponse.temperatureNextDay + response[0].forecast[2].low + ' - ' + response[0].forecast[2].high + response[0].location.degreetype +
                ', ' + lintoResponse.weatherNextIs + response[0].forecast[2].skytextday)
    }

    async getWeather(payload, config) {
        let cityEntitie = this.utility.extractEntityFromType(payload, KEY_ENTITIE_LOCATION)
        let timeEntitie = this.utility.extractEntityFromType(payload, KEY_ENTITIE_TIME)

        if (config.language === undefined)
            config.language = process.env.DEFAULT_LANGUAGE

        cityEntitie === undefined ? config.city = config.defaultcity : config.city = cityEntitie.value
        if (config.city === undefined)
            return lintoResponse.error_no_city

        try {
            let response = await this.callApi(config)
            return this.formatResponse(response, (timeEntitie === undefined))
        } catch (err) {
            return lintoResponse.error_api
        }
    }
}

module.exports = WeatherMicrosoft
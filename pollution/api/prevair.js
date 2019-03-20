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

const debug = require('debug')('redmanager:flow:optional:skill:pollution:prevair')
const request = require('request')

const API_URL = 'http://www2.prevair.org/ineris-web-services.php?url=atmo&date='
const KEY_ENTITIE_LOCATION = 'location'

let lintoResponse

class PollutionPrevair {
    constructor(response, utility) {
        lintoResponse = response
        this.utility = utility
    }

    determinateAirQuality(airQualityStr) {
        let airQuality = parseInt(airQualityStr)
        if (airQuality <= 2) {
            return lintoResponse.air_quality.very_good
        } else if (airQuality <= 4) {
            return lintoResponse.air_quality.good
        } else if (airQuality <= 5) {
            return lintoResponse.air_quality.average
        } else if (airQuality <= 7) {
            return lintoResponse.air_quality.poor
        } else if (airQuality <= 9) {
            return lintoResponse.air_quality.bad
        } else {
            return lintoResponse.air_quality.very_bad
        }
    }

    formatAnswer(city, jsonResponse) {
        for (let i = 0; i < jsonResponse.length; i++) {
            if (jsonResponse[i][4] === city) {
                let airQuality = this.determinateAirQuality(jsonResponse[i][7])
                return city + lintoResponse.seuil + airQuality
            }
        }
        return city + lintoResponse.error_city_unfound
    }

    async getPolutionByCity(city) {
        return new Promise((resolve, reject) => {
            let date = (new Date().toISOString().split('T')[0]).replace(/-/g, "")

            request(API_URL + date, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body))
                } else {
                    reject(city + lintoResponse.error_api)
                }
            })
        })
    }

    async getPollution(payload, config) {
        let city
        try {
            if (this.utility.checkEntitiesRequire(payload, [KEY_ENTITIE_LOCATION]))
                city = payload.nlu.entities[0].value.toUpperCase()
            else if(config.defaultCity)
                city = config.defaultCity.toUpperCase()

            if (city !== undefined) {
                let result = await this.getPolutionByCity(city)
                return this.formatAnswer(city, result)
            } else {
                return lintoResponse.error_no_city
            }
        } catch (err) {
            return err
        }
    }
}

module.exports = PollutionPrevair
const debug = require('debug')('redmanager:flow:optional:skill:weather:microsoft')
const weather = require('weather-js')
let lintoResponse

class WeatherMicrosoft {
    constructor(response, language) {
        lintoResponse = response
        this.language = language
    }
    extractEntityFromType(entityArr, type) {
        for (let entity of entityArr) {
            if (entity.entity.includes(type)) {
                return entity
            }
        }
        return undefined
    }

    async callApi(requestInfo) {
        return new Promise((resolve, reject) => {
            try {
                weather.find({
                    search: requestInfo.city,
                    degreeType: requestInfo.temperature,
                    lang: this.language.split('-')[0]
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

    async getWeather(nlu, config) {
        let cityEntitie = this.extractEntityFromType(nlu.entities, 'location')
        let timeEntitie = this.extractEntityFromType(nlu.entities, 'time')

        cityEntitie === undefined ? config.city = config.defaultCity : config.city = cityEntitie.value

        try {
            let response = await this.callApi(config)
            return this.formatResponse(response, (timeEntitie === undefined))
        } catch (err) {
            return lintoResponse.error_api
        }
    }
}

module.exports = WeatherMicrosoft
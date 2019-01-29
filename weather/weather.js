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

module.exports = function (RED) {
    const debug = require('debug')('redmanager:flow:optional:skill:weather')
    const intent = require('./data/intent')
    const WeatherMicrosoft = require('./api/microsoft')
    let weatherApi
    let lintoResponse

    function loadLanguage(language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE
        lintoResponse = require('./locales/' + language + '/weather').weather.response
    }

    function intentDetection(inputNlu) {
        return (inputNlu.intent === intent.key)
    }

    function selectApi(config, language) {
        switch (config.api) {
            case 'microsoft':
                weatherApi = new WeatherMicrosoft(lintoResponse.microsoft, language)
                break;
            default:
                debug('Default API selected, microsoft weather')
                weatherApi = new WeatherMicrosoft(lintoResponse.microsoft, language)
        }
    }

    function Weather(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        try {
            loadLanguage(this.context().flow.get('language'))
        } catch (err) {
            node.error(RED._("weather.error.init_language"), err)
        }

        selectApi(config, this.context().flow.get('language'))

        node.on('input', async function (msg) {
            if (intentDetection(msg.payload.nlu)) {
                config.lang = this.context().flow.get('language')
                msg.payload = {
                    behavior: {
                        say: await weatherApi.getWeather(msg.payload.nlu, config)
                    }
                }
                node.send(msg)
            } else {
                debug("Nothing to do")
            }
        });
    }
    RED.nodes.registerType("weather-skill", Weather)
}
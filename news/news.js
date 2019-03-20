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

module.exports = function (RED) {
    const debug = require('debug')('redmanager:flow:optional:skill:news')
    const intent = require('./data/intent')
    const NewsApi = require('./api/newsApi')
    const utility = RED.settings.functionGlobalContext.utility
    let lintoResponse

    function News(config) {
        RED.nodes.createNode(this, config)
        if (utility) {
            this.status({})
            try {
                lintoResponse = utility.loadLanguage(__filename, 'news', this.context().flow.get('language'))
            } catch (err) {
                this.error(RED._("news.error.init_language"), err)
            }
            const newsApi = new NewsApi(config.api, lintoResponse, utility)

            this.on('input', async function (msg) {
                const intentDetection = utility.intentDetection(msg.payload, intent.key)
                if (intentDetection.isIntent) {
                    msg.payload = {
                        behavior: {
                            say: await newsApi.getNews(msg.payload)
                        }
                    }
                    this.send(msg)
                } else {
                    debug("Nothing to do")
                }
            })
        } else {
            this.status({
                fill: "red",
                shape: "ring",
                text: RED._("news.error.utility_undefined")
            });
            this.error(RED._("news.error.utility_error"))
        }
    }
    RED.nodes.registerType("news-skill", News)
}
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

const debug = require('debug')('redmanager:flow:optional:skill:news:lemonde')
const request = require('request');
const parser = require('xml2json')
const data = require('./data/lemonde')
const gender = data.type_gender
let lintoResponse

class NewsLeMonde {
    constructor(response, utility) {
        lintoResponse = response
        this.utility = utility
    }

    readNewsTitle(jsonStr) {
        let channel = JSON.parse(jsonStr).rss.channel
        let titleList = []
        for (let i = 0; i < 5; i++) {
            titleList.push(channel.item[i].title)
        }
        return titleList.toString().replace(/,/g, ', ')
    }

    async callApi(rubrique) {
        return new Promise(async (resolve, reject) => {
            request(data.api + rubrique + data.rss, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(parser.toJson(body))
                } else {
                    reject(error)
                }
            })
        })
    }

    async getNews(payload) {
        let newsTitles
        let actionEntity = this.utility.extractEntityFromPrefix(payload, gender.prefix)
        try {
            switch (true) {
                case (actionEntity === undefined):
                    newsTitles = await this.callApi(gender.type_international.value)
                    break
                case (actionEntity.entity === gender.type_cultural.entity_name):
                    newsTitles = await this.callApi(gender.type_cultural.value)
                    break
                case (actionEntity.entity === gender.type_international.entity_name):
                    newsTitles = await this.callApi(gender.type_international.value)
                    break
                case (actionEntity.entity === gender.type_pixel.entity_name):
                    newsTitles = await this.callApi(gender.type_pixel.value)
                    break
                case (actionEntity.entity === gender.type_politique.entity_name):
                    newsTitles = await this.callApi(gender.type_politique.value)
                    break
                case (actionEntity.entity === gender.type_societe.entity_name):
                    newsTitles = await this.callApi(gender.type_societe.value)
                    break
                case (actionEntity.entity === gender.type_sport.entity_name):
                    newsTitles = await this.callApi(gender.type_sport.value)
                    break
                case (actionEntity.entity === gender.type_world.entity_name):
                    newsTitles = await this.callApi(gender.type_world.value)
                    break
                default:
                    newsTitles = await this.callApi(gender.type_international.value)
                    break
            }
            return lintoResponse.title + this.readNewsTitle(newsTitles)
        } catch (err) {
            return lintoResponse.error_news_title
        }
    }
}
module.exports = NewsLeMonde
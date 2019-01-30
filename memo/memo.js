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
    const debug = require('debug')('redmanager:flow:optional:skill:memo')
    const intent = require('./data/intent')
    let lintoResponse

    function loadLanguage(language) {
        if (language === undefined)
            language = process.env.DEFAULT_LANGUAGE
        lintoResponse = require('./locales/' + language + '/memo').memo.response
    }

    function intentDetection(input) {
        return ((input.conversationData !== undefined && input.conversationData.intent === intent.key) || input.nlu.intent === intent.key)
    }

    function extractEntityFromType(entityArr, type) {
        for (let entity of entityArr)
            if (entity.entity.includes(type))
                return entity
        return undefined
    }

    function actionCreate(nlu, memoList) {
        let entityMemo = extractEntityFromType(nlu.entities, intent.entities.expression)
        if (entityMemo === undefined)
            return {
                say: lintoResponse.error_create_reminder_missing
            }

        memoList.push(entityMemo.value)
        return {
            say: lintoResponse.create + entityMemo.value,
            memoList
        }
    }

    function actionDeleteAsk(nlu) {
        return {
            ask: lintoResponse.delete,
            conversationData: nlu
        }
    }

    function actionList(memoList) {
        if (memoList.length > 0)
            return {
                say: lintoResponse.read + memoList
            }
        return {
            say: lintoResponse.empty
        }
    }

    function sayIntent(nlu, memoList) {
        let actionEntity = extractEntityFromType(nlu.entities, intent.entities.prefix)
        switch (true) {
            case (actionEntity === undefined):
                return {
                    say: lintoResponse.error_data_missing
                }
            case (actionEntity.entity === intent.entities.action_create):
                return actionCreate(nlu, memoList)
            case (actionEntity.entity === intent.entities.action_list):
                return actionList(memoList)
            case (actionEntity.entity === intent.entities.action_delete):
                return actionDeleteAsk(nlu)
            default:
                return {
                    say: lintoResponse.error_data_missing
                }
        }
    }

    function conversationIntent(nlu) {
        let acronymeEntity = extractEntityFromType(nlu.entities, intent.conversational_entities.prefix)
        if (acronymeEntity === undefined) {
            return {
                say: lintoResponse.error_data_missing
            }
        } else if (acronymeEntity.entity === intent.conversational_entities.toDelete) {
            return {
                say: lintoResponse.isDeleted,
                memoList: []
            }
        } else if (acronymeEntity.entity === intent.conversational_entities.toNotDelete) {
            return {
                say: lintoResponse.isNotDeleted
            }
        } else
            return {
                say: lintoResponse.error_data_missing
            }
    }

    function memoIntent(payload, memoList) {
        if (payload.conversationData === undefined) {
            return sayIntent(payload.nlu, memoList)
        } else {
            return conversationIntent(payload.nlu)
        }
    }

    function Memo(config) {
        RED.nodes.createNode(this, config)
        let node = this

        try {
            loadLanguage(this.context().flow.get('language'))
        } catch (err) {
            node.error(RED._("greeting.error.init_language"), err)
        }
        if (this.context().flow.memo === undefined) {
            this.context().flow.memo = new Array()
        }

        node.on('input', function (msg) {
            if (intentDetection(msg.payload)) {
                let response = memoIntent(msg.payload, this.context().flow.memo)
                if (response.memoList) {
                    this.context().flow.memo = response.memoList
                    delete response.memoList
                }
                msg.payload = {
                    behavior: response
                }
                node.send(msg)
            } else {
                debug("Nothing to do")
            }
        })
    }
    RED.nodes.registerType("memo-skill", Memo)
}
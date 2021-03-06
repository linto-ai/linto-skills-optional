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

module.exports = function(RED) {
  const debug = require('debug')('redmanager:flow:optional:skill:memo')
  const intent = require('./data/intent'),
    utility = require('@linto-ai/linto-skills-toolbox')
  let lintoResponse

  function actionCreate(payload, memoList) {
    let entityMemo = utility.extractEntityFromType(payload, intent.entities.expression)
    if (!entityMemo)
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

  function sayIntent(payload, memoList) {
    let actionEntity = utility.extractEntityFromPrefix(payload, intent.entities.prefix)
    switch (true) {
      case (!actionEntity):
        return {
          say: lintoResponse.error_data_missing
        }
      case (actionEntity.entity === intent.entities.action_create):
        return actionCreate(payload, memoList)
      case (actionEntity.entity === intent.entities.action_list):
        return actionList(memoList)
      case (actionEntity.entity === intent.entities.action_delete):
        return actionDeleteAsk(payload.nlu)
      default:
        return {
          say: lintoResponse.error_data_missing
        }
    }
  }

  function conversationIntent(payload) {
    let conv_entities = intent.conversational_entities,
      acronymeEntity = utility.extractEntityFromPrefix(payload, conv_entities.prefix)
    if (!acronymeEntity) {
      return {
        say: lintoResponse.error_data_missing
      }
    } else if (acronymeEntity.entity === conv_entities.toDelete) {
      return {
        say: lintoResponse.isDeleted,
        memoList: []
      }
    } else if (acronymeEntity.entity === conv_entities.toNotDelete) {
      return {
        say: lintoResponse.isNotDeleted
      }
    } else
      return {
        say: lintoResponse.error_data_missing
      }
  }

  function Memo(config) {
    RED.nodes.createNode(this, config)
    if (utility) {
      this.status({})
      try {
        let language = this.context().flow.get('language')
        lintoResponse = utility.loadLanguage(__filename, 'memo', language)
      } catch (err) {
        this.error(RED._('memo.error.init_language'), err)
      }

      if (!this.context().flow.memo) {
        this.context().flow.memo = []
      }

      this.on('input', function(msg) {
        const intentDetection = utility.intentDetection(msg.payload, intent.key, true)
        if (intentDetection.isIntent) {
          let response
          if (intentDetection.isConversational) {
            response = conversationIntent(msg.payload)
          } else {
            response = sayIntent(msg.payload, this.context().flow.memo)
          }

          if (response.memoList) {
            this.context().flow.memo = response.memoList
            delete response.memoList
          }

          msg.payload = {
            behavior: response
          }
          this.send(msg)
        } else {
          debug('Nothing to do')
        }
      })
    } else {
      this.status({
        fill: 'red',
        shape: 'ring',
        text: RED._('memo.error.utility_undefined')
      })
      this.error(RED._('memo.error.utility_error'))
    }
  }
  RED.nodes.registerType('memo-skill', Memo)
}

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

const debug = require("debug")("redmanager:flow:optional:skill:mail:jmap");
const request = require("request");
const mailAction = require('./data/jmap').type_action

const mailBoxes = [
    ["getMailboxes", {}, "#0"]
];
const messageList = [
    [
        "getMessageList",
        {
            fetchMessages: true,
            fetchMessageProperties: [
                "threadId",
                "mailboxId",
                "isUnread",
                "isFlagged",
                "islintoResponseed",
                "isDraft",
                "hasAttachment",
                "from",
                "to",
                "subject",
                "date",
                "preview"
            ],
            sort: ["date desc"]
        },
        "#0"
    ]
];

const READ_MAIL_NUMBER = 5;

let JMAP_HOST, JMAP_TOKEN
let JMAP_NAME_INBOX = 'INBOX';
let lintoResponse;

class MailJmap {
    constructor(response) {
        lintoResponse = response;
    }

    extractEntityFromType(entityArr, type) {
        for (let entity of entityArr)
            if (entity.entity.includes(type))
                return entity
        return undefined
    }

    optionsMessages(body) {
        return {
            method: "POST",
            url: JMAP_HOST,
            headers: {
                authorization: JMAP_TOKEN,
                accept: "application/json; charset=UTF-8",
                "content-type": "application/json; charset=UTF-8"
            },
            json: true,
            body: body
        };
    }

    async callApi(bodyRequest) {
        let option = this.optionsMessages(bodyRequest);
        return new Promise((resolve, reject) => {
            request(option, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        errorMsg: error,
                        statusCode: response.statusCode
                    });
                }
            });
        });
    }

    findInboxUnread(listInbox) {
        listInbox = listInbox[0][1].list;
        for (let i = 0; i < listInbox.length; i++) {
            if (listInbox[i].name === JMAP_NAME_INBOX) {
                return listInbox[i].unreadMessages + " / " + listInbox[i].totalMessages;
            }
        }
    }

    findInboxMessage(messageList) {
        let readMailNumber = READ_MAIL_NUMBER;
        let listMailTitle = "";

        messageList = messageList[1][1].list;

        if (messageList.length < READ_MAIL_NUMBER)
            readMailNumber = messageList.length;

        for (let i = 0; i < readMailNumber; i++) {
            listMailTitle += messageList[i].subject + ", ";
        }

        return listMailTitle.replace(/.$/, "");
    }

    findInboxLastMailContent(messageList) {
        return (
            messageList[1][1].list[0].from.name +
            " : " +
            messageList[1][1].list[0].preview
        );
    }

    async lastMail() {
        try {
            let lastMailList = messageList;
            lastMailList.limit = 1;
            let listMail = await this.callApi(lastMailList);
            let mailContent = this.findInboxLastMailContent(listMail);
            return lintoResponse.preview_mail + mailContent;
        } catch (err) {
            return lintoResponse.error_connect;
        }
    }

    async unreadMailCount() {
        try {
            let inboxContent = await this.callApi(mailBoxes);
            let myInboxUnread = this.findInboxUnread(inboxContent);
            return lintoResponse.unread_mail_number + myInboxUnread;
        } catch (err) {
            return lintoResponse.error_connect;
        }
    }

    async listMail() {
        try {
            let listMail = await this.callApi(messageList);
            let mailTitle = this.findInboxMessage(listMail);
            return lintoResponse.list_mail + mailTitle;
        } catch (err) {
            return lintoResponse.error_connect;
        }
    }

    async getMail(nlu, config) {
        JMAP_HOST = config.url;
        JMAP_TOKEN = config.key;
        if (config.inbox)
            JMAP_NAME_INBOX = config.inbox

        let actionEntity = this.extractEntityFromType(nlu.entities, mailAction.prefix)
        try {
            switch (true) {
                case (actionEntity === undefined):
                    return await this.lastMail()
                case (actionEntity.entity === mailAction.action_number):
                    return await this.unreadMailCount()
                case (actionEntity.entity === mailAction.action_read_last):
                    return await this.lastMail()
                case (actionEntity.entity === mailAction.action_read):
                    return await this.listMail()
                default:
                    return await this.lastMail()
            }
        } catch (err) {
            return lintoResponse.error_news_title
        }
    }
}

module.exports = MailJmap
"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const { LogClient } = require("loglib");
const BackendProxy = require("../backend_proxy");
const Repository = require("./repository");

const STATE = {
    /** Artifact not saved, no version yet */
    NO_FILE: "no_file",
    /** Artifact saved, no data uploaded yet */
    CREATED: "created",
    /** Artifact saved and data uploaded */
    COMMITED: "commited"
};

class Log extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.state = STATE.NO_FILE;
        this.repository = "Default";
        this.fileMeta = {};

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "log";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        assertProp(data, "state", false);
        assertProp(data, "fileMeta", false);

        if (event === "create") {
            assertProp(data, "name", true);
            assertType(data.name, "data.name", "string");
        } else if (event === "update") {
            assertProp(data, "name", false);
            assertProp(data, "repository", false);
        }

        if (data.repository) {
            assertType(data.repository, "data.repository", "string");

            const repository = await Repository.findOne({ _id: data.repository });
            if (!repository) {
                throw new Error("Repository doesn't exist");
            }
        }
    }

    static async append(id, data) {
        const log = await Log.findOne({ _id: id });
        const repository = await Repository.findOne({ _id: log.repository });
        const tags = [];

        if (data.time) {
            tags.push(data.time);
        }
        if (data.tag) {
            tags.push(data.tag);
        }
        if (data.level) {
            tags.push(data.level);
        }
        const prefix = tags.length > 0 ? `[${tags.join(" ")}] ` : "";
        const line = `${prefix}${data.str}`;
        await repository.appendLog(id, line);

        // If this is an empty saved log that we append into
        if (log.state !== STATE.COMMITED) {
            log.state = STATE.COMMITED;
            log.fileMeta.size = 0;
            log.fileMeta.mimeType = "text/plain";
        }

        log.fileMeta.size += line.length;
        await log.save();

        await LogClient.instance.publish(id, line.replace(/\n$/, ""));
    }

    async _saveHook(/* olddata */) {
        if (this.state === STATE.NO_FILE) {
            const repository = await Repository.findOne({ _id: this.repository });
            await repository.saveLog(this);
            this.state = STATE.CREATED;
        }
    }

    async _removeHook() {
        const repository = await Repository.findOne({ _id: this.repository });
        await repository.removeLog(this);
    }

    async upload(fileStream) {
        if (this.state === STATE.COMMITED) {
            throw new Error("Log already uploaded");
        }

        const repository = await Repository.findOne({ _id: this.repository });

        const uploadInfo = await repository.uploadLog(this, fileStream);

        this.state = STATE.COMMITED;
        this.fileMeta.size = fileStream.bytesRead;
        this.fileMeta.mimeType = fileStream.mimeType;
        this.fileMeta.path = fileStream.path;
        this.fileMeta.filename = fileStream.filename;
        this.fileMeta.fieldname = fileStream.fieldname;
        this.backendFileInfo = uploadInfo;

        await this.save();
    }

    async download() {
        if (this.state !== STATE.COMMITED) {
            const error = new Error("No log uploaded");
            error.status = 404;
            throw error;
        }

        const repository = await Repository.findOne({ _id: this.repository });

        return await BackendProxy.instance.getLogReadStream(repository, this);
    }

    async getLastLines(limit) {
        if (this.state !== STATE.COMMITED) {
            const error = new Error("No log uploaded");
            error.status = 404;
            throw error;
        }

        const repository = await Repository.findOne({ _id: this.repository });

        return await BackendProxy.instance.getLastLines(repository, this, limit);
    }
}

module.exports = Log;

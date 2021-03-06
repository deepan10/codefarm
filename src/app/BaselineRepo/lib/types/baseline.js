"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");
const Repository = require("./repository");

class Baseline extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.repository = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "baseline";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    async _saveHook(olddata) {
        const repository = await Repository.findOne({ _id: this.repository });
        if (!repository) {
            throw new Error(`Repository ${this.repository} doesn't exist`);
        }
        if (!olddata) {
            // Add initial tags configured per repository
            const initialTags = repository.initialBaselineTags.filter((t) => !this.tags.includes(t));
            this.tags.splice(this.tags.length, 0, ...initialTags);

            await BackendProxy.instance.createBaseline(repository, this);
        } else {
            await BackendProxy.instance.updateBaseline(repository, this, olddata);
        }
    }

    async _removeHook() {
        const repository = await Repository.findOne({ _id: this.repository });
        await BackendProxy.instance.removeBaseline(repository, this);
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", false);

            assertType(data.name, "data.name", "string");
            assertType(data.repository, "data.repository", "string");

            // Check that repository exists
            const repository = await Repository.findOne({ _id: data.repository });
            if (!repository) {
                throw new Error(`Repository ${data.repository} doesn't exist`);
            }
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "name", false);
            assertProp(data, "repository", false);
        }
    }
}

module.exports = Baseline;

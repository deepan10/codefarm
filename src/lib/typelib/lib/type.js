"use strict";

const { v4: uuid } = require("uuid");
const { assertProp, assertType, ensureArray, synchronize } = require("misc");
const clone = require("clone");
const WeakValueMap = require("weakvaluemap");
const notification = require("./notification");

const typeInstanceMaps = {};

class Type {
    constructor() {
        this.type = this.constructor.getType();
        this._id = uuid();
        this.created = new Date();
        this.saved = false;
        this.tags = [];
        this.refs = [];
        this.comments = [];

        synchronize(this, "save");
        synchronize(this, "remove");
        synchronize(this, "tag");
        synchronize(this, "untag");
        synchronize(this, "addRef");
        synchronize(this, "comment");
        synchronize(this, "uncomment");
    }

    static getType() {
        return `${this.serviceName}.${this.typeName}`;
    }

    getRef(name) {
        const ref = {
            _ref: true,
            id: this._id,
            type: this.constructor.getType()
        };
        if (name) {
            ref.name = name;
        }

        return ref;
    }

    serialize() {
        return this._serializeForDb();
    }

    _serializeForDb() {
        /* Perform serialization in two steps:
         * 1. Remove properties on first level (not in nested objects):
         *   - internal fields prefixed with __
         *   - functions
         * 2. Do clone
         * We clone using clone which clones functions as well. Assume that
         * types doesn't have any functions nested in objects.
         */
        const data = Object.assign({}, this);
        for (const key of Object.keys(data)) {
            if (key.startsWith("__") || (typeof data[key] === "function")) {
                delete data[key];
            }
        }

        return clone(data);
    }

    static async validateBase(event, data) {
        assertProp(data, "type", false);
        assertProp(data, "created", false);
        assertProp(data, "saved", false);
    }

    static async validate(/* event, data */) {
    }

    static get _typeInstanceMap() {
        if (!typeInstanceMaps[this]) {
            typeInstanceMaps[this] = new WeakValueMap(this.typeName);
        }

        return typeInstanceMaps[this];
    }

    set(data) {
        for (const key of Object.keys(data)) {
            this[key] = data[key];
        }

        // Add instance to weak-map indexed by this._id
        const typeInstanceMap = this.constructor._typeInstanceMap;
        if (!typeInstanceMap.get(this._id)) {
            typeInstanceMap.set(this._id, this);
        }
    }

    // This exists to be able to override create, to instead return
    // an existing item if that is the use case on create
    static async factory(data) {
        const obj = this._instantiate(data);

        await obj.save();

        return obj;
    }

    static _instantiate(data) {
        if (data._id) {
            const typeInstanceMap = this._typeInstanceMap;
            const obj = typeInstanceMap.get(data._id);
            if (obj) {
                // Obj is in-memory instance, this is the latest copy.
                return obj;
            }
        }

        return new this(data);
    }

    static async _getDb() {
        throw new Error("No DB defined for type");
    }

    static async _getMb() {
        return false;
    }

    static async findMany(query, options) {
        const db = await this._getDb();
        const list = await db.find(this.typeName, query, options);

        return list.map(this._instantiate.bind(this));
    }

    static async findOneRaw(query, options) {
        const db = await this._getDb();
        const data = await db.findOne(this.typeName, query, options);

        if (!data) {
            return null;
        }

        return data;
    }

    static async findOne(query, options) {
        const data = await this.findOneRaw(query, options);

        if (!data) {
            return null;
        }

        return this._instantiate(data);
    }

    static async findRef(ref, options) {
        assertType(ref, "ref", "ref");
        if (ref.type !== this.getType) {
            throw new Error("ref.type doesn't match type");
        }
        if (ref.id.constructor === Array) {
            return this.findMany({
                _id: {
                    $in: ref.id
                }
            }, options);
        }

        return this.findOne({ _id: ref.id }, options);
    }

    async _saveHook() {
    }

    async _removeHook() {
    }

    async notifyEvent(event, oldData, newData) {
        const mb = await this.constructor._getMb();
        let emittedEvent = null;

        if (mb) {
            emittedEvent = await mb.emitEvent([], event, this.type, oldData, newData);
        }

        await notification.emit(`${this.constructor.typeName}.${event}`, this);

        return emittedEvent;
    }

    async save() {
        const old = await this.constructor.findOneRaw({ _id: this._id });
        const event = old ? "updated" : "created";

        this.saved = new Date();

        await this._saveHook(old);
        const newObj = this.serialize();
        const newObjDb = this._serializeForDb();

        const db = await this.constructor._getDb();
        if (old) {
            await db.updateOne(this.constructor.typeName, newObjDb);
        } else {
            await db.insertOne(this.constructor.typeName, newObjDb);
        }

        // Emit event in next tick since event listeners might save
        process.nextTick(() => {
            this.notifyEvent(event, old, newObj);
        });
    }

    async remove() {
        const old = await this.constructor.findOneRaw({ _id: this._id });

        if (old) {
            await this._removeHook();

            // Remove from _typeInstanceMap
            this.constructor._typeInstanceMap.remove(this._id);

            const db = await this.constructor._getDb();
            await db.removeOne(this.constructor.typeName, this._id);

            process.nextTick(() => {
                this.notifyEvent("removed", old, null);
            });
        }
    }

    async tag(tag) {
        if (!tag) {
            throw new Error("Can not tag with null");
        }

        let newTags = ensureArray(tag);
        newTags = newTags.filter((newTag) => !this.tags.includes(newTag));

        if (newTags.length === 0) {
            return;
        }

        this.tags.splice(this.tags.length, 0, ...newTags);

        await this.save();
        await notification.emit(`${this.constructor.typeName}.tagged`, this, tag);
    }

    async untag(tag) {
        if (!tag) {
            throw new Error("Can not tag with null");
        }

        const tagIndiciesToRemove = ensureArray(tag)
            .map((tagToRemove) => this.tags.indexOf(tagToRemove))
            .filter((tagIndex) => tagIndex !== -1);

        if (tagIndiciesToRemove.length === 0) {
            return;
        }

        for (const index of tagIndiciesToRemove) {
            this.tags.splice(index, 1);
        }

        await this.save();
        await notification.emit(`${this.constructor.typeName}.untagged`, this, tag);
    }

    async addRef(ref) {
        if (!ref) {
            throw new Error("Can not add null ref");
        }

        if (typeof ref !== "object") {
            throw new Error("ref is not an object");
        }

        const newRefs = ensureArray(ref);
        for (const newRef of newRefs) {
            // Check valid ref object
            assertProp(newRef, "id", true);
            assertProp(newRef, "type", true);
            assertProp(newRef, "name", true);

            if (!((typeof newRef.id === "string") || (newRef.id instanceof Array))) {
                throw new Error("ref.id must be an array or of type string");
            }

            assertType(newRef.type, "ref.type", "string");
            assertType(newRef.name, "ref.name", "string");
            newRef._ref = true;
        }

        this.refs.splice(this.refs.length, 0, ...newRefs);

        await this.save();
        await notification.emit(`${this.constructor.typeName}.ref_added`, this, ref);
    }

    async comment(comment) {
        comment.id = uuid();

        this.comments.push(comment);

        await this.save();
        await notification.emit(`${this.constructor.typeName}.commented`, this, comment);
    }

    async uncomment(id) {
        if (!id) {
            throw new Error("Can not uncomment without id");
        }

        const index = this.comments.findIndex((comment) => comment.id === id);

        if (index === -1) {
            return;
        }

        const comment = this.comments.splice(index, 1)[0];

        await this.save();
        await notification.emit(`${this.constructor.typeName}.uncommented`, this, comment);
    }
}

module.exports = Type;

"use strict";

const api = require("api.io");
const { ServiceMgr } = require("service");

let instance;

const typeApiExports = api.register("type", {
    get: api.export(async (session, type, query) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(`/${typeName}`, query);
    }),
    getter: api.export(async (session, type, id, getter) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(`/${typeName}/${id}/${getter}`);
    }),
    action: api.export(async (session, type, id, action, data = {}, query = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.post(`/${typeName}/${id}/${action}`, data, query);
    })
});

class TypeApi {
    constructor() {
        this.exports = typeApiExports;
        this.subscriptions = [];
        this.clients = [];
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        this.subscriptions.push(api.on("connection", (client) => {
            this.clients.push(client);
            client.session.subscriptions = [];
        }));

        this.subscriptions.push(api.on("disconnection", (client) => {
            const index = this.clients.indexOf(client);

            if (index !== -1) {
                this.clients.splice(index, 1);
            }
        }));

        const mb = await ServiceMgr.instance.msgBus;

        mb.on("data", this.onEvent.bind(this));
    }

    async onEvent(data) {
        const event = `${data.event}.${data.type}`;
        const payload = {
            olddata: data.olddata,
            newdata: data.newdata
        };

        typeApiExports.emit(event, payload);
        ServiceMgr.instance.log("debug", "Emit event", event, payload);

        const id = data.newdata ? data.newdata._id : data.olddata._id;

        const eventId = `${event}.${id}`;
        typeApiExports.emit(eventId, payload);
        ServiceMgr.instance.log("debug", "Emit event", eventId, payload);
    }

    async dispose() {
        for (const subscription of this.subscriptions) {
            api.off(subscription);
        }
    }
}

module.exports = TypeApi;

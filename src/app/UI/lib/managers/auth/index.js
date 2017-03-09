"use strict";

const singleton = require("singleton");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const jwt = require("jsonwebtoken");
const { ensureArray } = require("misc");

const TOKEN_EXPIRES_IN = "5 days";

class Auth {
    constructor() {
        this.routes = [];
    }

    get cookieName() {
        return this._cookieName;
    }

    get publicKey() {
        return this._publicKey;
    }

    async start(config) {
        if (config.web.auth) {
            this._cookieName = config.web.jwtCookieName;
        }
        this._addRoute("post", "/login", this._login, "User login");

        this._publicKey = config.publicKey;
        if (this._publicKey) {
            ServiceMgr.instance.log("info", "JWT public key setup");
        }
    }

    async dispose() {
        this.routes = [];
        this._privateKey = null;
    }

    async _getUserPrivileges(user) {
        const client = ServiceComBus.instance.getClient("userrepo");
        const policyIds = user.policyRefs
            .map((ref) => ensureArray(ref.id))
            .reduce((acc, val) => acc.concat(val), []);
        let policies = [];
        if (policyIds.length > 0) {
            policies = await client.list("policy", {
                _id: {
                    $in: policyIds
                }
            });
        }

        // Get all privileges from policies and remove duplicates
        const privileges = policies
            .map((policy) => policy.privileges)
            .reduce((acc, val) => acc.concat(val), [])
            .filter((priv, index, self) => self.indexOf(priv) === index);

        return privileges;
    }

    async login(email, password) {
        if (typeof email !== "string") {
            throw new Error("email required");
        }

        if (email.length === 0) {
            throw new Error("email of non-zero length required");
        }

        if (typeof password !== "string") {
            throw new Error("password required");
        }

        const client = ServiceComBus.instance.getClient("userrepo");
        // Get user with email
        const users = await client.list("user", { email });
        if (!(users instanceof Array)) {
            throw new Error(`Expected array result, got data: ${JSON.stringify(users)}`);
        }
        let authenticated = false;
        if (users.length === 1) {
            // TODO: Secure communication below!
            const authResponse = await client.call("auth", "user", users[0]._id, { password });
            authenticated = authResponse.authenticated;
        }

        let result;

        if (authenticated) {
            const user = users[0];
            const scope = user.scope || "default";
            const priv = await this._getUserPrivileges(user);
            const tokenData = {
                username: user.name,
                scope: [ scope ],
                id: user._id,
                priv
            };
            const tokenOpts = {
                expiresIn: TOKEN_EXPIRES_IN
            };
            const token = await this._createToken(tokenData, tokenOpts);

            if (token) {
                result = {
                    success: true,
                    user: tokenData,
                    token
                };
            } else {
                result = {
                    success: false,
                    message: "Server failed to create token"
                };
            }
        } else {
            result = {
                success: false,
                message: "Invalid username or password"
            };
        }

        return result;
    }

    async _login(ctx) {
        const data = ctx.request.body;

        const result = await this.login(data.email, data.password);

        if (result.cookieName && result.token) {
            ctx.cookies.set(result.cookieName, result.token);
        }
        ctx.type = "json";
        ctx.body = JSON.stringify(result);
    }

    _addRoute(method, route, handler, description = "") {
        this.routes.push({
            method: method,
            route: route,
            handler: handler.bind(this),
            description: description
        });
    }

    async _createToken(data) {
        const client = ServiceComBus.instance.getClient("mgmt");

        return client.createtoken("service", "", data);
    }

    async _verifyToken(data, opts = {}) {
        if (!this._publicKey) {
            return false;
        }

        return new Promise((resolve, reject) =>
            jwt.verify(data, this._publicKey, opts, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        );
    }
}

module.exports = singleton(Auth);

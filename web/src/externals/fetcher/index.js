class ErrorChecker {

    constructor(promise) {
        this.promise = promise;
        this.error = null;
    }

    catchNetworkError() {
        this.promise = this.promise.catch((networkError) => {
            if (this.error) {
                return;
            }

            this.error = {
                type: 'network',
                text: String(networkError),
                code: NaN,
                data: networkError,
            };
        });
        return this;
    }

    checkHttpError(predicate) {
        this.promise = this.promise.then((httpResp) => {
            if (this.error) {
                return;
            }

            if (!predicate(httpResp)) {
                this.error = {
                    type: 'http',
                    text: httpResp.statusText,
                    code: httpResp.status,
                    data: httpResp,
                };
                return;
            }

            return httpResp.json();
        });
        return this;
    }

    catchJsonError() {
        this.promise = this.promise.catch((jsonError) => {
            if (this.error) {
                return;
            }

            this.error = {
                type: 'json',
                text: String(jsonError),
                code: NaN,
                data: jsonError,
            };
        });
        return this;
    }

    checkServiceError(predicate) {
        this.promise = this.promise.then((serviceResp) => {
            if (this.error) {
                return;
            }

            if (!predicate(serviceResp)) {
                this.error = {
                    type: 'service',
                    text: serviceResp.message,
                    code: serviceResp.code,
                    data: serviceResp,
                };
                return;
            }

            return serviceResp;
        });
        return this;
    }

    end() {
        this.promise = this.promise.then((serviceResp) => {
            if (!this.error) {
                return serviceResp;
            }
            return Promise.reject(this.error);
        });
        return this.promise;
    }

}

const postSpecs = {

    form: {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: (params) => {
            const body = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => body.set(k, v));
            return body;
        },
    },

    json: {
        headers: {
            'Content-Type': 'application/json',
        },
        body: (params) => {
            return JSON.stringify(params);
        },
    },

};

class Fetcher {

    constructor(config) {
        this.parseConfig(config);
    }

    parseConfig(config) {
        this.config = config;
        this.postSpec = postSpecs[config.postType] || postSpecs.form;
        this.predicates = Object.assign({
            http: (resp) => resp.ok,
            service: () => true,
        }, this.config.predicates);
        this.urlPrefix = config.urlPrefix || '';
    }

    request(url, init) {
        url = this.urlPrefix + url;
        const promise = fetch(url, init);
        return new ErrorChecker(promise)
            .catchNetworkError()
            .checkHttpError(this.predicates.http)
            .catchJsonError()
            .checkServiceError(this.predicates.service)
            .end();
    }

    get(url, params = {}) {
        const query = postSpecs.form.body(params).toString();
        return this.request(`${url}?${query}`, {
            method: 'GET',
            credentials: 'include',
        });
    }

    post(url, params = {}) {
        return this.request(url, {
            method: 'POST',
            credentials: 'include',
            headers: this.postSpec.headers,
            body: this.postSpec.body(params),
        });
    }

    upload(url, params = {}) {
        const body = new FormData();
        Object.entries(params).forEach(([k, v]) => body.append(k, v));
        return this.request(url, {
            method: 'POST',
            credentials: 'include',
            headers: this.postSpec.form.headers,
            body: body,
        });
    }

}

export {Fetcher};

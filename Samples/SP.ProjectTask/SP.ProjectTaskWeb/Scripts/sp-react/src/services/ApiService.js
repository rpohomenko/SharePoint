export class ApiService {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    get = async(url, options) => {
        options = options || {};
        options.method = 'GET';
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }

    post = async(url, options, data) => {
        options = options || {};
        options.method = 'POST';
        if (data) {
            options.body = JSON.stringify(data);
        }
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }
}
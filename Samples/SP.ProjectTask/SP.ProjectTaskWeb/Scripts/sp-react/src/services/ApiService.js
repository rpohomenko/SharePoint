export class ApiService {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    get = async(url, options) => {
        options = options || {};
        options.method = 'get';
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl).href : url, options);
    }

    post = async(url, options, data) => {
        options = options || {};
        options.method = 'post';
        if (data) {
            options.body = JSON.stringify(data);
        }
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl).href : url, options);
    }
}
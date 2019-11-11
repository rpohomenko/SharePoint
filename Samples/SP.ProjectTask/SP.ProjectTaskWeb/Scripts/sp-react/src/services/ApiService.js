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
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }

    put = async(url, options, data) => {
        options = options || {};
        options.method = 'PUT';
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }

    delete = async(url, options) => {
        options = options || {};
        options.method = 'DELETE';      
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }
}
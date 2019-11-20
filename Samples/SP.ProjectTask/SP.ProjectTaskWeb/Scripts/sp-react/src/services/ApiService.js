export class ApiService {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    get = async(url, options) => {
        options = options || {};
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        };
        options.method = 'GET';
        options.cache = "no-cache";
        //options.mode = 'cors'; // no-cors, cors, *same-origin
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }

    post = async(url, options, data) => {
        options = options || {};
        options.method = 'POST';
        options.cache = "no-cache";
        //options.mode = 'cors'; // no-cors, cors, *same-origin
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
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        };
        options.cache = "no-cache";
        //options.mode = 'cors'; // no-cors, cors, *same-origin
        if (data) {
            options.body = JSON.stringify(data);
        }
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }

    delete = async(url, options) => {
        options = options || {};
        options.method = 'DELETE';
        options.cache = "no-cache";
        //options.mode = 'cors'; // no-cors, cors, *same-origin   
        return await fetch(this._baseUrl ? new URL(url, this._baseUrl) : url, options);
    }
}
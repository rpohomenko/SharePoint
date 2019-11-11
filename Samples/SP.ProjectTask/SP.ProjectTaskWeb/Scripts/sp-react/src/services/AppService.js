import { ApiService } from "./ApiService";

const BASE_PATH = (window._spPageContextInfo == undefined ? "https://localhost:44318" : "");

export class AppService extends ApiService {

    constructor() {
        super(BASE_PATH);
    }

    getTasks = async(count, nextPageToken, sortBy, sortDesc, filter, options) => {
        return await this.get(`/api/web/tasks?count=${count}&pagingToken=${encodeURIComponent(nextPageToken || "")}&where=${encodeURIComponent(filter || "")}&sortBy=${encodeURIComponent(sortBy || "")}&sortDesc=${sortDesc || false}`, options);
    }

    getTask = async(id, options) => {
        return await this.get(`/api/web/tasks/${id}`, options);
    }
}
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

    saveTask = async(item, options) => {      
        if(item && item.Id > 0){
            return await this.put(`/api/web/tasks`, options, item);
        }
        return await this.post(`/api/web/tasks`, options,  item);
    }

    deleteTask = async(ids, options) => {
        return await this.delete(`/api/web/tasks?ids=${ids.join(',')}`, options);
    }
}
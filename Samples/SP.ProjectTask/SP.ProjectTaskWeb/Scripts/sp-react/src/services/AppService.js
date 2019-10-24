import { ApiService } from "./ApiService";
import Constants from '../Constants';
import {get } from "https";

export class AppService extends ApiService {
    constructor() {
        super(Constants.BASE_PATH);
    }

    getTasks = async(count, nextPageToken, sortBy, sortDesc, filter, options) => {
        return await this.get(`api/web/tasks?count=${count}&pagingToken=${encodeURIComponent(nextPageToken || "")}&where=${encodeURIComponent(filter || "")}&sortBy=${encodeURIComponent(sortBy || "")}&sortDesc=${sortDesc || false}`, options);
    }
}
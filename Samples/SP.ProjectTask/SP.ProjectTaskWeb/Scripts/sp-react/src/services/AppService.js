import {
    ApiService
} from "./ApiService";
import {
    isArray
} from "util";

const BASE_PATH = (window._spPageContextInfo == undefined ? "https://localhost:44318" : "");

export class AppService extends ApiService {

    constructor() {
        super(BASE_PATH);
    }

    _getQuery = (count, nextPageToken, sortBy, groupBy, filter, fields) => {
        let query = `count=${count}&pagingToken=${encodeURIComponent(nextPageToken || "")}&where=${encodeURIComponent(filter || "")}&sortBy=${encodeURIComponent(sortBy || "")}&groupBy=${encodeURIComponent(groupBy || "")}`;
        if (isArray(fields)) {
            query += "&" + fields.map(field => `fields=${field}`).join('&');
        }
        return query;
    }

    // Tasks

    getTasks = async (count, nextPageToken, sortBy, groupBy, filter, fields, options) => {
        return await this.get(`/api/web/tasks?${this._getQuery(count, nextPageToken, sortBy, groupBy, filter, fields)}`, options);
    }

    getTask = async (id, options) => {
        return await this.get(`/api/web/tasks/${id}`, options);
    }

    saveTask = async (item, options) => {
        if (item && item.Id > 0) {
            return await this.put(`/api/web/tasks`, options, item);
        }
        return await this.post(`/api/web/tasks`, options, item);
    }

    deleteTask = async (ids, options) => {
        return await this.delete(`/api/web/tasks?ids=${ids.join(',')}`, options);
    }

    // Projects

    getProjects = async (count, nextPageToken, sortBy, groupBy, filter, fields, options) => {
        return await this.get(`/api/web/projects?${this._getQuery(count, nextPageToken, sortBy, groupBy, filter, fields)}`, options);
    }

    getProject = async (id, options) => {
        return await this.get(`/api/web/projects/${id}`, options);
    }

    saveProject = async (item, options) => {
        if (item && item.Id > 0) {
            return await this.put(`/api/web/projects`, options, item);
        }
        return await this.post(`/api/web/projects`, options, item);
    }

    deleteProject = async (ids, options) => {
        return await this.delete(`/api/web/projects?ids=${ids.join(',')}`, options);
    }

    // Employees

    getEmployees = async (count, nextPageToken, sortBy, groupBy, filter, fields, options) => {
        return await this.get(`/api/web/employees?${this._getQuery(count, nextPageToken, sortBy, groupBy, filter, fields)}`, options);
    }

    getEmployee = async (id, options) => {
        return await this.get(`/api/web/employees/${id}`, options);
    }

    saveEmployee = async (item, options) => {
        if (item && item.Id > 0) {
            item.FullName = `${item.FirstName} ${item.LastName}`;
            return await this.put(`/api/web/employees`, options, item);
        }
        return await this.post(`/api/web/employees`, options, item);
    }

    deleteEmployee = async (ids, options) => {
        return await this.delete(`/api/web/employees?ids=${ids.join(',')}`, options);
    }

    // Departments

    getDepartments = async (count, nextPageToken, sortBy, groupBy, filter, fields, options) => {
        return await this.get(`/api/web/departments?${this._getQuery(count, nextPageToken, sortBy, groupBy, filter, fields)}`, options);
    }

    getDepartment = async (id, options) => {
        return await this.get(`/api/web/departments/${id}`, options);
    }

    saveDepartment = async (item, options) => {
        if (item && item.Id > 0) {
            return await this.put(`/api/web/departments`, options, item);
        }
        return await this.post(`/api/web/departments`, options, item);
    }

    deleteDepartment = async (ids, options) => {
        return await this.delete(`/api/web/departments?ids=${ids.join(',')}`, options);
    }

    deploy = async (options) => {
        return await this.post(`/api/web/deploy`, options);
    }

    retract = async (options) => {
        return await this.post(`/api/web/retract`, options);
    }

    getUsers = async (searchTerm, limit, options) => {
        return await this.get(`/api/web/users/${searchTerm}/${limit}`, options);
    }
}
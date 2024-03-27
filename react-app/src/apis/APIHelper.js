import axios from 'axios';

// For any sequential api calls we may need
const instance = axios.create({
    baseURL: window.location.href,
    responseType: 'json'
});

export function put(endpoint, data) {
    return instance({
        method: 'put',
        url: endpoint,
        data
    });
}

export function get(endpoint, data) {
    return instance({
        method: 'get',
        url: endpoint,
        data
    });
}
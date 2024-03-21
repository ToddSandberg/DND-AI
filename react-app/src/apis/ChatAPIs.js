import { put } from './APIHelper';

export function submit(message) {
    return put('submit', { message });
}

export function getHistory() {
    return put('history');
}
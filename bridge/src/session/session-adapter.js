import EventEmitter from 'events';
import {handleMethod} from '../method';
import {pushEvent} from '../event';

export class SessionAdapter extends EventEmitter {

    constructor(id, fews, bews, store) {
        super();
        this.id = id;
        this.fews = fews;
        this.bews = bews;
        this.store = store;
        this.initListeners();
    }

    initListeners() {
        this.initFewsListeners();
        this.initBewsListeners();
    }

    initFewsListeners() {
        this.fews.on('message', this.onFewsMessage);
        this.fews.on('close', this.onFewsClose);
        this.fews.on('error', this.onFewsError);
    }

    initBewsListeners() {
        this.bews.on('message', this.onBewsMessage);
        this.bews.on('close', this.onBewsClose);
        this.bews.on('error', this.onBewsError);
    }

    stopListeners() {
        this.stopFewsListeners();
        this.stopBewsListeners();
    }

    stopFewsListeners() {
        this.fews.removeListener('message', this.onFewsMessage);
        this.fews.removeListener('close', this.onFewsClose);
        this.bews.removeListener('error', this.onFewsError);
    }

    stopBewsListeners() {
        this.bews.removeListener('message', this.onBewsMessage);
        this.bews.removeListener('close', this.onBewsClose);
        this.bews.removeListener('error', this.onBewsError);
    }

    destroy() {
        this.stopListeners();
        this.fews.close();
        this.bews.close();
        this.id = null;
        this.fews = null;
        this.bews = null;
        this.store = null;
    }

    updateFrontend(fews) {
        this.stopFewsListeners();
        this.fews.close();
        this.fews = fews;
        this.initFewsListeners();
    }

    updateBackend(bews) {
        this.stopBewsListeners();
        this.bews.close();
        this.bews = bews;
        this.initBewsListeners();
    }

    onFewsMessage = async (data) => {
        console.log(this.fews.id, 'message', data);
        const req = JSON.parse(data);
        const resp = await handleMethod(req);
        const sendData = JSON.stringify(resp);
        console.log(this.fews.id, 'send', sendData);
        this.fews.send(sendData);
    }

    onFewsClose = (code, message) => {
        console.log(this.fews.id, 'close',  code, message);
        this.emit('close', 'frontend');
    }

    onFewsError = (error) => {
        console.log(this.fews.id, 'error', error);
    }

    onBewsMessage = async (data) => {
        console.log(this.bews.id, 'message', data);
        const event = await pushEvent.consoleLog(data);
        const sendData = JSON.stringify(event);
        console.log(this.bews.id, 'send', sendData);
        this.fews.send(sendData);
    }

    onBewsClose = (code, message) => {
        console.log(this.bews.id, 'close',  code, message);
        this.emit('close', 'backend');
    }

    onBewsError = (error) => {
        console.log(this.bews.id, 'error', error);
    }

}

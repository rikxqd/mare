import EventEmitter from 'events';
import {FrontendModem} from '../modem/frontend-modem';
import {BackendModem} from '../modem/backend-modem';

export class Adapter extends EventEmitter {

    constructor(id, fews, bews, store) {
        super();
        this.id = id;
        this.fews = fews;
        this.bews = bews;
        this.store = store;
        this.fm = new FrontendModem();
        this.bm = new BackendModem();

        this.initFewsListeners();
        this.initBewsListeners();
        this.initFmListeners();
        this.initBmListeners();
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

    initFmListeners() {
        this.fm.on('send-frontend', this.onFmSendFrontend);
        this.fm.on('send-backend', this.onFmSendBackend);
    }

    initBmListeners() {
        this.bm.on('send-frontend', this.onBmSendFrontend);
        this.bm.on('send-backend', this.onBmSendBackend);
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

    stopFmListeners() {
        this.fm.removeListener('send-frontend', this.onFmSendFrontend);
        this.fm.removeListener('send-backend', this.onFmSendBackend);
    }

    stopBmListeners() {
        this.bm.removeListener('send-frontend', this.onBmSendFrontend);
        this.bm.removeListener('send-backend', this.onBmSendBackend);
    }

    close() {
        this.stopFewsListeners();
        this.stopBewsListeners();
        this.stopFmListeners();
        this.stopBmListeners();
        this.fews.close();
        this.bews.close();
    }

    destroy() {
        this.fews = null;
        this.bews = null;
        this.store = null;
        this.fm = null;
        this.bm = null;
    }

    replaceFrontendWebSocket(fews) {
        this.stopFewsListeners();
        this.fews.close();
        this.fews = fews;
        this.initFewsListeners();
    }

    replaceBackendWebSoceket(bews) {
        this.stopBewsListeners();
        this.bews.close();
        this.bews = bews;
        this.initBewsListeners();
    }

    onFewsMessage = (msg) => {
        console.log(this.fews.id, 'message', msg);
        const req = JSON.parse(msg);
        this.fm.deliver(req, this.store);
    }

    onFewsClose = (code, message) => {
        console.info(this.fews.id, 'close',  code, message);
        this.emit('websocket-close', 'frontend');
    }

    onFewsError = (error) => {
        console.error(this.fews.id, 'error', error);
    }

    onBewsMessage = (msg) => {
        console.log(this.bews.id, 'message', msg);
        this.bm.deliver(msg, this.store);
    }

    onBewsClose = (code, message) => {
        console.info(this.bews.id, 'close',  code, message);
        this.emit('websocket-close', 'backend');
    }

    onBewsError = (error) => {
        console.error(this.bews.id, 'error', error);
    }

    onFmSendFrontend = async (msg) => {
        const data = JSON.stringify(msg);
        this.fews.send(data);
    }

    onFmSendBackend = async (msg) => {
        this.bews.send(msg);
    }

    onBmSendFrontend = async (msg) => {
        const data = JSON.stringify(msg);
        this.fews.send(data);
    }

    onBmSendBackend = async (msg) => {
        this.bews.send(msg);
    }

}

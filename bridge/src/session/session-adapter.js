export class SessionAdapter {

    constructor(session, store) {
        this.id = session.id;
        this.params = session.params;
        this.fep = session.frontend.params;
        this.bep = session.backend.params;
        this.fews = session.frontend.websocket;
        this.bews = session.backend.websocket;
        this.store = store;
        this.initListeners();
        this.emit('ready');
    }

    initListeners() {
        this.fews.on('message', this.onFewsMessage);
        this.fews.on('close', this.onFewsClose);
        this.fews.on('error', this.onFewsError);
        this.bews.on('message', this.onBewsMessage);
        this.bews.on('close', this.onBewsClose);
        this.bews.on('error', this.onBewsError);
    }

    stopListeners() {
        this.fews.removeListener('message', this.onFewsMessage);
        this.fews.removeListener('close', this.onFewsClose);
        this.bews.removeListener('error', this.onFewsError);
        this.bews.removeListener('message', this.onBewsMessage);
        this.bews.removeListener('close', this.onBewsClose);
        this.bews.removeListener('error', this.onBewsError);
    }

    halt(reason) {
        this.stopListeners();
        this.emit('halt', reason);
    }

    onFewsMessage = (data) => {
        console.log(this.fews.id, 'message', data);
    }

    onFewsClose = (code, message) => {
        console.log(this.fews.id, 'close',  code, message);
        this.halt('frontend-close');
    }

    onFewsError = (error) => {
        console.log(this.fews.id, 'error', error);
    }

    onBewsMessage = (data) => {
        console.log(this.bews.id, 'message', data);
    }

    onBewsClose = (code, message) => {
        console.log(this.bews.id, 'close',  code, message);
        this.halt('backend-close');
    }

    onBewsError = (error) => {
        console.log(this.bews.id, 'error', error);
    }

}

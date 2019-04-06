export class Http {
    constructor(url) {
        this.url = url;
    }

    saveDialogueList(item) {
        return fetch(`${this.url}/dialoguelist`, {
            body: JSON.stringify(item),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    saveMessageList(item) {
        return fetch(`${this.url}/messagelist`, {
            body: JSON.stringify(item),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    getDialogue() {
        return fetch(`${this.url}/dialoguelist`);
    }

    getMessageList() {
        return fetch(`${this.url}/messagelist`);
    }

}
export class Dialogue {                         //чат
    constructor(name, image, id) {
        this.name = name;
        this.image = image;
        this.id = id;
    }
}

export class Message {                          //сообщение
    constructor(name, text, id, time) {
        this.name = name;
        this.text = text;
        this.id = id;
        this.time = time;
    }
}

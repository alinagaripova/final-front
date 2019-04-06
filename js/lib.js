export class Dialogue {                         //чат
    constructor(name, image, id) {
        this.name = name;
        this.image = image;
        this.id = id;
    }
}

export class Message {                          //сообщение
    constructor(name, text, id) {
        this.name = name;    //моё
        this.text = text;
        this.id = id;
    }
}

export class Dialogue {                         //чат
    constructor(name, image, id, userId) {
        this.name = name;
        this.image = image;
        this.id = id;               //id собеседника
        this.userId = userId;       //id пользователя

    }
}

export class Message {                          //сообщение
    constructor(text, id, userId, time) {
        this.text = text;
        this.id = id;               //id собеседника
        this.userId = userId;       //id пользователя
        this.time = time;
    }
}

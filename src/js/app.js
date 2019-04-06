import {Dialogue, Message} from "./lib.js";
import {checkDialogues} from "./valid.js";
import {Http} from './http.js';

// const http = new Http('http://localhost:2525');
const http = new Http('https://final-project-aln.herokuapp.com');
const startChatEl = document.querySelector('.start-chat');
const dialogueListEl = document.querySelector('.dialogues-list');
const companionEl = document.querySelectorAll('.companion');
const chatEl = document.querySelector('.chat');

const companions = Array.from(companionEl);
let dialogueList = [];
let messageList =[];

async function loadData() {
    try {
        const response = await http.getDialogue();
        dialogueList = await response.json();
        if (dialogueList == null) {
            dialogueList = []
        }
        rebuildDialogueList(dialogueListEl, dialogueList);
    } catch (e) {
        // e -> ошибка
        console.log(e);
    } finally {
        console.log('we finished');
    }

}

let id = 0;
for (const companion of companions) {
    id++;
    companion.setAttribute('data-id', id);

    const name = companion.textContent;
    const image = companion.children[0].attributes[0].textContent;    //адрес картинки
    const dialogue = new Dialogue(name, image, id);

    companion.addEventListener('click', async (evt) => {      //при клике создается новый чат
        let id = companion.attributes[1].value;
        console.log(id);

        if (checkDialogues(id, dialogueList) > 0) {                 //проверяет существует ли такой чат
            console.log('Такой чат уже существует');
        } else {
            await http.saveDialogueList(dialogue);  //добавляет чат в список чатов
        }
        await loadData();
        createChat(dialogueList, chatEl, image, name, id);
    })
}

function rebuildDialogueList(dialogueListEl, dialogueList1) {                //создание списка диалогов
    dialogueListEl.innerHTML = ' ';
    for (const item of dialogueList1) {
        const liEl = document.createElement('li');
        liEl.setAttribute('data-class', 'dialogues-element');
        liEl.setAttribute('data-id', item.id);
        liEl.innerHTML = `
          <img data-id="img" alt="photo" src="${item.image}"><span data-id="name">${item.name}</span>
        `;

        liEl.addEventListener('click', () => {
            createChat(dialogueList, chatEl, item.image, item.name, item.id);       //создание окна чата
        });
        dialogueListEl.appendChild(liEl);
    }
}

function createChat(dialogueList1, chatEl, itemImage, itemName, itemId) {        //создание окна чата
    chatEl.innerHTML = '';
    const headerEl = document.createElement('header');          //создание header
    headerEl.setAttribute('data-class', 'chat-title');
    headerEl.innerHTML = `
       <img data-id="img" alt="photo" src="${itemImage}" id="${itemId}"><span>${itemName}</span>
    `;

    const centerEl = document.createElement('div');
    centerEl.className = 'center';

    const footerEl = document.createElement('footer');          //создание footer
    footerEl.setAttribute('data-class', 'chat-send');
    footerEl.innerHTML = `
        <form data-id="form-send" class="form-inline">                        
            <input data-id="message-text"  class="form-control" type="text" placeholder="Введите сообщение" autofocus>
            <button data-id="send" class="btn btn-secondary">Отправить</button>
        </form>
         <form data-id="form-send2" class="form-inline">
            <input data-id="message-text2"  class="form-control" type="text" placeholder="Введите сообщение" autofocus>
            <button data-id="send2" class="btn btn-secondary">Отправить</button>
        </form>
    `;                                                                //первый отправитель(you), второй(собеседник)
    chatEl.appendChild(headerEl);
    chatEl.appendChild(footerEl);
    chatEl.appendChild(centerEl);

    const sendEl = footerEl.querySelector('[data-id=form-send]');
    const messageTextEl = footerEl.querySelector('[data-id=message-text]');

    sendEl.addEventListener('submit', async (evt) => {        //событие на кнопке 'отправить' сообщение
        evt.preventDefault();                                        //первый инпут(you)
        const messageText = messageTextEl.value;
        const message = new Message('Алина', messageText, itemId);

        if (messageText !== '') {
            await http.saveMessageList(message);
            createChat(dialogueList1, chatEl, itemImage, itemName, itemId);
        }
        messageTextEl.value = '';
    });

    const send2El = footerEl.querySelector('[data-id=form-send2]');
    const messageText2El = footerEl.querySelector('[data-id=message-text2]');

    send2El.addEventListener('submit', async (evt) => {        //второй инпут(собеседник)
        evt.preventDefault();
        const messageText2 = messageText2El.value;
        const message2 = new Message(itemName, messageText2, itemId);

        if (messageText2 !== '') {
            // messageList.add(message2);
            await http.saveMessageList(message2);
            createChat(dialogueList1, chatEl, itemImage, itemName, itemId);
        }
        messageText2El.value = '';
    });
    rebuildMessageList(centerEl, messageList, itemId, itemName);

}

async function rebuildMessageList(centerEl, messageList, itemId, itemName) {//создание листа сообщений
    const response2 = await http.getMessageList();
    console.log(response2);
    messageList = await response2.json();
    console.log(messageList);

    if (messageList == null) {
        messageList = [];
    }
    for (const item of messageList) {
        if (item.id == itemId) {
            if (item.name == itemName) {
                const divEl = document.createElement('div');
                divEl.className = 'companion-block';
                divEl.innerHTML = `
                <div class="companion-text">
                    <span>${item.name}: ${item.text}</span>
                </div>
            `;
                centerEl.appendChild(divEl);
            } else {
                const divEl = document.createElement('div');
                divEl.className = 'you-block';
                divEl.innerHTML = `
                <div class="you-text">
                    <span>You: ${item.text}</span>
                </div>
            `;
                centerEl.appendChild(divEl);
            }
        }
    }
}

loadData();



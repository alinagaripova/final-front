import {Dialogue, Message} from "./lib.js";
import {checkDialogues} from "./valid.js";
import {Http} from './http.js';

// const http = new Http('http://localhost:2525');
const http = new Http('https://final-project-aln.herokuapp.com');
const usersMenuEl = document.querySelector('.users-menu');
const usersEl = document.querySelector('.users');
const companionsListEl = document.querySelector('.companions-list');
const dialogueListEl = document.querySelector('.dialogues-list');
const chatEl = document.querySelector('.chat');

let dialogueList = [];
let messageList = [];
let userList = [];
// let messageListOld =[];

var strGET = window.location.search.replace('?', '').split('=')[1];  //получаем id пользователя из get параметра в адресной строке
loadUsers(strGET);

async function loadUsers(strGET) {
    try {
        const response = await http.getUsers();
        userList = await response.json();
        if (strGET == undefined) {             //если параметр не определен создаем список пользователй
            // console.log('не определен');
            buildUserList(usersMenuEl, userList);
        } else {
            // console.log('определен');         // если параметр определен сразу строи чат для пользователя
            const item = userList.find(x => x.id == strGET);
            // console.log(item);
            const spanEl = document.createElement('span');
            spanEl.className = 'dropdown-item user';
            spanEl.id = item.id;
            spanEl.innerHTML = `
            <img alt="img" src="${item.image}">${item.name}
            `;
            usersMenuEl.appendChild(spanEl);
            loadData();
            rebuildUsersAndCompanions(usersEl, spanEl, userList);
        }


    } catch (e) {
        // e -> ошибка
        console.log(e);
    } finally {
        console.log('Список диалогов загружен');
    }
}

function buildUserList(usersMenuEl, userList) {                                  //создание списка пользователей
    for (const item of userList) {
        const spanEl = document.createElement('span');
        spanEl.className = 'dropdown-item user';
        spanEl.id = item.id;
        spanEl.innerHTML = `
        <img alt="img" src="${item.image}">${item.name}
        `;
        usersMenuEl.appendChild(spanEl);

        spanEl.addEventListener('click', (evt) => {                 //событие выбор пользователя из списка
            // evt.preventDefault();
            window.location.href = "./index.html?id=" + evt.currentTarget.id;
        });
    }
}

function rebuildUsersAndCompanions(usersEl, evtCurrentTarget, userList) {
    usersEl.innerHTML = '';
    evtCurrentTarget.className = 'dropdown-item user selected-user';
    usersEl.appendChild(evtCurrentTarget);                                      //прописывается выбранный юзер

    const exitEl =document.createElement('div');                       //создание кнопки "выход"
    exitEl.className = 'exit';
    exitEl.innerHTML = `
        <a class="fas fa-sign-out-alt" href="./index.html"></a>
    `;
    usersEl.appendChild(exitEl);

    const buttonEl = document.createElement('button');                 //создание кнопки "начать чат с'
    buttonEl.id = 'dropdownMenuButton';
    buttonEl.className = 'btn btn-secondary start-chat';
    buttonEl.setAttribute('type', 'button');
    buttonEl.setAttribute('data-toggle', 'dropdown');
    buttonEl.setAttribute('aria-haspopup', 'true');
    buttonEl.setAttribute('aria-labelledby', 'dropdownMenuButton');
    buttonEl.innerHTML = `<span>Начать чат с :</span><i class="fas fa-caret-square-down"></i>`;
    const divEl = document.createElement('div');
    divEl.className = 'dropdown-menu companions-list';
    divEl.setAttribute('aria-labelledby', 'dropdownMenuButton');
    usersEl.appendChild(buttonEl);
    usersEl.appendChild(divEl);

    const companionsListEl = document.querySelector('.companions-list');
    for (const item of userList) {                                                //создается список выбора собеседника
        if (evtCurrentTarget.id != item.id) {
            const spanEl = document.createElement('span');
            spanEl.className = 'dropdown-item companion';
            spanEl.id = item.id;
            spanEl.innerHTML = `
        <img alt="img" src="${item.image}">${item.name}
        `;
            companionsListEl.appendChild(spanEl);
            const dialogue = new Dialogue(item.name, item.image, item.id, evtCurrentTarget.id);
            const userName = evtCurrentTarget.textContent.trim();
            const userImg = 'img/' + evtCurrentTarget.firstElementChild.src.split('/').pop();
            const dialogue2 = new Dialogue(userName, userImg, evtCurrentTarget.id, item.id);
            spanEl.addEventListener('click', async (evt) => {
                if (checkDialogues(item.id, evtCurrentTarget.id, dialogueList) > 0) {       //проверяет существует ли такой чат
                    console.log('Такой чат уже существует');
                } else {
                    await http.saveDialogueList(dialogue);                                 //добавляет чат в список чатов
                    await http.saveDialogueList(dialogue2);                                //добавляет чат в список чатов
                }
                await loadData();
                createChat(dialogueList, chatEl, item.image, item.name, item.id, evtCurrentTarget.id);
            });
        }
    }
}

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
        console.log('Список диалогов загружен');
    }
}

function rebuildDialogueList(dialogueListEl, dialogueList1) {                               //создание списка диалогов
    const userId = document.querySelector('.user').id;
    dialogueListEl.innerHTML = ' ';
    for (const item of dialogueList1) {
        if (userId == item.userId) {
            const liEl = document.createElement('li');
            liEl.setAttribute('data-class', 'dialogues-element');
            liEl.setAttribute('data-id', item.id);
            liEl.innerHTML = `
          <img data-id="img" alt="photo" src="${item.image}"><span data-id="name">${item.name}</span>
        `;

            liEl.addEventListener('click', () => {
                createChat(dialogueList, chatEl, item.image, item.name, item.id, userId);       //создание окна чата
            });
            dialogueListEl.appendChild(liEl);
        }
    }
}

function createChat(dialogueList1, chatEl, itemImage, itemName, itemId, userId) {           //создание окна чата
    chatEl.innerHTML = '';
    const headerEl = document.createElement('header');                          //создание header
    headerEl.setAttribute('data-class', 'chat-title');
    headerEl.innerHTML = `
       <img data-id="img" alt="photo" src="${itemImage}" id="${itemId}"><span>${itemName}</span> 
    `;

    const centerEl = document.createElement('div');
    centerEl.className = 'center';

    const footerEl = document.createElement('footer');                  //создание footer
    footerEl.setAttribute('data-class', 'chat-send');
    footerEl.innerHTML = `
        <form data-id="form-send" class="form-inline">                        
            <input data-id="message-text"  class="form-control" type="text" placeholder="Введите сообщение" autofocus>
            <button data-id="send" class="btn btn-secondary">Отправить</button>
        </form>
    `;
    chatEl.appendChild(headerEl);
    chatEl.appendChild(footerEl);
    chatEl.appendChild(centerEl);

    const sendEl = footerEl.querySelector('[data-id=form-send]');
    const messageTextEl = footerEl.querySelector('[data-id=message-text]');

    sendEl.addEventListener('submit', async (evt) => {        //событие на кнопке 'отправить' сообщение
        evt.preventDefault();
        const messageText = messageTextEl.value;
        const date = new Date();
        const time = date.toTimeString().split(':')[0]+":"+date.toTimeString().split(':')[1];
        const message = new Message(messageText, itemId, userId, time);

        if (messageText !== '') {
            await http.saveMessageList(message);
            createChat(dialogueList1, chatEl, itemImage, itemName, itemId, userId);
        }
        messageTextEl.value = '';
    });

    rebuildMessageList(centerEl, messageList, itemId, itemName, userId, messageListOld);
    // setInterval(rebuildMessageList,1000, centerEl, messageList, itemId, itemName, userId);

}

async function rebuildMessageList(centerEl, messageList, itemId, itemName, userId, messageListOld) {//создание листа сообщений
    // centerEl.innerHTML = " ";
    const response = await http.getMessageList();
    messageList = await response.json();

    // console.log("1-ый old " + (messageListOld));
    // messageListOld = messageList;
    // for (const item of messageListOld) {
    //     console.log("2-ой old " + item);
    // }


    if (messageList == null) {
        messageList = [];
    }
    for (const item of messageList) {
        if ((userId == item.userId) && (itemId == item.id)) {
            const divEl = document.createElement('div');
            divEl.className = 'you-block';
            divEl.innerHTML = `
                <div class="you-text">
                    <span>${item.text}</span><span class="time">     ${item.time}</span>
                </div>
            `;
            centerEl.appendChild(divEl);
        }
        if ((itemId == item.userId) && (userId == item.id)) {
            const divEl = document.createElement('div');
            divEl.className = 'companion-block';
            divEl.innerHTML = `
                <div class="companion-text">
                    <span>${item.text}</span><span class="time">     ${item.time}</span>
                </div>
            `;
            centerEl.appendChild(divEl);
        }
    }
    // setTimeout(rebuildMessageList, 1000, centerEl, messageList, itemId, itemName, userId, messageListOld);
}





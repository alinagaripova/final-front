export function checkDialogues(id, userId, dialogueList) {  //проверяет существует ли такой чат
    let count = 0;
    for (const item of dialogueList) {
        if (((id == item.id ) && (userId == item.userId)) || ((userId == item.id ) && (id == item.userId))) {
            count++
        }
    }
    return count;
}
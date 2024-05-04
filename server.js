const socket = io();
let username;
let canSend = 0;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');

function sendMessage(message) {
    let msg = {
        user: username,
        message: message.trim()
    };
    // Append 
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();

    // Send to server 
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
        <p>Sentiment: ${msg.sentiment}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

async function checkUsername() {
    do {
        username = prompt('Please enter your username: ');

        if (username) {
            const url = '/checkUser';
            const data = {
                username: username
            };
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const responseData = await response.json();
                if (!responseData.isUnique) {
                    username = '';
                    alert("This username already exists");
                } else {
                    textarea.addEventListener('keyup', (e) => {
                        if (e.key === 'Enter') {
                            sendMessage(e.target.value);
                        }
                    });

                    // Receive messages 
                    socket.on('message', (msg) => {
                        appendMessage(msg, 'incoming');
                        scrollToBottom();
                    });
                    return;
                }
                console.log(responseData);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    } while (!username || username === '');
}

checkUsername();

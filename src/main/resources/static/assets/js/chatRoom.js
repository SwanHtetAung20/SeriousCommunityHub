let stompClientForChatRoom = null;
let loginUserForChatRoom = null;
let selectedRoomId = null;
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const connectingElement = document.querySelector('.connecting');
    const chatAreaForChatRoom = document.querySelector('#chat-messages');
    chatAreaForChatRoom.innerHTML =`<div id="defaultMessage-for-chatRoom" style="margin-top: 50px">
                           <img src="/static/assets/img/chatroom-bg.gif" alt="login image" class="login__img" 
                           style="    width: 810px;height: 680px;margin-top: -48px;">
                     </div>`;
    const mentionSuggestions = document.getElementById('mentionSuggestions');

    loginUserForChatRoom = localStorage.getItem('staff_id');
    const connectWebSocket = () => {
        const socket = new SockJS('/ws');
        stompClientForChatRoom = Stomp.over(socket);
        stompClientForChatRoom.connect({}, onConnected, onError);
    };

    document.getElementById('file-input-chatRoom').addEventListener('change', async (event) => {
        if (event.target.files.length > 0) {
            console.log('Oh shit  ya nay p')
            await sendMessageWithAttachment();
        }
    });

    const mentionUser = async (id) => {
        console.log('mentionUser called');
        const messageInput = document.querySelector('#message');
        console.log('messageInput:', messageInput);
        const emojiInput = document.querySelector('.emojionearea-editor');

        const handleInput = async (inputValue) => {
            const mentionIndex = inputValue.lastIndexOf('@');
            console.log('input event triggered');
            const memberList = await getAllChatRoomMember(id);
            console.log('User List', memberList);

            if (mentionIndex !== -1) {
                console.log('Mention trigger found');
                const mentionQuery = inputValue.substring(mentionIndex + 1);
                const matchedUsers = memberList.filter(user => user.name.toLowerCase().includes(mentionQuery.toLowerCase()));

                if (matchedUsers.length > 0) {
                    console.log('Matched users found');
                    const mentionSuggestions = document.getElementById('mentionSuggestions');
                    mentionSuggestions.innerHTML = '';

                    matchedUsers.forEach(user => {
                        const suggestionElement = document.createElement('div');
                        suggestionElement.textContent = `${user.name}`;
                        suggestionElement.classList.add('mentionSuggestion');
                        suggestionElement.addEventListener('click',  () =>{
                            const mentionStart = mentionIndex;
                            const mentionEnd = mentionIndex + mentionQuery.length;
                            const mentionText = `@${user.name} `;
                            let newText = inputValue.substring(0, mentionStart) + mentionText + inputValue.substring(mentionEnd);
                            if (mentionEnd === inputValue.length - 1) {
                                newText = inputValue.substring(0, inputValue.length - 1) + mentionText;
                            }
                            messageInput.value = newText;
                            emojiInput.textContent = newText;
                            mentionSuggestions.innerHTML = '';
                        });
                        mentionSuggestions.appendChild(suggestionElement);
                    });
                } else {
                    console.log('No matched users found');
                    document.getElementById('mentionSuggestions').innerHTML = '';
                }
            } else {
                console.log('No mention trigger found');
                document.getElementById('mentionSuggestions').innerHTML = '';
            }
        };

        messageInput.addEventListener('input', async (event) => {
            const inputValue = event.target.value;
            await handleInput(inputValue);
        });

        emojiInput.addEventListener('input', async (event) => {
            const inputValue = event.target.textContent;
            await handleInput(inputValue);
        });
    };


    findAndDisplayConnectedUsers().then();
    const onConnected = () => {
        stompClientForChatRoom.subscribe(`/user/chatRoom/queue/messages`, onMessageReceived);
        stompClientForChatRoom.subscribe(`/user/remove-divWrapper/queue/messages`, onMessageReceivedForRemoveDivWrapper);
    };

    const roomId = localStorage.getItem('chatRoomIdForGroup');
    if(roomId){
        findAndDisplayConnectedUsers().then(() => {
            const roomElement = document.getElementById(roomId);
            if (roomElement) {
                roomElement.click();
                localStorage.removeItem('chatRoomIdForGroup');
            }
        });
    } else {
        findAndDisplayConnectedUsers().then();
    }

    //for voice start

    let mediaRecorder;
    let recordedChunks = [];
    let mediaStream;

    document.getElementById('startRecordButton').addEventListener('click', startRecording);
    document.getElementById('stopRecordButton').addEventListener('click', stopRecording);
    document.getElementById('sendVoiceButton').addEventListener('click', sendVoiceMessage);
    document.getElementById('dismissVoiceButton').addEventListener('click', cancelRecording);

    async function startRecording() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(mediaStream);
            recordedChunks = [];
            mediaRecorder.ondataavailable = function(e) {
                recordedChunks.push(e.data);
            };
            mediaRecorder.start();
            document.getElementById('startRecordButton').style.display = 'none';
            document.getElementById('stopRecordButton').style.display = 'inline-block';
        } catch (err) {
            console.log('Error recording audio: ' + err);
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder.onstop = function() {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                document.getElementById('audioPreview').src = audioUrl;
                document.getElementById('sendVoiceButton').style.display = 'inline-block';
                document.getElementById('audioPreview').style.display = 'inline-block';
                document.getElementById('dismissVoiceButton').style.display = 'inline-block';
                stopMediaStream();
            };
        }
        document.getElementById('startRecordButton').style.display = 'none';
        document.getElementById('stopRecordButton').style.display = 'none';
    }

    function cancelRecording() {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder.onstop = function() {
                recordedChunks = [];
                resetRecordingUI();
                stopMediaStream();
            };
        } else {
            resetRecordingUI();
        }
    }

    function resetRecordingUI() {
        recordedChunks = [];
        document.getElementById('audioPreview').src = '';
        document.getElementById('audioPreview').style.display = 'none';
        document.getElementById('sendVoiceButton').style.display = 'none';
        document.getElementById('startRecordButton').style.display = 'inline-block';
        document.getElementById('stopRecordButton').style.display = 'none';
        document.getElementById('dismissVoiceButton').style.display = 'none';
        stopMediaStream();
    }

    function stopMediaStream() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }



    //for voice end

    async function findAndDisplayConnectedUsers() {
        const response = await fetch('/user/room-list');
        let connectedRooms = await response.json();
        const connectedUsersList = document.getElementById('connectedUsers');
        connectedUsersList.innerHTML = '';
        connectedRooms.forEach(room => {
            appendUserElement(room, connectedUsersList);
            if (connectedRooms.indexOf(room) < connectedRooms.length - 1) {
                const separator = document.createElement('li');
                separator.classList.add('separator');
                connectedUsersList.appendChild(separator);
            }
        });
    }

    async function appendUserElement(room, connectedUsersList) {
        const listItem = document.createElement('li');
        listItem.classList.add('user-item');
        listItem.id = room.id;
        listItem.setAttribute('name', room.name);
        let photo = '';
        if (room.photo) {
            console.log('phototEroor', room.photo);
            photo = `${room.photo}`;
        } else {
            photo = '/static/assets/img/card.jpg';
        }
        const roomImage = document.createElement('img');
        roomImage.src = `${photo}`;
        roomImage.alt = "Group photo";

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = room.name;

        const receivedMsgs = document.createElement('span');
        receivedMsgs.textContent = '0';
        receivedMsgs.classList.add('nbr-msg', 'hidden');
        listItem.appendChild(roomImage);
        listItem.appendChild(usernameSpan);
        listItem.appendChild(receivedMsgs);
        listItem.addEventListener('click', userItemClick);
        connectedUsersList.appendChild(listItem);
    }

    let previousRoomId = null;

    async function userItemClick(event) {
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });
        const clickedUser = event.currentTarget;
        clickedUser.classList.add('active');
        selectedRoomId = clickedUser.getAttribute('id');
        console.log("wanna see", selectedRoomId);
        chatAreaForChatRoom.innerHTML = "";
        fetchAndDisplayUserChat().then();
        const groupPhotoId = document.getElementById('group-photo-id');
        const gpPhoto = document.createElement('img');
        const roomNameElement = document.getElementById('room-name');
        const participantsElement = document.createElement('span');
        groupPhotoId.innerHTML = '';
        const isSelected = document.getElementById('IsSelected');
        const vdShow = document.getElementById('vd-icon');
        const barAboveMessages = document.getElementById('bar-above-messages');
        if (!selectedRoomId) {
            barAboveMessages.classList.add('hidden');
            isSelected.style.display = 'none';
            vdShow.style.display = 'none';
            messageForm.classList.add('hidden');
        } else {
            console.log('mention user status active')
            await mentionUser(selectedRoomId);
            barAboveMessages.classList.remove('hidden');
            barAboveMessages.style.padding = '20px';
            vdShow.style.display = 'block';
            isSelected.style.display = 'block';
            const inputLine = document.querySelector('.emojionearea.emojionearea-inline ');
            inputLine.style.height = '50px';
            inputLine.style.borderRadius = '20px';
            const roomPhoto = await fetchRoomPhoto(selectedRoomId);
            const getSize = await fetchRoomSize(selectedRoomId);
            const photo = roomPhoto.photo || '/static/assets/img/default-logo.png';
            const photoContainer = document.createElement('div');
            photoContainer.classList.add('room-info-container');

            gpPhoto.src = `${photo}`;
            gpPhoto.classList.add('room-photo');
            gpPhoto.alt = 'Group photo';
            photoContainer.appendChild(gpPhoto);

            roomNameElement.innerHTML = `${roomPhoto.name}`;
            roomNameElement.classList.add('room-name');
            participantsElement.textContent = `${getSize}  participants `;
            participantsElement.classList.add('room-participants');
            roomNameElement.appendChild(participantsElement);
            photoContainer.appendChild(roomNameElement);
            groupPhotoId.appendChild(photoContainer);
            messageForm.classList.remove('hidden');
        }
        if (previousRoomId !== null) {
            const previousRoom = document.getElementById(previousRoomId);
            previousRoom.addEventListener('click', userItemClick);
        }
        const nbrMsg = clickedUser.querySelector('.nbr-msg');
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';
        previousRoomId = selectedRoomId;
        clickedUser.removeEventListener('click', userItemClick);
    }

    const searchPostWithUrl =async (url) => {
        const fetchPost = await fetch(`/post/get-postWithUrl?url=${encodeURIComponent(url)}`);
        if(fetchPost.ok){
            const res = await fetchPost.json();
            console.log("PostID",res.id);
            localStorage.setItem('trendPostIdForSinglePost',res.id);
            window.location.href = `/user-details-post`
        }else{
            const res = await fetchPost.text();
            console.log("A sin pyae")
            window.location.href = `/access-denied`
        }
    }

    const displayMessageForChatRoom = async (id, senderId, content, photo, voiceData, date) => {
        const divWrapper = document.createElement('div');
        divWrapper.classList.add('divWrapper');
        divWrapper.id = `remove-divWrapper-${id}`;
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        messageContainer.id = id;

        const userImage = document.createElement('img');
        const image = photo || '/static/assets/img/default-logo.png';
        userImage.src = `${image}`;
        userImage.alt = 'User Photo';
        userImage.classList.add('user-photo');

        let createdTime = await formattedDate(new Date(date));
        messageContainer.setAttribute('data-toggle', 'tooltip');
        messageContainer.setAttribute('title', `${createdTime}`);

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa-solid', 'fa-trash', 'delete-icon');
        deleteIcon.style.display = 'none';

        if (senderId === loginUserForChatRoom) {
            divWrapper.style.alignSelf = 'flex-end';
            divWrapper.style.display = 'flex';
            messageContainer.classList.add('sender');
        } else {
            messageContainer.classList.add('receiver');
            divWrapper.style.alignSelf = 'flex-start';
            messageContainer.style.marginLeft = '45px';
            messageContainer.style.marginTop = '-35px';
            messageContainer.style.borderBottomRightRadius = '10px';
        }

        const messageContentContainer = document.createElement('div');
        messageContentContainer.classList.add('message-content-container');
        const urlPattern = new RegExp('^(https?:\\/\\/)?' +
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
            '((\\d{1,3}\\.){3}\\d{1,3}))' +
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
            '(\\?[;&a-z\\d%_.~+=-]*)?' +
            '(\\#[-a-z\\d_]*)?$', 'i');

        const imageExtensions = /\.(jpeg|jpg|gif|png|bmp|webp)$/i;

        if (urlPattern.test(content) && imageExtensions.test(content)) {
            const messageImage = document.createElement('img');
            messageImage.src = content;
            messageImage.style.width = '400px';
            messageImage.style.height = '300px';
            messageImage.alt = 'Message Image';
            messageContentContainer.appendChild(messageImage);
        } else if (voiceData) {
            const audioElement = await createAudioElement(voiceData);
            messageContentContainer.appendChild(audioElement);
            messageContainer.style.backgroundColor = 'transparent';
        } else {
            const message = document.createElement('p');
            const messageContentWithLinks = content.replace(/(https?:\/\/[^\s]+)/g, (url) => {
                if (url.includes('communityHub.com/posts')) {
                    messageContainer.style.width = '400px';
                    messageContainer.style.backgroundColor = 'ghostwhite';
                    return `<a href="${url}" class="post-link">${url}</a>`;
                }
                return `<a href="${url}" target="_blank">${url}</a>`;
            });
            message.innerHTML = messageContentWithLinks;
            messageContentContainer.appendChild(message);
        }

        const spanEl = document.createElement('span');
         spanEl.id = `remove-span-for-${id}`;
        if (loginUserForChatRoom !== senderId) {
            spanEl.appendChild(userImage);
        }
        if (loginUserForChatRoom === senderId) {
            const span = document.createElement('span');
            span.appendChild(deleteIcon);
            divWrapper.appendChild(span);
        }
        messageContainer.appendChild(messageContentContainer);
        divWrapper.appendChild(messageContainer);
        chatAreaForChatRoom.appendChild(spanEl);
        chatAreaForChatRoom.appendChild(divWrapper);
        chatAreaForChatRoom.scrollTop = chatAreaForChatRoom.scrollHeight;

        divWrapper.addEventListener('mouseenter', () => {
            deleteIcon.style.display = 'inline';
        });

        divWrapper.addEventListener('mouseleave', () => {
            deleteIcon.style.display = 'none';
        });

        deleteIcon.addEventListener('click', async () => {
            chatAreaForChatRoom.removeChild(divWrapper);
            const chatId = messageContainer.id;
            await deleteMessage(chatId);
        });

        const postLinks = document.querySelectorAll('.post-link');
        postLinks.forEach(link => {
            link.addEventListener('click', async (event) => {
                event.preventDefault();
                await searchPostWithUrl(link.href);
            });
        });
    };


    const deleteMessage = async (chatId) => {
 stompClientForChatRoom.send("/app/delete-message", {}, JSON.stringify({chatId : chatId}));
    };



    async function createAudioElement(voiceUrl) {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = voiceUrl;
        return audioElement;
    }


    async function fetchAndDisplayUserChat() {
        const userChatResponse = await fetch(`/messages/${selectedRoomId}`);
        const userChat = await userChatResponse.json();
        chatAreaForChatRoom.innerHTML = '';
        for (const chat of userChat) {
            const localDate = new Date(chat.date);
            const formattedTime = localDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            console.log('Data', formattedTime);
            const chatUser = await fetchUserByLogInId(chat.sender);
            await displayMessageForChatRoom(chat.id,chat.sender, chat.content, chatUser.photo,chat.voiceUrl,chat.date);
        }
        chatAreaForChatRoom.scrollTop = chatAreaForChatRoom.scrollHeight;
    }

    function onError() {
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }

    const sendMessageWithAttachment = async () => {
        const fileInput = document.getElementById('file-input-chatRoom');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file!');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', selectedRoomId);
        formData.append('sender', loginUserForChatRoom);
        formData.append('date', new Date());
        let response = await fetch('/send-photo-toChatRoom', {
            method: 'POST',
            body:formData
        });
       if(!response.ok){
           alert('something wrong please try again!');
       }
        const res = await response.json();
          const chatMessage = {
              id: selectedRoomId,
              sender: loginUserForChatRoom,
              content: res.content,
              chatId:res.id,
              date: new Date()
          }
        stompClientForChatRoom.send("/app/chat-withPhoto", {}, JSON.stringify(chatMessage));
        const showedUserPhoto = await fetchUserByLogInId(loginUserForChatRoom);
        const photo = showedUserPhoto.photo || '/static/assets/img/card.jpg';
        // await displayMessageForChatRoom(loginUserForChatRoom,res.content,photo,null,new Date());
    }

    async function sendVoiceMessage() {
        const formData = new FormData();
        formData.append('file', new Blob(recordedChunks, { type: 'audio/webm' }));
        formData.append('id', selectedRoomId);
        formData.append('sender', loginUserForChatRoom);
        formData.append('date', new Date());

        const response = await fetch('/upload-voice-message', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('Voice message sent successfully.');
            const res = await response.json();
            const chatMessage = {
                id: selectedRoomId,
                sender: loginUserForChatRoom,
                voiceUrl: res.voiceUrl,
                chatId:res.id,
                date: new Date()
            }
            stompClientForChatRoom.send("/app/chat-withVoice", {}, JSON.stringify(chatMessage));
            const showedUserPhoto = await fetchUserByLogInId(loginUserForChatRoom);
            const photo = showedUserPhoto.photo || '/static/assets/img/card.jpg';
            // await displayMessageForChatRoom(loginUserForChatRoom,null,photo,res.voiceUrl,new Date());
        } else {
            console.error('Failed to send voice message.');
        }

        resetRecordingUI();
    }

    async function sendMessage(event) {
        event.preventDefault();
        const messageContent = messageInput.value.trim();
        if (messageContent && stompClientForChatRoom) {
            const chatMessage = {
                id: selectedRoomId,
                sender: loginUserForChatRoom,
                content: messageContent,
                date: new Date()
            };
            stompClientForChatRoom.send("/app/chat", {}, JSON.stringify(chatMessage));
            const showedUserPhoto = await fetchUserByLogInId(loginUserForChatRoom);
            const photo = showedUserPhoto.photo || '/static/assets/img/default-logo.png';
            // await displayMessageForChatRoom(loginUserForChatRoom, messageInput.value.trim(), photo,null,Date.now());
            messageInput.value = '';
            document.querySelector('.emojionearea-editor').innerHTML = '';
        }
        chatAreaForChatRoom.scrollTop = chatAreaForChatRoom.scrollHeight;
    }

    async function onMessageReceived(payload) {
        console.log('Message received', payload);
        const message = JSON.parse(payload.body);

        console.log('Selected Room ID:', selectedRoomId);
        console.log('Message ID:', message.id);
        console.log('Login User ID:', loginUserForChatRoom);
        console.log('Type of selectedRoomId:', typeof selectedRoomId);
        console.log('Type of message.id:', typeof message.id);
        console.log('Are they strictly equal?:', selectedRoomId === message.id.toString());

        if (message.id && selectedRoomId === message.id.toString()) {
            console.log('Message is for selected room and not sent by current user.');
            const receivedUser = await fetchUserByLogInId(message.sender);
            console.log('Received user:', receivedUser);
     if(message.content){
         await displayMessageForChatRoom(message.chatId,message.sender, message.content, receivedUser.photo,null,Date.now());
     }else{
         await displayMessageForChatRoom(message.chatId,message.sender, null, receivedUser.photo,message.voiceUrl,Date.now());
     }

            chatAreaForChatRoom.scrollTop = chatAreaForChatRoom.scrollHeight;
        }

        if (message.id && selectedRoomId !== message.id.toString() && message.sender !== loginUserForChatRoom) {
            console.log('Showing notification for a different room.');
            const notifiedUser = document.querySelector(`[id="${message.id}"]`);
            if (notifiedUser) {
                const nbrMsg = notifiedUser.querySelector('.nbr-msg');
                nbrMsg.classList.remove('hidden');
                nbrMsg.textContent = parseInt(nbrMsg.textContent || '0') + 1;
            }
        }
    }

    const onMessageReceivedForRemoveDivWrapper = async (payload) => {
        const message = JSON.parse(payload.body);
        const chatId = message.chatId;
        const divWrapper = document.getElementById(`remove-divWrapper-${chatId}`);
        const span = document.getElementById(`remove-span-for-${chatId}`);
        if(divWrapper && span){
            divWrapper.remove();
            span.remove();
        }
    }

    messageForm.addEventListener('submit', sendMessage, true);
    connectWebSocket();

    const handleMeeting = async () => {
        if (!selectedRoomId) {
            alert('There is something wrong!Please try again');
        }
        const roomId = Math.floor(Math.random() * 10000) + "";
        const videoCallLink = window.location.protocol + '//' + window.location.host + '/static/videoCall.html?roomID=' + roomId;

        window.open(videoCallLink, "_blank");
        const vd_content = `Join here: ${videoCallLink}`;
        if (stompClientForChatRoom && selectedRoomId) {
            const chatMessage = {
                id: selectedRoomId,
                sender: loginUserForChatRoom,
                content: vd_content,
                date: new Date()
            };
            stompClientForChatRoom.send("/app/chat", {}, JSON.stringify(chatMessage));
            const showedUserPhoto = await fetchUserByLogInId(loginUserForChatRoom);
            // await displayMessageForChatRoom(loginUserForChatRoom, vd_content, showedUserPhoto.photo,null,new Date());
        }
    };

    document.getElementById('vd-icon').addEventListener('click', handleMeeting);


    document.getElementById('get-all-member-list').addEventListener('click', async () => {
        if (!selectedRoomId) {
            alert('Please choose the room u want to add member');
            return;
        }
        const memberList = await getAllCommunityMember(selectedRoomId);
        const showUserList = document.getElementById('memberList');
        showUserList.classList.add('container');
        document.getElementById('chat-room-id').value = selectedRoomId;
        showUserList.innerHTML = '';

        const searchBar = document.getElementById('memberSearchForAddChatRoom');
        if (memberList.length > 0) {
            searchBar.parentElement.parentElement.style.display = 'block';
        } else {
            searchBar.parentElement.parentElement.style.display = 'none';
        }

        if (memberList.length === 0) {
            showUserList.innerHTML = 'There is no member to add this chat room';
            return;
        }
        memberList.forEach(user => {
            if (user.staffId === loginUserForChatRoom) {
                return;
            }
            const getData = document.createElement('div');
            getData.classList.add('group');
            // getData.style.border = '1px solid';
            getData.style.borderRadius = '10px';
            getData.style.paddingTop = '20px';
            getData.style.cursor = 'pointer';
            const checkBoxElement = document.createElement('input');
            checkBoxElement.type = 'checkbox';
            checkBoxElement.id = `checkbox-user-${user.id}`;
            checkBoxElement.value = user.id;
            checkBoxElement.name = 'selectedIds';
            const label = document.createElement('label');
            label.classList.add('add-member-chat-room-search');
            label.setAttribute('for', `checkbox-user-${user.id}`);
            label.textContent = user.name;
            const imgDiv = document.createElement('img');
            const photo = user.photo || '/static/assets/img/default-logo.png';
            imgDiv.src = `${photo}`;
            imgDiv.style.width = '50px';
            imgDiv.style.height = '50px';
            imgDiv.style.borderRadius = '50px';
            imgDiv.style.marginLeft = '300px';
            imgDiv.style.marginTop = '-35px';
            getData.appendChild(checkBoxElement);
            getData.appendChild(label);
            getData.appendChild(imgDiv);
            showUserList.appendChild(getData);

            document.getElementById('memberSearchForAddChatRoom').addEventListener('input', function() {
                const searchValue = this.value.toLowerCase();
                const allUsers = document.querySelectorAll('#memberList .group');

                allUsers.forEach(userContainer => {
                    const userNameElement = userContainer.querySelector('.add-member-chat-room-search');
                    if (userNameElement) {
                        const userName = userNameElement.textContent.toLowerCase();
                        if (userName.includes(searchValue)) {
                            userContainer.style.display = 'block';
                        } else {
                            userContainer.style.display = 'none';
                        }
                    }
                });
            });
        });
    });

    document.getElementById('member-add-icon').addEventListener('click', async () => {
        const formData = new FormData(document.getElementById('get-all-user'));
        const validateData = await fetch(`/add-user-chat-room`, {
            method: 'POST',
            body: formData
        });
        if (!validateData.ok) {
            const response = await validateData.json();
            alert(`${response.message}`);
        } else {
            const response1 = await validateData.json();
            $j('#memberAddModal').modal('hide');
            let alertMessage =  `${response1.message}`;
            let alertStyle = `
            background-color: transparent;
            color: green;
            border: 1px solid #cc0000;
             border-radius: 15px;
        `;
            let styledAlert = document.createElement('div');
            styledAlert.style.cssText = `
            ${alertStyle}
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: none;
        `;
            styledAlert.innerHTML = alertMessage;


            document.body.appendChild(styledAlert);


            styledAlert.style.display = 'block';

            setTimeout(function() {
                styledAlert.style.display = 'none';
            }, 3000);
        }
    });


    document.getElementById('kick-room-member').addEventListener('click', async () => {
        if (!selectedRoomId) {
            alert('Please choose the room first!!!');
            return;
        }
        const userList = await getAllChatRoomMember(selectedRoomId);
        const showUserList = document.getElementById('memberListForKick');
        showUserList.classList.add('container');
        showUserList.innerHTML = '';
        document.getElementById('kick-room-id').value = selectedRoomId;

        const searchBar = document.getElementById('memberSearchForKick');
        if (userList.length > 0) {
            searchBar.parentElement.parentElement.style.display = 'block';
        } else {
            searchBar.parentElement.parentElement.style.display = 'none';
        }

        if (userList.length === 0) {
            showUserList.innerHTML = 'There is no member to kick from this chat room';
            return;
        }

        userList.forEach(user => {
            if (user.staffId === loginUserForChatRoom) {
                return;
            }
            const getData = document.createElement('div');
            getData.classList.add('group');
            // getData.style.border = '1px solid';
            getData.style.borderRadius = '10px';
            getData.style.paddingTop = '20px';
            getData.style.cursor = 'pointer';
            const checkBoxElement = document.createElement('input');
            checkBoxElement.type = 'checkbox';
            checkBoxElement.id = `checkbox-user-${user.id}`;
            checkBoxElement.value = user.id;
            checkBoxElement.name = 'selectedIds';
            const label = document.createElement('label');
            label.classList.add('kick-member-list-chatRoom');
            label.setAttribute('for', `checkbox-user-${user.id}`);
            label.textContent = user.name;
            const imgDiv = document.createElement('img');
            const photo = user.photo || '/static/assets/img/default-logo.png';
            imgDiv.src = `${photo}`;
            imgDiv.style.width = '50px';
            imgDiv.style.height = '50px';
            imgDiv.style.borderRadius = '50px';
            imgDiv.style.marginLeft = '300px';
            imgDiv.style.marginTop = '-35px';
            getData.appendChild(checkBoxElement);
            getData.appendChild(label);
            getData.appendChild(imgDiv);
            showUserList.appendChild(getData);

            document.getElementById('memberSearchForKick').addEventListener('input', function() {
                const searchValue = this.value.toLowerCase();
                const allUsers = document.querySelectorAll('#memberListForKick .group');

                allUsers.forEach(userContainer => {
                    const userNameElement = userContainer.querySelector('.kick-member-list-chatRoom');
                    if (userNameElement) {
                        const userName = userNameElement.textContent.toLowerCase();
                        if (userName.includes(searchValue)) {
                            userContainer.style.display = 'block';
                        } else {
                            userContainer.style.display = 'none';
                        }
                    }
                });
            });

        });
    });

    document.getElementById('member-kick-icon').addEventListener('click', async () => {
        const formData = new FormData(document.getElementById('kick-room-user'));
        const validateData = await fetch(`/kick-user-chat-room`, {
            method: 'POST',
            body: formData
        });
        if (!validateData.ok) {
            const response = await validateData.json();
            alert(`${response.message}`);
        }
        const response1 = await validateData.json();
        $j('#memberKickModal').modal('hide');
        let alertMessage =  `${response1.message}`;
        let alertStyle = `
            background-color: transparent;
            color: green;
            border: 1px solid #cc0000;
             border-radius: 15px;
        `;
        let styledAlert = document.createElement('div');
        styledAlert.style.cssText = `
            ${alertStyle}
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: none;
        `;
        styledAlert.innerHTML = alertMessage;


        document.body.appendChild(styledAlert);


        styledAlert.style.display = 'block';

        setTimeout(function() {
            styledAlert.style.display = 'none';
        }, 3000);
    });
});

const getAllChatRoomMember = async (id) => {
    const getRoomData = await fetch(`/user/chat-room-memberList/${id}`);
    const response = await getRoomData.json();
    return response;
}


const getAllCommunityMember = async (id) => {
    const getData = await fetch(`/user/member-list-chatRoom/${id}`);
    const response = await getData.json();
    return response;
};

const fetchRoomSize = async (id) => {
    const getSize = await fetch(`/user/room-member-size/${id}`);
    const getDataSize = await getSize.json();
    return getDataSize;
};

const fetchRoomPhoto = async (id) => {
    const photoFetch = await fetch(`/user/room-photo/${id}`);
    const data = await photoFetch.json();
    return data;
};


const fetchUserByLogInId = async (id) => {
    const fetchUserData = await fetch(`/get-userData/${id}`);
    if (!fetchUserData.ok) {
        alert('Invalid user');
    }
    const userData = await fetchUserData.json();
    return userData;
};

 const formattedDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `just now`;
    } else if (minutes < 60) {
        return `${minutes} minutes${minutes > 1? '' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hours${hours > 1? '' : ''} ago`;
    } else {
        return `${days} days${days > 1? '' : ''} ago`;
    }
}

const chooseMalFile = () => {
     document.getElementById('file-input-chatRoom').click();
}


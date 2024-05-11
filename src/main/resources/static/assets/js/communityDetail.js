 window.onload = async function(){

 }
 const displayNoPostMessage = () => {
    let footerDiv = document.querySelector('.copyright');
    footerDiv.innerHTML = '';
    const divEl = document.createElement('div');
        divEl.style.fontSize = '20px';
        divEl.innerHTML = 'No posts available';
        footerDiv.appendChild(divEl);

}

 
 

window.onload =  getPosts
window.onload = startUp

async function startUp(){
    let communityId = localStorage.getItem('communityIdForDetailPage')
    let community = await fetch(`/api/community/getCommunity/${communityId}`)
    let data = await community.json()
    console.log(data)
    document.getElementById('communityImage').src = data.image
    document.getElementById('communityName').textContent = data.name
    document.getElementById('communityMembers').textContent = 10
}

let currentPageForPost = '0';
let isFetchingForPost = false;
let hasMoreForPost = true;

let currentPageForEvent = '0'
let isFetchingForEvent = false
let hasMoreForEvent = true

let currentPageForPoll = '0'
let isFetchingForPoll = false;
let hasMoreForPoll = true;

let scrollPost = true
let scrollEvent = false
let scrollPoll = false

let postTabIndex = document.getElementById('newsfeed-tab').addEventListener('click',function(){
    scrollPost = true
    scrollEvent = false
    scrollPoll = false
    document.getElementById('newsfeed').innerHTML = ''
})

let eventTabIndex = document.getElementById('events-tab').addEventListener('click',function(){
    scrollPost = false
    scrollEvent = true
    scrollPoll = false 
    document.getElementById('events').innerHTML = ''
})

let pollTabIndex = document.getElementById('polls-tab').addEventListener('click',function(){
    scrollPost = false
    scrollEvent = false
    scrollPoll = true 
    document.getElementById('polls').innerHTML = '' 
})

window.addEventListener('scroll', async () => {
    if(isFetchingForPost || !hasMoreForPost){
        return;
    }

    if(isFetchingForEvent || !hasMoreForEvent){
        return;
    }

    if(isFetchingForPoll || !hasMoreForPoll){
        return;
    }

    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight && scrollPost === true){
        currentPageForPost++;
         await getPosts();
    }
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight && scrollEvent === true){
        currentPageForEvent++;
         await getEvents();
    }
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight && scrollPoll === true){
        currentPageForPoll++;
         await getPolls();
    }
});



 

document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('searchInput');
})
function goToCreatePost() {
    window.location.href = '/user/goToCreatePost'
}

const fetchCommentSizes = async (id) => {
    const commentSize = await fetch(`/comment-size/${id}`);
    const commentCount = await commentSize.json();
    return commentCount;
};

const fetchCommetedUser = async (id) => {
    const commentUser = await fetch(`/user/comment-user-data/${id}`);
    if (!commentUser.ok) {
        alert('something wrong');
    }
    const commentUserData = await commentUser.json();
    return commentUserData;
}

const fetchSizes = async (id) => {
    const reactSize = await fetch(`/like-size/${id}`);
    const reactCount = await reactSize.json();
    return reactCount;
};

const fetchReactType = async (id) => {
    const reactType = await fetch(`/like-type/${id}`);
    const reactTypeData = await reactType.json();
    return reactTypeData;
};

const fetchReactTypeForNotification = async (id) => {
    const reactType = await fetch(`/user/like-noti-type/${id}`);
    const reactDataType = await reactType.json();
    return reactDataType;
}

const removeReaction = async (id) => {
    const cancelType = await fetch(`/remove-like-type/${id}`);
    if (!cancelType.ok) {
        alert('something wrong');
    }
    console.log('hehhe')
};

const fileInput = document.getElementById('file');
const type = document.getElementById('')
let newsfeed = document.getElementById('newsfeed')
let cal = document.getElementById('cal')
let pol = document.getElementById('pol')
let cat = document.getElementById('catBox')
let mark = document.getElementById('markBox')
let eventDiv = document.getElementById('events')
const mentionSuggestions = document.getElementById('mentionSuggestions');

const mentionCommunityMember= () => {
     const messageInput = document.getElementById('content');
    messageInput.addEventListener('input',  async (event) => {
        const inputValue = event.target.value;
        const mentionIndex = inputValue.lastIndexOf('@');
        const users = await getAllMember();
        if (mentionIndex !== -1) {
            const mentionQuery = inputValue.substring(mentionIndex + 1);
            const matchedUsers = users.filter(user => user.name.toLowerCase().includes(mentionQuery.toLowerCase()));

            if (matchedUsers.length > 0) {
                mentionSuggestions.innerHTML = '';

                matchedUsers.forEach(user => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.textContent = user.name;
                    suggestionElement.classList.add('mentionSuggestion');
                    suggestionElement.addEventListener('click', function() {
                        const mentionStart = mentionIndex;
                        const mentionEnd = mentionIndex + mentionQuery.length;
                        const mentionText = `@${user.name} `;
                        let newText = inputValue.substring(0, mentionStart) + mentionText + inputValue.substring(mentionEnd);
                        if (mentionEnd === inputValue.length - 1) {
                            newText = inputValue.substring(0, inputValue.length - 1) + mentionText;
                        }
                        messageInput.value = newText;
                        mentionSuggestions.innerHTML = '';
                    });
                    mentionSuggestions.appendChild(suggestionElement);
                });
            } else {
                mentionSuggestions.innerHTML = '';
            }
        } else {
            mentionSuggestions.innerHTML = '';
        }
    });
};

const getAllMember = async () => {
    const getAllData = await fetch('/get-all-active-user');
    const response = await getAllData.json();
    return response;
};


 
 

async function createPost() {
    let postText = document.getElementById('content').value
    let postFile = document.getElementById('file').files[0]


    if (!postFile && postText.trim() === '') {
        alert("Please enter some text or upload a media file.");
        return;
    } else {
        let data = new FormData(document.getElementById('postForm'))
        let file = document.getElementById('file').files
        let captions = [];

        for (let i = 0; i < file.length; i++) {
            data.append('files', file[i])
            const captionInput = document.querySelector(`input[name="caption-${i}"]`);
            if (captionInput) {
                captions.push(captionInput.value + '');
            } else {
                captions.push('')
            }
        }
        data.append('captions', captions);
        console.log(data)
        console.log(Object.fromEntries(data.entries()))
        let response = await fetch('/post/createPublicPost', {
            method: 'POST',
            body: data
        })
        document.getElementById('postForm').reset()
        console.log(response)
        if (response) {
            cat.classList.add('hidden')
            mark.classList.remove('hidden')
            removePreview()
        }
        while (newsfeed.firstChild) {
            newsfeed.removeChild(newsfeed.firstChild)
        }
        welcome()
        // postCount = 0
    }

}

 
 

 

 
 

 
async function getPostDetail(id) {
    let data = await fetch('/post/getPost/' + id, {
        method: 'GET'
    })
    let response = await data.json()
    console.log(response)
    let div = document.getElementById('editModal')
    let row = ''
    row += `
  
    
    <div>

    <div>
    <form id="updatePostForm">
    <b>ADD new DATA</b>
    <input type="file" id="updateAddedFiles" class="form-control" multiple>
    <div id="updatePreview"></div>
    <input type="hidden" id="UpdatePostId" value="${response.id}" name="postId">
     
    <b>OLD DATA</b></br>
    <textarea name="updatePostText" class="form-control">${response.description}</textarea> 
    </form>
    </div>
  
   `
    response.resources.forEach((r, index) => {
        row += `
    <div>
    <input type="hidden" id="resourceId" value="${r.id}">
    <textarea id="${r.id}-caption" class="form-control" name="captionOfResource">${r.description}</textarea>`
        if (r.video === null) {
            row += `
        <button class="btn btn-danger"  onclick="deleteResource(${r.id})">Delete</button>
        <img  style="width:100px; height:100px;" alt="deleted"  id="${r.id}-url" value="${r.photo}" src ="${r.photo}">
        `
        }
        if (r.photo === null) {
            row += `
        <button class="btn btn-danger"  onclick="deleteResource(${r.id})">Delete</button>
        <video style="width:100px; height:100px;" alt="deleted" id="${r.id}-url" value="${r.video}" controls src="${r.video}"></video>
        `
        }


    })

    row += `
    </div>
     
    `
    div.innerHTML = row

    let updateFiles = document.getElementById('updateAddedFiles')
    console.log(updateFiles.value)
    updateFiles.addEventListener('change', async function () {
        console.log('here here')
        const preview = document.getElementById('updatePreview');
        preview.innerHTML = '';
        const files = document.getElementById('updateAddedFiles').files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name.toLowerCase();
            console.log(fileName)
            console.log(fileName.split('.').pop())
            const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'psv', 'svg', 'webp', 'ico', 'heic'];
            const validVideoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'mpeg', 'mpg', 'webm', '3gp', 'ts'];
            if (validImageExtensions.includes(fileName.split('.').pop()) || validVideoExtensions.includes(fileName.split('.').pop())) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                if (validImageExtensions.includes(fileName.split('.').pop())) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        previewItem.appendChild(img);
                        preview.classList.add('form-control')
                    };
                    reader.readAsDataURL(file);
                } else if (validVideoExtensions.includes(fileName.split('.').pop())) {
                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(file);
                    video.style.maxWidth = '100px';
                    video.style.maxHeight = '100px';
                    video.controls = true;
                    previewItem.appendChild(video);
                    preview.classList.add('form-control')
                }

                // Create caption input
                const captionInput = document.createElement('input');
                captionInput.classList.add('form-control')
                captionInput.type = 'text';
                captionInput.placeholder = 'Enter caption';
                captionInput.name = `updateCaption-${i}`;

                preview.appendChild(previewItem);
                preview.appendChild(captionInput);
            } else {
                alert('Invalid file type. Please select a JPG, JPEG or PNG file.');
                document.getElementById('updateAddedFiles').value = '';
            }


        }
    })
}

function removePreview() {
    document.getElementById('preview').innerHTML = ''
    document.getElementById('postForm').reset()
}


async function getUpdateData() {
    let updateResourcesDtos = []
    const value = document.querySelectorAll('#resourceId')
    value.forEach(v => console.log(v.value))
    value.forEach(v => {
        const cap = document.getElementById(`${v.value}-caption`)
        let caption = cap.value
        console.log(caption)
        const url = document.getElementById(`${v.value}-url`)
        let resourceUrl = url.src
        console.log(resourceUrl)
        if (resourceUrl == 'http://localhost:8080/null' || resourceUrl == 'http://localhost:8080/deleted') {
            let dto = {
                resourceId: v.value,
                postCaption: 'deleted',
                postUrl: 'deleted'
            }
            updateResourcesDtos.push(dto)
        } else {
            let dto = {
                resourceId: v.value,
                postCaption: caption,
                postUrl: resourceUrl
            }
            updateResourcesDtos.push(dto)

        }
        console.log(updateResourcesDtos)
    })
    console.log(updateResourcesDtos)
    let data = new FormData(document.getElementById('updatePostForm'))
    let newFiles = document.getElementById('updateAddedFiles').files
    let captions = []
    for (let i = 0; i < newFiles.length; i++) {
        data.append('files', newFiles[i])
        const captionInput = document.querySelector(`input[name="updateCaption-${i}"]`);
        if (captionInput) {
            captions.push(captionInput.value + '');
        } else {
            captions.push('')
        }
    }
    data.append('captions', captions);
    console.log(Object.fromEntries(data.entries()))
    let firstResponse = await fetch('/post/firstUpdate', {
        method: 'POST',
        body: data
    })
    let firstResult = await firstResponse.json()
    console.log(firstResult)
    let secondResponse = await fetch('/post/secondUpdate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateResourcesDtos)
    })
    let secondResult = await secondResponse.json()
    console.log(secondResult)
    if (secondResult) {
        while (newsfeed.firstChild) {
            newsfeed.removeChild(newsfeed.firstChild)
        }
        await welcome()
        // postCount = 0
    }
}

function deleteResource(id) {
    document.getElementById(id + '-url').src = 'deleted'
    document.getElementById(id + '-caption').value = ''
    console.log('removed')
    console.log(document.getElementById(id + '-url').src)
}

window.addEventListener('load', async function () {
    let data = await this.fetch('/event/refresh', {
        method: 'GET'
    })
    console.log(data)
})

async function createPollPost() {
    let data = new FormData(document.getElementById('pollForm'));
    console.log(Object.fromEntries(data.entries()));
    let response = await fetch('/event/createEvent', {
        method: 'POST',
        body: data
    });
    let result = await response.json()
    console.log(result)
}

async function getAllEventsForPost(){
    isFetchingForEvent = true
    let rows =''
    let data = await fetch(`/event/getEventsForNewsfeed/${currentPageForEvent}`,{
        method : 'GET'
    })
    let response = await data.json()
    isFetchingForEvent = false
    let row = ''
    console.log(response)
    if(response.length===0){
        hasMoreForEvent = false
        displayNoPostMessage()
    }else{
        for(const r of response){
            let createdTime = await timeAgo(new Date(r.created_date))
            let expired = ''
            if(new Date()>new Date(r.end_date)){
                expired=`
                
    <div class="alert alert-danger d-flex align-items-center" style=" width:265px; position: absolute; top: 135px;  z-index: 1;" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
    <div>
    <i class="fa-solid fa-triangle-exclamation"></i>
    EVENT IS EXPIRED
    </div>
    </div>
                
                `
            }
            

            let photo = r.photo === null ? '/static/assets/img/eventImg.jpg' : r.photo
            let startDate = new Date(r.start_date)
            let startDay = startDate.getDate()
            let startMonth = startDate.getMonth()+1
            let startYear = startDate.getFullYear()
            let startHours = startDate.getHours()
            let startMinutes = startDate.getMinutes()
            let endDate = new Date(r.end_date)
            let endDay = endDate.getDate()
            let endMonth = endDate.getMonth()+1
            let endYear = endDate.getFullYear()
            let endHours = endDate.getHours()
            let endMinutes = endDate.getMinutes()
            let formattedStartDate = `${startDay} / ${startMonth} / ${startYear}  `;
            let formattedEndDate = `${endDay} / ${endMonth} / ${endYear}  `
            let rows =   `
        
            <div class="post">
            <div class="post-top">
                <div class="dp">
                    <img src="${r.user.photo}" alt="">
                </div>
                <div class="post-info">
                    <p class="name">${r.user.name}</p>
                    <span class="time">${createdTime}</span>
                </div>
                            <div class="dropdown offset-8">
          <a class=" dropdown-toggle" onclick="getEventDetail(${r.id})" href="#"   id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-h "></i>
                </a>
        
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#eventEditModalBox">Edit</a></li>
            <li><a class="dropdown-item" onclick="deleteEvent(${r.id})">Delete Post</a></li> 
          </ul>
        </div>
            </div> 
            <div class=" post-content" data-bs-toggle="modal" data-bs-target="#searchPost" > 
            <div class="card" style="width: 30rem;  margin-left:12px ;"> 
      <div class="card-body">
        <h5 class="card-title">${r.title}</h5> 
        <div class="d-flex align-items-start">
        <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        <button class="nav-link active  " id="v-${r.id}-photo-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-photo" type="button" role="tab" aria-controls="v-${r.id}-photo" aria-selected="true"><i class="fa-solid fa-image"></i>  </button>
          <button class="nav-link  " id="v-${r.id}-about-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-about" type="button" role="tab" aria-controls="v-${r.id}-about" aria-selected="false"><i class="fa-solid fa-circle-info"></i>  </button>
          <button class="nav-link" id="v-${r.id}-location-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-location" type="button" role="tab" aria-controls="v-${r.id}-location" aria-selected="false"><i class="fa-solid fa-location-dot"></i> </button>
          <button class="nav-link" id="v-${r.id}-date-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-date" type="button" role="tab" aria-controls="v-${r.id}-date" aria-selected="false"><i class="fa-solid fa-clock"></i></button> 
        </div>
        <div class="tab-content" id="v-${r.id}-tabContent">
          <div class="tab-pane fade" id="v-${r.id}-about" role="tabpanel" aria-labelledby="v-${r.id}-about-tab">
          <div class="text-center lh-sm font-monospace">
          ${r.description}
          </div>
          </div>
          <div class="tab-pane fade" id="v-${r.id}-location" role="tabpanel" aria-labelledby="v-${r.id}-location-tab">
          <div class="text-center fs-5 fw-bold fst-italic font-monospace ml-3">
          <div class="ml-5  mt-5 text-danger">${r.location}</div>
          </div>
          </div>
          <div class="tab-pane fade" id="v-${r.id}-date" role="tabpanel" aria-labelledby="v-${r.id}-date-tab">
          <div class="text-center fs-6 fw-bold mt-3  pl-2 font-monospace">
          <div class="mt-2 ml-5 d-flex"><div class="text-secondary"> START </div> <i class="fa-solid fa-play text-danger mx-1"></i></br></div><div class="fst-italic"> ${formattedStartDate}</div></br>
          <div class="mt-2 ml-5 d-flex"><div class="text-secondary"> END </div> <i class="fa-solid fa-play text-danger mx-1"></i><br></div><div class="fst-italic"> ${formattedEndDate}</div>
           </div>
           </div>
          <div class="tab-pane fade show active" id="v-${r.id}-photo" role="tabpanel" aria-labelledby="v-${r.id}-photo-tab"> 
          ${expired}
          <b class="p-2"><img src="${r.photo}" style="width:250px; height:200px; border-radius:20px; position:relative;">
          </div> 
        </div>
      </div>
      </div>
    </div>
            </div>
            <div class="post-bottom">
                <div class="action" style="height: 50px">
        <div class="button_wrapper">
              <div class="all_likes_wrapper">
                  <div data-title="LIKE">
                      <img src="/static/assets/img/like.png" alt="Like" />
                  </div>
                  <div data-title="LOVE">
                      <img src="/static/assets/img/love.png" alt="Love" />
                  </div>
                  <div data-title="CARE">
                      <img src="/static/assets/img/care.png" alt="Care" />
                  </div>
                  <div data-title="HAHA">
                      <img src="/static/assets/img/haha.png" alt="Haha" />
                  </div>
                  <div data-title="WOW">
                      <img src="/static/assets/img/wow.png" alt="Wow" />
                  </div>
                  <div data-title="SAD">
                      <img src="/static/assets/img/sad.png" alt="Sad" />
                  </div>
                  <div data-title="ANGRY">
                      <img src="/static/assets/img/angry.png" alt="Angry" />
                  </div>
              </div>
              <button class="like_button" id=" "> 
              </button>
          </div>
                </div>
                <div class="action">
                    <i class="fa-regular fa-comment"></i>
                    <span onclick="pressedComment()"  data-bs-toggle="modal" data-bs-target="#commentStaticBox">Comment  </span>
                </div>
                <div class="action">
                    <i class="fa fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
        `;

            row+= rows
        };

        let range = document.createRange();
        let fragment = range.createContextualFragment(row);

        eventDiv.appendChild(fragment)
     

    }

}

async function deletePost(id) {
    let data = await fetch('/post/deletePost/' + id, {
        method: 'GET'
    })
    let response = await data.json()
    console.log(response)
    while (newsfeed.firstChild) {
        newsfeed.removeChild(newsfeed.firstChild)
    }
   await  welcome()
    // postCount = 0
}

async function createEventPost() {
    let data = new FormData(document.getElementById('eventForm'));
    console.log(Object.fromEntries(data.entries()));
    let response = await fetch('/event/createEvent', {
        method: 'POST',
        body: data
    });
    let result = await response.json()
    console.log(result)

}

let startDate = document.getElementById('start_date')
let endDate = document.getElementById('end_date')

 
async function setToNormal() {
    cat.classList.remove('hidden')
    mark.classList.add('hidden')
}

let isLoadingPosts = false;

// window.addEventListener('scroll', async function () {
//
//     if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
//         getAllEventsForPost()
//         postCount++;
//         console.log('End of scroll reached!');
//         isLoadingPosts = true;
//         let posts = await welcome(postCount);
//         console.log(postCount);
//         isLoadingPosts = false;
//     }
// });

 


async function getAllUserGroup(num) {
    let groups = document.getElementById('groupSelect' + num)
   await mentionCommunityMember();
    let data = await fetch('/api/community/loginUserGroups')
    let result = await data.json();
    console.log(result)
    let group = ''
    group += `<option selected  value=0>SELECT GROUP</option> `
    result.forEach((r, index) => {
        let active = index === 0 ? 'selected' : ''

        group +=
            `
 
  <option   value='${r.id}'>${r.name}</option> 

  `
    })

    groups.innerHTML = group
}
 

 

document.addEventListener('DOMContentLoaded', () => {
    loginUser = localStorage.getItem('staff_id');
    connect();
    notifyMessage().then();

});

let loginUser = null;
let stompClient = null;
let notificationCount = 0;
const connect = () => {
    let socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        stompClient.subscribe(`/user/${loginUser}/like-private-message`, receivedMessageForReact);
        stompClient.subscribe(`/user/all/comment-private-message`, receivedMessageForComment);
        stompClient.subscribe(`/user/${loginUser}/comment-private-message`, receivedMessageForComment);
        stompClient.subscribe(`/user/all/comment-reply-private-message`, receivedMessageForCommentReply);
    });
};


document.getElementById('notiCountDecrease').addEventListener('click', () => {
    notificationCount = 0;
    showNotiCount().then();
});

const showNotiCount = async () => {
    const notiShow = document.getElementById('notiCount');
    notiShow.innerText = notificationCount;
    if (notificationCount === 0) {
        notiShow.innerText = "";
    }
};

const notifyMessage = async () => {
    const showMessage = document.getElementById('notifyMessage');
    const pElement = document.createElement('p');
    if (notificationCount === 0) {
        pElement.textContent = 'There is no notification yet!';
    } else {
        pElement.textContent = '';
    }
    showMessage.innerHTML = '';
    showMessage.appendChild(pElement);
};

const notifyMessageForReact = async (message, sender, photo, type) => {
    const spanElement = document.getElementById('notiId');
    spanElement.innerText = `You have ${notificationCount} new notifications`;
    const showMessage = document.getElementById('notifyMessage');
    showMessage.style.whiteSpace = 'nowrap';
    const containerDiv = document.createElement('div');
    const pElement = document.createElement('p');
    const imgElement = document.createElement('img');
    const imgReactElement = document.createElement('img');

    photo = photo || '/static/assets/img/card.jpg';
    imgElement.src = `${photo}`;
    imgElement.width = 40;
    imgElement.height = 40;
    imgElement.style.borderRadius = '50%';
    pElement.textContent = sender + ' ' + message;
    pElement.style.fontWeight = 'bold';
    if (type) {
        imgReactElement.src = `/static/assets/img/${type.toLowerCase()}.png`;
        imgReactElement.width = 20;
        imgReactElement.height = 20;
    }

    containerDiv.style.display = 'flex';
    containerDiv.style.alignItems = 'center';
    // containerDiv.style.border = '1px solid';
    containerDiv.style.borderRadius = '10px';
    containerDiv.style.padding = '10px';
    containerDiv.style.marginBottom = '3px';

    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';

    const imgReactWrapper = document.createElement('div');
    imgReactWrapper.style.position = 'relative';
    imgReactWrapper.style.marginLeft = '10px';

    imgReactElement.style.position = 'absolute';
    imgReactElement.style.left = '50%';
    imgReactElement.style.transform = 'translateX(-50%)';
    imgReactElement.style.marginLeft = '-9px';
    imgWrapper.appendChild(imgElement);
    imgReactWrapper.appendChild(imgReactElement);

    containerDiv.appendChild(imgWrapper);
    containerDiv.appendChild(imgReactWrapper);
    containerDiv.appendChild(pElement);

    showMessage.appendChild(containerDiv);
};


const receivedMessageForReact = async (payload) => {
    console.log("Message Received");
    const message = await JSON.parse(payload.body);
    // await welcome();
    if (loginUser === message.staffId) {
        notificationCount = notificationCount + 1;
        await showNotiCount();
        await notifyMessageForReact(message.content, message.sender, message.photo, message.type);
    }
};

const pressedLike = async (id, type) => {
    console.log('PostId', id);
    const myObj = {
        postId: id,
        sender: loginUser,
        content: ` reacted to your post!`,
        type: type
    };
    stompClient.send('/app/react-message', {}, JSON.stringify(myObj));
};


const getAllComments = async (id) => {
    const fetchComments = await fetch(`/getComment/${id}`);
    if (!fetchComments.ok) {
        alert('There is something wrong in the comment section,Please try again!');
    }
    const getData = await fetchComments.json();
    const chatArea = document.querySelector('#commentMessageText');
    chatArea.innerHTML = '';
    getData.forEach(c => {
        displayMessage(c.user.name, c.content, c.user.photo, c.id, c.post.id, chatArea);
    });
};

const displayMessage = async (sender, content, photo, id, postId, chatArea) => {
    const user = await fetchUserDataByPostedUser(loginUser);
    const divItem = document.createElement('div');
    divItem.classList.add(`user-item-${id}`);
    const userImage = document.createElement('img');
    photo = photo || '/static/assets/img/card.jpg';
    userImage.src = `${photo}`;
    userImage.alt = 'User Photo';
    userImage.style.width = '60px';
    userImage.style.height = '60px';
    userImage.classList.add('user-photo');
    userImage.style.border = '2px solid #ccc';
    const spanSender = document.createElement('span');
    if (sender === user.name) {
        spanSender.innerHTML = `You : `;
    } else {
        spanSender.innerHTML = `${sender} : `;
    }
    const spanElement = document.createElement('span');
    spanElement.classList.add(`comment-span-container-${id}`);
    spanElement.id = id;
    spanElement.innerHTML = `${content}`;
    // divItem.style.border = '1px solid lightslategrey';
    divItem.style.padding = '5px';
    divItem.style.borderRadius = '30px'
    divItem.style.width = '450px';

    const convertDiv = document.createElement('div');
    convertDiv.classList.add('content-container');
    const spanElementForImg = document.createElement('span');
    spanElementForImg.appendChild(userImage);
    divItem.appendChild(spanElementForImg);
    convertDiv.style.marginLeft = '70px';
    convertDiv.style.marginTop = '-50px';
    convertDiv.style.padding = '25px';
    convertDiv.style.borderBottomRightRadius = '20px';
    convertDiv.style.backgroundColor = 'lightgrey';
    convertDiv.style.borderTopLeftRadius = '10px';
    convertDiv.style.borderBottomLeftRadius = '35px';
    divItem.appendChild(convertDiv);
    const ddEl = document.createElement('div');
    ddEl.classList.add(`comment-container-${id}`);
    ddEl.appendChild(spanSender);
    ddEl.appendChild(spanElement);
    convertDiv.appendChild(ddEl);
    chatArea.appendChild(divItem);

    const likeIconWithoutColor = document.createElement('i');
    likeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-up');
    likeIconWithoutColor.style.fontSize = '20px';
    likeIconWithoutColor.addEventListener('click', () => {
        if (iconDiv.contains(dislikeIconWithColor)) {
            iconDiv.removeChild(dislikeIconWithColor);
        }
        iconDiv.appendChild(dislikeIconWithoutColor);
        iconDiv.removeChild(likeIconWithoutColor);
        iconDiv.appendChild(likeIconWithColor);
        const myObj = {
            postId: postId,
            commentId: id,
            sender: loginUser,
            content: ` liked  your comment!`,
            type: 'LIKE',
        }
        stompClient.send('/app/like-commentReact-message', {}, JSON.stringify(myObj));
    });
    const likeIconWithColor = document.createElement('i');
    likeIconWithColor.style.fontSize = '20px';
    likeIconWithColor.classList.add('fa-solid', 'fa-thumbs-up');
    likeIconWithColor.addEventListener('click', () => {
        if (iconDiv.contains(dislikeIconWithColor)) {
            iconDiv.removeChild(dislikeIconWithColor);
        }
        iconDiv.appendChild(dislikeIconWithoutColor);
        iconDiv.removeChild(likeIconWithColor);
        iconDiv.appendChild(likeIconWithoutColor);
        const myObj = {
            postId: postId,
            commentId: id,
            sender: loginUser,
            content: ` liked  your comment!`,
            type: null,
        }
        stompClient.send('/app/like-commentReact-message', {}, JSON.stringify(myObj));
    });
    const dislikeIconWithoutColor = document.createElement('i');
    dislikeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-down');
    dislikeIconWithoutColor.style.fontSize = '20px';
    dislikeIconWithoutColor.style.padding = '10px';
    dislikeIconWithoutColor.addEventListener('click', () => {
        iconDiv.removeChild(dislikeIconWithoutColor);
        iconDiv.appendChild(dislikeIconWithColor);
        if (iconDiv.contains(likeIconWithColor)) {
            iconDiv.removeChild(likeIconWithColor);
        }
        iconDiv.appendChild(likeIconWithoutColor);
        const myObj = {
            postId: postId,
            commentId: id,
            sender: loginUser,
            content: ` disliked  your comment!`,
            type: 'DISLIKE',
        }
        stompClient.send('/app/like-commentReact-message', {}, JSON.stringify(myObj));
    });
    const dislikeIconWithColor = document.createElement('i');
    dislikeIconWithColor.classList.add('fa-solid', 'fa-thumbs-down');
    dislikeIconWithColor.style.fontSize = '20px';
    dislikeIconWithColor.style.padding = '10px';
    dislikeIconWithColor.addEventListener('click', () => {
        iconDiv.removeChild(dislikeIconWithColor);
        iconDiv.appendChild(dislikeIconWithoutColor);
        if (iconDiv.contains(likeIconWithColor)) {
            iconDiv.removeChild(likeIconWithColor);
        }
        iconDiv.appendChild(likeIconWithoutColor);
        const myObj = {
            postId: postId,
            commentId: id,
            sender: loginUser,
            content: ` dislike your comment!`,
            type: null,
        }
        stompClient.send('/app/like-commentReact-message', {}, JSON.stringify(myObj));
    });
    let replyInput = divItem.querySelector('.reply-input');
    let submitButton = divItem.querySelector('.submit-reply-btn');
    let cancelButton = divItem.querySelector('.cancel-reply-btn');

    const replyButton = document.createElement('i');
    replyButton.classList.add('fa-solid', 'fa-reply');
    replyButton.style.padding = '10px';
    replyButton.style.fontSize = '20px';
    replyButton.style.marginLeft = '310px';
    replyButton.id = id;

    replyButton.addEventListener('click', async () => {
        const commentUser = await fetchCommetedUser(id);
        if (!replyInput) {
            replyInput = document.createElement('input');
            replyInput.type = 'text';
            replyInput.placeholder = 'Type your reply...';
            replyInput.classList.add('reply-input');
            replyInput.style.marginTop = '10px';
            replyInput.style.borderRadius = '10px';
            replyInput.value = `@ ${commentUser.user.name} : `;
            replyInput.style.padding = '8px';
            replyInput.readOnly = true;
            divItem.appendChild(replyInput);

            replyInput.addEventListener('focus', function () {
                replyInput.removeAttribute('readOnly');
                replyInput.classList.remove('readonly');
            });
            replyInput.addEventListener('blur', function () {
                replyInput.readOnly = true;
                replyInput.classList.add('readonly');
            });
        } else {
            replyInput.value = `@ ${commentUser.user.name} `;
            replyInput.readOnly = true;
            replyInput.classList.add('readonly');
        }

        replyInput.addEventListener('input', function () {
            if (replyInput.value === `@ ${commentUser.user.name} `) {
                replyInput.classList.add('readonly');
            } else {
                replyInput.classList.remove('readonly');
            }
        });

        if (!submitButton) {
            submitButton = document.createElement('button');
            submitButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'submit-reply-btn');
            submitButton.textContent = 'Submit';
            submitButton.addEventListener('click', async () => {
                const replyContent = replyInput.value.trim();
                if (replyContent !== '') {
                    const myObj = {
                        commentId: id,
                        sender: loginUser,
                        content: replyContent
                    };
                    stompClient.send('/app/comment-reply-message', {}, JSON.stringify(myObj));
                    const chatArea = document.querySelector('#commentMessageText');
                  // await displayMessage(user.name, replyContent, user.photo, id, postId, chatArea);
                   //
                   //  const reply = await createReplyElement(replyContent,user.name,user.photo,id,postId);
                    console.log(`Replying to comment ${id}: ${replyContent}`);
                    repliesContainer.style.display = 'block';
                        replyInput.value = '';
                } else {
                    alert('Please enter something that you want to reply.');
                }
            });
            divItem.appendChild(submitButton);
        }

        if (!cancelButton) {
            cancelButton = document.createElement('button');
            cancelButton.innerHTML = 'Cancel';
            cancelButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'cancel-reply-btn');
            cancelButton.addEventListener('click', () => {
                divItem.removeChild(replyInput);
                divItem.removeChild(submitButton);
                divItem.removeChild(cancelButton);
            });
            divItem.appendChild(cancelButton);
        }

        replyInput.focus();
    });
    divItem.appendChild(replyButton);
    const iconDiv = document.createElement('div');
    iconDiv.style.marginLeft = '345px';
    iconDiv.style.marginTop = '-40px';
    const react = await commentReactType(id, user.id, postId);
    if (react !== null && react.type === 'DISLIKE') {
        iconDiv.appendChild(dislikeIconWithColor);
    } else {
        iconDiv.appendChild(dislikeIconWithoutColor);
    }

    if (react !== null && react.type === 'LIKE') {
        iconDiv.appendChild(likeIconWithColor);
    } else {
        iconDiv.appendChild(likeIconWithoutColor);
    }
    divItem.appendChild(iconDiv);
    const replies = await fetchAndDisplayReplies(id);
    const repliesContainer = document.createElement('div');
    repliesContainer.classList.add(`replies-container-${id}`);
    repliesContainer.style.display = 'none';

    for (const reply of replies) {
        repliesContainer.appendChild(reply);
    }
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');

    const dropDownIcon = document.createElement('i');
    dropDownIcon.classList.add('fa-solid', 'fa-ellipsis-vertical');
    dropDownIcon.style.padding = '15px';
    dropDownIcon.style.fontSize = '20px';
    dropDownIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    const seeMoreButton = document.createElement('i');
    seeMoreButton.classList.add('fa-regular', 'fa-comment');
    seeMoreButton.style.padding = '10px';
    seeMoreButton.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
        repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';
    });

    dropdownMenu.appendChild(seeMoreButton);
    divItem.appendChild(dropdownMenu);

    if (sender === user.name) {
        const editIcon = document.createElement('i');
        editIcon.classList.add('fa-regular', 'fa-pen-to-square');
        editIcon.style.padding = '15px';
        editIcon.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
            let currentContent = null;
            if (convertDiv.contains(spanElement)) {
                currentContent = spanElement.innerHTML;
            }
            console.log('textArea', currentContent);
            const textarea = document.createElement('textarea');
            textarea.style.borderRadius = '10px';
            textarea.style.backgroundColor = 'lightgrey';
            textarea.value = currentContent;
            ddEl.replaceChild(textarea, spanElement);
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'save-button');
            saveButton.addEventListener('click', async () => {
                const updatedContent = textarea.value.trim();
                if (updatedContent !== '') {
                    const commentId = spanElement.id;
                    await updateContent(commentId, updatedContent);
                    spanElement.innerHTML = updatedContent;
                    ddEl.removeChild(textarea);
                    divItem.removeChild(saveButton);
                } else {
                    alert('Please enter something for the comment.');
                }
            });
            divItem.appendChild(saveButton);
        });
        dropdownMenu.appendChild(editIcon);

        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fa-solid', 'fa-trash');
        trashIcon.style.padding = '10px';
        trashIcon.addEventListener('click', async () => {
            dropdownMenu.style.display = 'none';
            const commentId = spanElement.id;
            console.log("Span Element id", commentId);
            await deleteComment(commentId);
        });
        dropdownMenu.appendChild(trashIcon);
        divItem.appendChild(dropdownMenu);
    }
    const chDiv = document.createElement('div');
    chDiv.style.marginLeft = '410px';
    chDiv.style.marginTop = '-45px';
    chDiv.appendChild(dropDownIcon);
    divItem.appendChild(chDiv);
    const rpDiv = document.createElement('div');
    rpDiv.appendChild(repliesContainer);
    divItem.appendChild(rpDiv);
};

const onSuccess =async (id) => {
    const reply = await fetchAndDisplayLastReply(id);
    console.log('wow mal ya pr lr')
    await document.querySelector(`.replies-container-${id}`).appendChild(reply);
}

const fetchAndDisplayLastReply = async (id) => {
    const fetchReplies = await fetch(`/getAll-comment/${id}`);
    const fetchDataForReplies = await fetchReplies.json();
    const replyElement = document.createElement('div');
    const lastReplyIndex = fetchDataForReplies.length - 1;
    if (lastReplyIndex >= 0) {
        const reply = fetchDataForReplies[lastReplyIndex];
        const user = await fetchUserDataByPostedUser(loginUser);
        const userRpImage = document.createElement('img');
        const photo = reply.user.photo || '/static/assets/img/card.jpg';
        userRpImage.src = `${photo}`;
        userRpImage.alt = 'User Photo';
        userRpImage.classList.add('user-photo');
        userRpImage.style.height = '50px';
        userRpImage.style.width = '50px';
        userRpImage.style.marginLeft = '50px';
        userRpImage.style.backgroundColor = '#cccccc';
        replyElement.classList.add('reply-item');
        const replySender = document.createElement('span');
        if (reply.user.name === user.name) {
            replySender.innerHTML = `You : `;
        } else {
            replySender.innerHTML = `${reply.user.name} : `;
        }
        const replyContent = document.createElement('span');
        replyContent.id = reply.id;
        replyContent.innerHTML = reply.content;
        const spElement = document.createElement('span');
        const contentElement = document.createElement('span');
        const divEl = document.createElement('div');
        divEl.style.marginLeft = '110px';
        divEl.style.padding = '20px';
        divEl.style.backgroundColor = 'lightgrey';
        divEl.style.marginTop = '-30px';
        divEl.style.borderTopLeftRadius = '10px';
        divEl.style.borderBottomLeftRadius = '30px';
        divEl.style.borderBottomRightRadius = '15px';
        spElement.appendChild(userRpImage);
        replyElement.appendChild(spElement);
        divEl.appendChild(replySender);
        divEl.appendChild(replyContent);
        contentElement.appendChild(divEl);
        replyElement.appendChild(contentElement);

        let replyInputForReply = replyElement.querySelector('.reply-input');
        let submitButton = replyElement.querySelector('.submit-reply-btn');
        let cancelButton = replyElement.querySelector('.cancel-reply-btn');
        const replyButton = document.createElement('i');
        replyButton.style.padding = '10px';
        replyButton.style.marginLeft = '300px';
        replyButton.classList.add('fa-solid', 'fa-reply');
        replyButton.addEventListener('click',async () => {
            const replyUser = await fetchRepliedUserForData(reply.id);
            if (!replyInputForReply) {
                replyInputForReply = document.createElement('input');
                replyInputForReply.type = 'text';
                replyInputForReply.placeholder = 'Type your reply...';
                replyInputForReply.classList.add('reply-input');
                replyInputForReply.style.marginTop = '10px';
                replyInputForReply.style.borderRadius = '10px';
                replyInputForReply.value = `@ ${replyUser.user.name} : `;
                replyInputForReply.style.padding = '8px';
                replyInputForReply.readOnly = true;
                replyElement.appendChild(replyInputForReply);

                replyInputForReply.addEventListener('focus', function () {
                    replyInputForReply.removeAttribute('readOnly');
                    replyInputForReply.classList.remove('readonly');
                });
                replyInputForReply.addEventListener('blur', function () {
                    replyInputForReply.readOnly = true;
                    replyInputForReply.classList.add('readonly');
                });
            } else {
                replyInputForReply.value = `@ ${replyUser.user.name} `;
                replyInputForReply.readOnly = true;
                replyInputForReply.classList.add('readonly');
            }

            replyInputForReply.addEventListener('input', function () {
                if (replyInputForReply.value === `@ ${replyUser.user.name} `) {
                    replyInputForReply.classList.add('readonly');
                } else {
                    replyInputForReply.classList.remove('readonly');
                }
            });
            if (!submitButton) {
                submitButton = document.createElement('button');
                submitButton.style.marginTop = '10px';
                submitButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'submit-reply-btn');
                submitButton.textContent = 'Submit';
                submitButton.addEventListener('click', async () => {
                    const replyContent = replyInputForReply.value.trim();
                    if (replyContent !== '') {
                        const myObj = {
                            replyId: reply.id,
                            sender: loginUser,
                            content: replyContent
                        };
                        stompClient.send('/app/comment-reply-message', {}, JSON.stringify(myObj));
                        const chatArea = document.querySelector('#commentMessageText');
                        //await displayMessage(user.name, replyContent, user.photo, id, reply.comment.post.id, chatArea);
                        console.log("kyi mal", user.name, replyContent, user.photo, id, reply.comment.post.id);
                        console.log(`Replying to comment ${id}: ${replyContent}`);
                        replyInputForReply.value = '';
                    } else {
                        alert('Please enter something that you want to reply.');
                    }
                });

                replyElement.appendChild(submitButton);
            }
            if (!cancelButton) {
                cancelButton = document.createElement('button');
                cancelButton.innerHTML = 'Cancel';
                cancelButton.style.marginTop = '10px';
                cancelButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'cancel-reply-btn');
                cancelButton.addEventListener('click', () => {
                    replyElement.removeChild(replyInputForReply);
                    replyElement.removeChild(submitButton);
                    replyElement.removeChild(cancelButton);
                });
                replyElement.appendChild(cancelButton);
            }
            replyInputForReply.focus();
        });
        replyElement.appendChild(replyButton);
        const likeIconWithoutColor = document.createElement('i');
        likeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-up');
        likeIconWithoutColor.style.fontSize = '20px';
        likeIconWithoutColor.addEventListener('click', () => {
            if (iconDiv.contains(dislikeIconWithColor)) {
                iconDiv.removeChild(dislikeIconWithColor);
            }
            iconDiv.appendChild(dislikeIconWithoutColor);
            iconDiv.removeChild(likeIconWithoutColor);
            iconDiv.appendChild(likeIconWithColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` like  your reply!`,
                type: 'LIKE',
            };

            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });

        const likeIconWithColor = document.createElement('i');
        likeIconWithColor.style.fontSize = '20px';
        likeIconWithColor.classList.add('fa-solid', 'fa-thumbs-up');
        likeIconWithColor.addEventListener('click', () => {
            if (iconDiv.contains(dislikeIconWithColor)) {
                iconDiv.removeChild(dislikeIconWithColor);
            }
            iconDiv.appendChild(dislikeIconWithoutColor);
            iconDiv.removeChild(likeIconWithColor);
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` liked  your reply!`,
                type: null,
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });
        const dislikeIconWithoutColor = document.createElement('i');
        dislikeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-down');
        dislikeIconWithoutColor.style.fontSize = '20px';
        dislikeIconWithoutColor.style.padding = '10px';
        dislikeIconWithoutColor.addEventListener('click', () => {
            iconDiv.removeChild(dislikeIconWithoutColor);
            iconDiv.appendChild(dislikeIconWithColor);
            if (iconDiv.contains(likeIconWithColor)) {
                iconDiv.removeChild(likeIconWithColor);
            }
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` dislike your reply!`,
                type: 'DISLIKE',
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });
        const dislikeIconWithColor = document.createElement('i');
        dislikeIconWithColor.classList.add('fa-solid', 'fa-thumbs-down');
        dislikeIconWithColor.style.fontSize = '20px';
        dislikeIconWithColor.style.padding = '10px';
        dislikeIconWithColor.addEventListener('click', () => {
            iconDiv.removeChild(dislikeIconWithColor);
            iconDiv.appendChild(dislikeIconWithoutColor);
            if (iconDiv.contains(likeIconWithColor)) {
                iconDiv.removeChild(likeIconWithColor);
            }
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` dislike your comment!`,
                type: null,
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });

        const iconDiv = document.createElement('div');
        iconDiv.style.marginLeft = '360px';
        iconDiv.style.marginTop = '-40px';
        const isReact = await replyReactType(id, user.id, reply.id);
        if (isReact !== null && isReact.type === 'DISLIKE') {
            iconDiv.appendChild(dislikeIconWithColor);
        } else {
            iconDiv.appendChild(dislikeIconWithoutColor);
        }

        if (isReact !== null && isReact.type === 'LIKE') {
            iconDiv.appendChild(likeIconWithColor);
        } else {
            iconDiv.appendChild(likeIconWithoutColor);
        }
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');

        const dropDownIcon = document.createElement('i');
        dropDownIcon.classList.add('fa-solid', 'fa-ellipsis-vertical');
        dropDownIcon.style.padding = '15px';
        dropDownIcon.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        if (reply.user.name === user.name) {
            const editIcon = document.createElement('i');
            editIcon.classList.add('fa-regular', 'fa-pen-to-square');
            editIcon.style.padding = '15px';
            editIcon.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
                const currentContent = replyContent.innerHTML;
                const textarea = document.createElement('textarea');
                textarea.style.borderRadius = '10px';
                textarea.style.backgroundColor = 'lightgrey';
                textarea.value = currentContent;
                divEl.replaceChild(textarea, replyContent);
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save';
                saveButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'save-button');
                saveButton.addEventListener('click', async () => {
                    const updatedContent = textarea.value.trim();
                    if (updatedContent !== '') {
                        const replyId = reply.id;
                        await updateContentForReply(replyId, updatedContent);
                        replyContent.innerHTML = updatedContent;
                        divEl.removeChild(textarea);
                        replyElement.removeChild(saveButton);
                    } else {
                        alert('Please enter something for the reply.');
                    }
                });
                replyElement.appendChild(saveButton);
            });
            dropdownMenu.appendChild(editIcon);
            replyElement.appendChild(dropdownMenu);

            const trashIcon = document.createElement('i');
            trashIcon.classList.add('fa-solid', 'fa-trash');
            trashIcon.style.padding = '15px';
            trashIcon.addEventListener('click', async () => {
                dropdownMenu.style.display = 'none';
                const replyId = replyContent.id;
                console.log("Span Reply id", replyId);
                await deleteReply(replyId);
            });
            dropdownMenu.appendChild(trashIcon);
            replyElement.appendChild(dropdownMenu);
            replyElement.appendChild(dropDownIcon);
            replyElement.appendChild(iconDiv);
        }
    }
    console.log('Thi chin tal',replyElement)
    return replyElement;
};


const fetchAndDisplayReplies = async (id) => {
    const fetchReplies = await fetch(`/getAll-comment/${id}`);
    const fetchDataForReplies = await fetchReplies.json();

    const replies = [];

    for (const reply of fetchDataForReplies) {
        const user = await fetchUserDataByPostedUser(loginUser);
        const replyElement = document.createElement('div');
        const userRpImage = document.createElement('img');
        const photo = reply.user.photo || '/static/assets/img/card.jpg';
        userRpImage.src = `${photo}`;
        userRpImage.alt = 'User Photo';
        userRpImage.classList.add('user-photo');
        userRpImage.style.height = '50px';
        userRpImage.style.width = '50px';
        userRpImage.style.marginLeft = '50px';
        userRpImage.style.backgroundColor = '#cccccc';
        replyElement.classList.add(`reply-item-${reply.id}`);
        const replySender = document.createElement('span');
        if (reply.user.name === user.name) {
            replySender.innerHTML = `You : `;
        } else {
            replySender.innerHTML = `${reply.user.name} : `;
        }
        const replyContent = document.createElement('span');
        replyContent.classList.add(`span-reply-container-${reply.id}`)
        replyContent.id = reply.id;
        replyContent.innerHTML = reply.content;
        const spElement = document.createElement('span');
        const contentElement = document.createElement('span');
        const divEl = document.createElement('div');
        divEl.classList.add(`reply-container-div-${reply.id}`);
        divEl.style.marginLeft = '110px';
        divEl.style.padding = '20px';
        divEl.style.backgroundColor = 'lightgrey';
        divEl.style.marginTop = '-30px';
        divEl.style.borderTopLeftRadius = '10px';
        divEl.style.borderBottomLeftRadius = '30px';
        divEl.style.borderBottomRightRadius = '15px';
        spElement.appendChild(userRpImage);
        replyElement.appendChild(spElement);
        divEl.appendChild(replySender);
        divEl.appendChild(replyContent);
        contentElement.appendChild(divEl);
        replyElement.appendChild(contentElement);

        let replyInputForReply = replyElement.querySelector('.reply-input');
        let submitButton = replyElement.querySelector('.submit-reply-btn');
        let cancelButton = replyElement.querySelector('.cancel-reply-btn');
        const replyButton = document.createElement('i');
        replyButton.style.padding = '10px';
        replyButton.style.marginLeft = '300px';
        replyButton.classList.add('fa-solid', 'fa-reply');
        replyButton.addEventListener('click',async () => {
            const replyUser = await fetchRepliedUserForData(reply.id);
            if (!replyInputForReply) {
                replyInputForReply = document.createElement('input');
                replyInputForReply.type = 'text';
                replyInputForReply.placeholder = 'Type your reply...';
                replyInputForReply.classList.add('reply-input');
                replyInputForReply.style.marginTop = '10px';
                replyInputForReply.style.borderRadius = '10px';
                replyInputForReply.value = `@ ${replyUser.user.name} : `;
                replyInputForReply.style.padding = '8px';
                replyInputForReply.readOnly = true;
                replyElement.appendChild(replyInputForReply);

                replyInputForReply.addEventListener('focus', function () {
                    replyInputForReply.removeAttribute('readOnly');
                    replyInputForReply.classList.remove('readonly');
                });
                replyInputForReply.addEventListener('blur', function () {
                    replyInputForReply.readOnly = true;
                    replyInputForReply.classList.add('readonly');
                });
            } else {
                replyInputForReply.value = `@ ${replyUser.user.name} `;
                replyInputForReply.readOnly = true;
                replyInputForReply.classList.add('readonly');
            }

            replyInputForReply.addEventListener('input', function () {
                if (replyInputForReply.value === `@ ${replyUser.user.name} `) {
                    replyInputForReply.classList.add('readonly');
                } else {
                    replyInputForReply.classList.remove('readonly');
                }
            });
            if (!submitButton) {
                submitButton = document.createElement('button');
                submitButton.style.marginTop = '10px';
                submitButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'submit-reply-btn');
                submitButton.textContent = 'Submit';
                submitButton.addEventListener('click', async () => {
                    const replyContent = replyInputForReply.value.trim();
                    if (replyContent !== '') {
                        const myObj = {
                            replyId: reply.id,
                            sender: loginUser,
                            content: replyContent
                        };
                        stompClient.send('/app/comment-reply-message', {}, JSON.stringify(myObj));
                        const chatArea = document.querySelector('#commentMessageText');
                      //  await displayMessage(user.name, replyContent, user.photo, id, reply.comment.post.id, chatArea);
                        console.log("kyi mal", user.name, replyContent, user.photo, id, reply.comment.post.id);
                        console.log(`Replying to comment ${id}: ${replyContent}`);
                        replyInputForReply.value = '';
                    } else {
                        alert('Please enter something that you want to reply.');
                    }
                });

                replyElement.appendChild(submitButton);
            }
            if (!cancelButton) {
                cancelButton = document.createElement('button');
                cancelButton.innerHTML = 'Cancel';
                cancelButton.style.marginTop = '10px';
                cancelButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'cancel-reply-btn');
                cancelButton.addEventListener('click', () => {
                    replyElement.removeChild(replyInputForReply);
                    replyElement.removeChild(submitButton);
                    replyElement.removeChild(cancelButton);
                });
                replyElement.appendChild(cancelButton);
            }
            replyInputForReply.focus();
        });
        replyElement.appendChild(replyButton);
        const likeIconWithoutColor = document.createElement('i');
        likeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-up');
        likeIconWithoutColor.style.fontSize = '20px';
        likeIconWithoutColor.addEventListener('click', () => {
            if (iconDiv.contains(dislikeIconWithColor)) {
                iconDiv.removeChild(dislikeIconWithColor);
            }
            iconDiv.appendChild(dislikeIconWithoutColor);
            iconDiv.removeChild(likeIconWithoutColor);
            iconDiv.appendChild(likeIconWithColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` like  your reply!`,
                type: 'LIKE',
            };

            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });

        const likeIconWithColor = document.createElement('i');
        likeIconWithColor.style.fontSize = '20px';
        likeIconWithColor.classList.add('fa-solid', 'fa-thumbs-up');
        likeIconWithColor.addEventListener('click', () => {
            if (iconDiv.contains(dislikeIconWithColor)) {
                iconDiv.removeChild(dislikeIconWithColor);
            }
            iconDiv.appendChild(dislikeIconWithoutColor);
            iconDiv.removeChild(likeIconWithColor);
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` liked  your reply!`,
                type: null,
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });
        const dislikeIconWithoutColor = document.createElement('i');
        dislikeIconWithoutColor.classList.add('fa-regular', 'fa-thumbs-down');
        dislikeIconWithoutColor.style.fontSize = '20px';
        dislikeIconWithoutColor.style.padding = '10px';
        dislikeIconWithoutColor.addEventListener('click', () => {
            iconDiv.removeChild(dislikeIconWithoutColor);
            iconDiv.appendChild(dislikeIconWithColor);
            if (iconDiv.contains(likeIconWithColor)) {
                iconDiv.removeChild(likeIconWithColor);
            }
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` dislike your reply!`,
                type: 'DISLIKE',
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });
        const dislikeIconWithColor = document.createElement('i');
        dislikeIconWithColor.classList.add('fa-solid', 'fa-thumbs-down');
        dislikeIconWithColor.style.fontSize = '20px';
        dislikeIconWithColor.style.padding = '10px';
        dislikeIconWithColor.addEventListener('click', () => {
            iconDiv.removeChild(dislikeIconWithColor);
            iconDiv.appendChild(dislikeIconWithoutColor);
            if (iconDiv.contains(likeIconWithColor)) {
                iconDiv.removeChild(likeIconWithColor);
            }
            iconDiv.appendChild(likeIconWithoutColor);
            const myObj = {
                postId: reply.id,
                commentId: id,
                sender: loginUser,
                content: ` dislike your comment!`,
                type: null,
            }
            stompClient.send('/app/like-replyReact-message', {}, JSON.stringify(myObj));
        });

        const iconDiv = document.createElement('div');
        iconDiv.style.marginLeft = '360px';
        iconDiv.style.marginTop = '-40px';
        const isReact = await replyReactType(id, user.id, reply.id);
        if (isReact !== null && isReact.type === 'DISLIKE') {
            iconDiv.appendChild(dislikeIconWithColor);
        } else {
            iconDiv.appendChild(dislikeIconWithoutColor);
        }

        if (isReact !== null && isReact.type === 'LIKE') {
            iconDiv.appendChild(likeIconWithColor);
        } else {
            iconDiv.appendChild(likeIconWithoutColor);
        }
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');

        const dropDownIcon = document.createElement('i');
        dropDownIcon.classList.add('fa-solid', 'fa-ellipsis-vertical');
        dropDownIcon.style.padding = '15px';
        dropDownIcon.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        });

        if (reply.user.name === user.name) {
            const editIcon = document.createElement('i');
            editIcon.classList.add('fa-regular', 'fa-pen-to-square');
            editIcon.style.padding = '15px';
            editIcon.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
                const currentContent = replyContent.innerHTML;
                const textarea = document.createElement('textarea');
                textarea.style.borderRadius = '10px';
                textarea.style.backgroundColor = 'lightgrey';
                textarea.value = currentContent;
                divEl.replaceChild(textarea, replyContent);
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save';
                saveButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'save-button');
                saveButton.addEventListener('click', async () => {
                    const updatedContent = textarea.value.trim();
                    if (updatedContent !== '') {
                        const replyId = reply.id;
                        await updateContentForReply(replyId, updatedContent);
                        replyContent.innerHTML = updatedContent;
                        divEl.removeChild(textarea);
                        replyElement.removeChild(saveButton);
                    } else {
                        alert('Please enter something for the reply.');
                    }
                });
                replyElement.appendChild(saveButton);
            });
            dropdownMenu.appendChild(editIcon);
            // replyElement.appendChild(dropdownMenu);

            const trashIcon = document.createElement('i');
            trashIcon.classList.add('fa-solid', 'fa-trash');
            trashIcon.style.padding = '15px';
            trashIcon.addEventListener('click', async () => {
                dropdownMenu.style.display = 'none';
                const replyId = replyContent.id;
                console.log("Span Reply id", replyId);
                await deleteReply(replyId);
            });
            dropdownMenu.appendChild(trashIcon);
            replyElement.appendChild(dropdownMenu);
            replyElement.appendChild(dropDownIcon);
        }
        replyElement.appendChild(iconDiv);

        replies.push(replyElement);
    }
    return replies;
};


const replyReactType = async (commentId, userId, replyId) => {
    const fetchTypeForReply = await fetch(`/reply-type-react/${commentId}/${userId}/${replyId}`);
    const response = await fetchTypeForReply.json();
    return response;
}

const commentReactType = async (id, userId, postId) => {
    const fetchType = await fetch(`/comment-type-react/${id}/${userId}/${postId}`);
    const response = await fetchType.json();
    return response;
}

const deleteComment = async (id) => {
    const getData = await fetch(`/delete-comment/${id}`, {
        method: 'DELETE'
    });
    if (!getData.ok) {
        alert('Something wrong while deleting comment');
    }
    const data = await getData.json();
    const postId = data.postId;
    console.log('postId', postId);
    const userItem = document.querySelector(`.user-item-${id}`);
    if (!userItem) {
        console.error(`User item with id ${id} not found`);
        return;
    }
    userItem.remove();
    // await getAllComments(postId);
};

const deleteReply = async (id) => {
    const getData = await fetch(`/delete-reply/${id}`, {
        method: 'DELETE'
    });
    if (!getData.ok) {
        alert('Something wrong while deleting reply');
    }
    const data = await getData.json();
    const postId = data.postId;
    console.log('postId', postId);
    const replyItem = document.querySelector(`.reply-item-${id}`)
    if (!replyItem) {
        console.error(`User item with id ${id} not found`);
        return;
    }
    replyItem.remove();
    // await getAllComments(postId);
};

const updateContentForReply = async (id, content) => {
    const myObj = {
        id: id,
        content: content
    };
    const updatedData = await fetch(`/reply-update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(myObj)
    });
    if (!updatedData.ok) {
        alert("Something wrong while updating reply");
    }
    const data = await updatedData.json();
    const postId = data.postId;
    console.log("Want to know postId", postId);
    const divEl = document.querySelector(`.reply-container-div-${id}`);
    const spElement = document.querySelector(`.span-reply-container-${id}`);
    if(spElement){
        divEl.removeChild(spElement);
    }
    const newSpElement = document.createElement('span');
    newSpElement.id = id;
    newSpElement.classList.add(`span-reply-container-${id}`);
    newSpElement.innerHTML = content;
    divEl.appendChild(newSpElement);
    // await getAllComments(postId);
};

const updateContent = async (id, content) => {
    const myObj = {
        id: id,
        content: content
    };
    const upData = await fetch(`/comment-update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(myObj)
    });
    if (!upData.ok) {
        alert('something went wrong while updating');
    }
    const data = await upData.json();
    const postId = data.postId;
    console.log("Want to know postId", postId)
    const cmtDiv = document.querySelector(`.comment-container-${id}`);
    const spanElement = document.querySelector(`.comment-span-container-${id}`);
    if (spanElement) {
        console.log("shi tal")
        cmtDiv.removeChild(spanElement);
    }
        const newSpanElement = document.createElement('span');
        newSpanElement.id = id;
        newSpanElement.classList.add(`comment-span-container-${id}`);
        newSpanElement.innerHTML = content;
        cmtDiv.appendChild(newSpanElement);
    // await getAllComments(postId);
};

const receivedMessageForComment = async (payload) => {
    console.log('Message Received');
    const message = await JSON.parse(payload.body);
    // const user = await fetchUserDataByPostedUser(loginUser);
    // const postList = await fetchUserPostById(loginUser);
    // console.log("type",typeof postList);
    if (loginUser === message.staffId) {
        notificationCount = notificationCount + 1;
        await showNotiCount();
        console.log(message.photo, message.sender, message.content, message.postId);
        const msg = ' commented to your photo';
        message.photo = message.photo || '/static/assets/img/card.jpg';
        await notifyMessageForReact(msg, message.sender, message.photo, null);
    }
    // await welcome();

    message.photo = message.photo || '/static/assets/img/card.jpg';
    const chatArea = document.querySelector('#commentMessageText');
    await displayMessage(message.sender, message.content, message.photo, message.commentId, message.postId, chatArea);
};


const receivedMessageForCommentReply = async (payload) => {
    console.log('Message Received');
    const message = await JSON.parse(payload.body);
    console.log('staffid', message.staffId);
    if (loginUser === message.staffId) {
        notificationCount = notificationCount + 1;
        await showNotiCount();
        console.log(message.photo, message.sender, message.content, message.postId);
        const msg = ' replied to your comment';
        await notifyMessageForReact(msg, message.sender, message.photo, null);
    }
    // await welcome();
    console.log('Comment ide',message.commentId)
    if(message.commentId != null){
        console.log('haha')
        const reply = await fetchAndDisplayLastReply(message.commentId);
        console.log('wow mal ya pr lr')
        await document.querySelector(`.replies-container-${message.commentId}`).appendChild(reply);
    }
    // const chatArea = document.querySelector('#commentMessageText');
    // await displayMessage(message.sender, message.content, message.photo, message.commentId, message.postId, chatArea);
};

const pressedComment = async (id) => {
    console.log('comment', id);
    await getAllComments(id);
    document.getElementById('sendCommentButton').addEventListener('click', async () => {
        const cmtValue = document.getElementById('commentText').value;
        const myObj = {
            postId: id,
            sender: loginUser,
            content: cmtValue,
            date: new Date(),
        };
        document.getElementById('commentForm').reset();
        // const user = await fetchUserDataByPostedUser(loginUser);
        // console.log("ss",user.name);
        // const chatArea = document.querySelector('#commentMessageText');
        // displayMessage(user.name,cmtValue,user.photo,null,id,chatArea);
        stompClient.send('/app/comment-message', {}, JSON.stringify(myObj));
    });
};

const resetModalContent = () => {
    const sendCommentButton = document.getElementById('sendCommentButton');
    const newSendCommentButton = sendCommentButton.cloneNode(true);
    sendCommentButton.parentNode.replaceChild(newSendCommentButton, sendCommentButton);
    newSendCommentButton.addEventListener('click', () => {
        const cmtValue = document.getElementById('commentText').value;
        const myObj = {
            postId: id,
            sender: loginUser,
            content: cmtValue,
            date: new Date(),
        };
        document.getElementById('commentForm').reset();
        stompClient.send('/app/comment-message', {}, JSON.stringify(myObj));
    });
};

const commentModal = document.getElementById('commentStaticBox');
commentModal.addEventListener('show.bs.modal', () => {
    console.log('Hello ya p hayy');
    resetModalContent();
});

const fetchUserDataByPostedUser = async (id) => {
    const fetchUserData = await fetch(`/get-userData/${id}`);
    if (!fetchUserData.ok) {
        alert('Invalid user');
    }
    const userDataForAll = await fetchUserData.json();
    return userDataForAll;
};

const fetchUserPostById = async (id) => {
    const fetchUserDataForPost = await fetch(`/get-userPostsData/${id}`);
    if (!fetchUserDataForPost.ok) {
        alert('Invalid user');
    }
    const userDataPost = await fetchUserDataForPost.json();
    return userDataPost;
};

const fetchRepliedUserForData = async (id) => {
    const fetchDataForUser = await fetch(`/user/reply-user-data/${id}`);
    const userDataForReply = await fetchDataForUser.json();
    return userDataForReply;
};

let currentPage = '0';
let isFetching = false;
let hasMore = true;

const fetchNotificationPerPage = async () => {
    isFetching = true;
    let response = await fetch(`/user/get-all-noti/${currentPage}`, {
        method: 'GET'
    });
    let root = document.getElementById('root');

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();
    isFetching = false;
    if (data.length === 0) {
        hasMore = false;
        return;
    }
    for (let noti of data) {
        let divElement = document.createElement('div');
        divElement.classList.add('notificationForNoti', `postId-${noti.postId}`);
        divElement.dataset.postId = noti.postId;
        divElement.style.borderRadius = '10px';
        if (noti.reactId && !noti.commentId && !noti.replyId) {
            const reactType = await fetchReactTypeForNotification(noti.reactId);
            console.log('React Type user', reactType.user.staffId)
            const user = await fetchUserDataByPostedUser(reactType.user.staffId);
            const photo = user.photo || '/static/assets/img/card.jpg';
            let imgElement = document.createElement('img');
            imgElement.src = `${photo}`;
            imgElement.width = 40;
            imgElement.height = 40;
            imgElement.style.borderRadius = '50%';
            const pElement = document.createElement('p');
            let imgReactElement = document.createElement('img');
            if (reactType.type) {
                imgReactElement.src = `/static/assets/img/${reactType.type.toLowerCase()}.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + `${noti.content}`;
            } else {
                imgReactElement.src = `/static/assets/img/cancel.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + ` canceled reaction in your post`;
            }
            divElement.appendChild(imgElement);
            divElement.appendChild(imgReactElement);
            divElement.appendChild(pElement);
        }

        if (noti.commentId && !noti.replyId && !noti.reactId) {
            const commentUser = await fetchCommetedUser(noti.commentId);
            console.log('Comment user', commentUser.user.name)
            const photo = commentUser.user.photo || '/static/assets/img/card.jpg';
            let imgElement = document.createElement('img');
            imgElement.src = `${photo}`;
            imgElement.width = 40;
            imgElement.height = 40;
            imgElement.style.borderRadius = '50%';

            const pElement = document.createElement('p');
            pElement.style.display = 'inline-block';
            pElement.style.marginLeft = '10px'; // Adjust margin as needed
            pElement.innerHTML = `${commentUser.user.name} commented to your post`;

            divElement.appendChild(imgElement);
            divElement.appendChild(pElement);
        }

        if (noti.commentId && noti.replyId && !noti.reactId) {
            const replyUser = await fetchRepliedUserForData(noti.replyId);
            console.log('photo', replyUser.user.photo);
            console.log('photo', replyUser.user.staffId);
            const photo = replyUser.user.photo || '/static/assets/img/card.jpg';
            console.log('Reply user', replyUser.user.name);
            let imgElement = document.createElement('img');
            imgElement.src = `${photo}`;
            imgElement.width = 40;
            imgElement.height = 40;
            imgElement.style.borderRadius = '50%';

            const pElement = document.createElement('p');
            pElement.style.display = 'inline-block';
            pElement.style.marginLeft = '10px'; // Adjust margin as needed
            pElement.innerHTML = `${replyUser.user.name} replied to your comment`;

            divElement.appendChild(imgElement);
            divElement.appendChild(pElement);
        }


        if (noti.reactId && noti.commentId && !noti.replyId) {
            const reactType = await fetchReactTypeForNotification(noti.reactId);
            console.log('React Type user', reactType.user.staffId)
            const user = await fetchUserDataByPostedUser(reactType.user.staffId);
            const photo = user.photo || '/static/assets/img/card.jpg';
            let imgElement = document.createElement('img');
            imgElement.src = `${photo}`;
            imgElement.width = 40;
            imgElement.height = 40;
            imgElement.style.borderRadius = '50%';
            const pElement = document.createElement('p');
            let imgReactElement = document.createElement('img');
            if (reactType.type) {
                imgReactElement.src = `/static/assets/img/${reactType.type.toLowerCase()}.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + `${reactType.type}` + ' your comment';
            } else {
                imgReactElement.src = `/static/assets/img/cancel.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + ` canceled reaction in` + ' your comment';
            }
            divElement.appendChild(imgElement);
            divElement.appendChild(imgReactElement);
            divElement.appendChild(pElement);
        }

        if (noti.reactId && !noti.commentId && noti.replyId) {
            const reactType = await fetchReactTypeForNotification(noti.reactId);
            console.log('React Type user', reactType.user.staffId)
            const user = await fetchUserDataByPostedUser(reactType.user.staffId);
            const photo = user.photo || '/static/assets/img/card.jpg';
            let imgElement = document.createElement('img');
            imgElement.src = `${photo}`;
            imgElement.width = 40;
            imgElement.height = 40;
            imgElement.style.borderRadius = '50%';
            const pElement = document.createElement('p');
            let imgReactElement = document.createElement('img');
            if (reactType.type) {
                imgReactElement.src = `/static/assets/img/${reactType.type.toLowerCase()}.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + `${reactType.type}` + ' your reply';
            } else {
                imgReactElement.src = `/static/assets/img/cancel.png`;
                imgReactElement.width = 20;
                imgReactElement.height = 20;

                imgElement.style.display = 'inline-block';
                imgReactElement.style.display = 'inline-block';
                imgReactElement.style.marginBottom = '-20px';
                imgReactElement.style.marginLeft = '-10px';
                pElement.style.display = 'inline-block';
                pElement.innerHTML = `${user.name}` + ` canceled reaction in ` + ' your reply';
            }
            divElement.appendChild(imgElement);
            divElement.appendChild(imgReactElement);
            divElement.appendChild(pElement);
        }


        root.appendChild(divElement);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await fetchNotificationPerPage();
    const modalContent = document.getElementById('content-notification');
    modalContent.addEventListener('scroll', async () => {
        if (isFetching || !hasMore) {
            console.log('currentPage', currentPage);
            return;
        }

        if (modalContent.scrollTop + modalContent.clientHeight >= modalContent.scrollHeight) {
            currentPage++;
            console.log('currentPage', currentPage);
            await fetchNotificationPerPage();
        }
    });

    const notificationElements = document.querySelectorAll('.notificationForNoti');
    notificationElements.forEach(notification => {
        notification.addEventListener('click', async () => {
            const postId = notification.dataset.postId;
            console.log('PostId', postId);
            const postElement = document.getElementById(postId);
            if (postElement) {
                postElement.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        });
    });
});

// const receivedMessageForComment = async (payload) => {
//     console.log('Message Received')
//     const message = await JSON.parse(payload.body);
//     message.photo = message.photo || 'path/to/default/photo'; // add this line
//     const chatArea = document.querySelector('#commentMessageText');
//     displayMessage(message.sender, message.content, message.photo, chatArea);
// };

async function goToSearchPage(){
    window.location.href = '/searcher'
}


async function searchMethodWork(){
    let input = await document.getElementById('searchInput').value
    if(window.location.pathname === '/index'){
        localStorage.setItem('searchInput','')
        window.location.href = '/searcher'
        document.getElementById('searchInput').value = localStorage.getItem('searchInput')
        await createPostsForSearch()
    }
    console.log(input)
    localStorage.setItem('searchInput',document.getElementById('searchInput').value)
    document.getElementById('searchInput').value = localStorage.getItem('searchInput')
    await createPostsForSearch()
}

 
 
async function dateFormatter(startDate){
    let startDay = startDate.getDate()
    let startMonth = startDate.getMonth()+1
    let startYear = startDate.getFullYear()
    let startHours = startDate.getHours()
    let startMinutes = startDate.getMinutes()
    let formattedStartDate = `${startDay}/${startMonth}/${startYear} ${startHours}:${startMinutes}`;
    return new Promise((resolve) => {
        resolve(formattedStartDate);
    });
}

 



async function getEventDetail(id){
    let data = await fetch('/event/getEventById/'+id,{
        method : 'GET'
    })
    let response = await data.json()
    let startDate = new Date(response.start_date)
    let startDay = startDate.getDate()
    let startMonth = startDate.getMonth()+1
    let startYear = startDate.getFullYear()
    let startHours = startDate.getHours()
    let startMinutes = startDate.getMinutes()
    let formattedStartDate = `${startDay} : ${startMonth} : ${startYear} `;
    let endDate = new Date(response.end_date)
    let endDay = endDate.getDate()
    let endMonth = endDate.getMonth()+1
    let endYear = endDate.getFullYear()
    let endHours = endDate.getHours()
    let endMinutes = endDate.getMinutes()
    let formattedEndDate = `${endDay} : ${endMonth} : ${endYear} `
    console.log(response)
    let eventEditModal = document.getElementById('eventEditModal')
    let row = ''
    row += `
    <div> 
    <label for="updateEventId"></label>
    <input type="hidden" value="${response.id}" name="updateEventId" id="updateEventId">
    <label for="updateEventTitle"  >Title</label>
    <input type="text"  class="form-control" value="${response.title}" id="updateEventTitle" name="updateEventTitle">
    <label for="updateEventDescription"  >Description</label>
    <textarea type="text" class="form-control" id="updateEventDescription" name="updateEventDescription">${response.description}</textarea>
    <b class="form-control">${formattedStartDate}</b>
    <label for="updateEventStartDate"  >Start Date</label>
    <input class="form-control" type="date" id="updateEventStartDate" name="updateEventStartDate" value=''>
    <b class="form-control">${formattedEndDate}</b>
    <label for="updateEventEndDate"  >End Date</label>
    <input class="form-control" type="date" id="updateEventEndDate" name="updateEventEndDate" value=''>
    <label for="updateEventLocation"  >Location</label>
    <input class="form-control" type="text" id="updateEventLocation" value="${response.location}">
    <label for="updateEventPhoto"  >Edit Photo</label>
    <input class="form-control" type="file" id="updateEventPhoto" name="updateEventPhoto">
    <img class="from-control" src="${response.photo}" style="width:100px; height;100px;" id="${response.id}-event-edit-url">
    <button  id="restoreBtn" class="btn btn-success hidden" onclick="restoreEventPhoto(${response.id})">Restore</button>
    <button class="btn btn-danger" id="photoRemoveBtn" onclick="deleteEditEventPhoto(${response.id})">Delete</button> 
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    <button type="button" onclick="getEventUpdateData()" data-bs-dismiss="modal" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loadingModalBox" >Update</button>
</div>
    `
    eventEditModal.innerHTML = row
}

async function deleteEditEventPhoto(id){
    document.getElementById(id+'-event-edit-url').src =document.getElementById(id+'-event-edit-url').src+ 'deleted'
    document.getElementById('updateEventPhoto').type = 'hidden'
    document.getElementById('restoreBtn').classList.remove('hidden')
    document.getElementById('photoRemoveBtn').classList.add('hidden')
}

async function deleteEditPollEventPhoto(id){
    document.getElementById(id+'-event-edit-url').src =document.getElementById(id+'-poll-event-edit-url').src+ 'deleted'
    document.getElementById('updatePollEventPhoto').type = 'hidden'
    document.getElementById('restoreBtn').classList.remove('hidden')
    document.getElementById('photoRemoveBtn').classList.add('hidden')
}

async function restoreEventPhoto(id){
    let src = document.getElementById(id+'-event-edit-url').src
    console.log(src)
    let li = src.lastIndexOf('deleted')
    let result = src.substring(0,li)
    console.log(result)
    document.getElementById(id+'-event-edit-url').src = result
    console.log(document.getElementById(id+'-event-edit-url').src)
    document.getElementById('photoRemoveBtn').classList.remove('hidden')
    document.getElementById('restoreBtn').classList.add('hidden')
    document.getElementById('updateEventPhoto').type = 'file'
}

async function restorePollPhoto(id){
    let src = document.getElementById(id+'-poll-event-edit-url').src
    console.log(src)
    let li = src.lastIndexOf('deleted')
    let result = src.substring(0,li)
    console.log(result)
    document.getElementById(id+'-poll-event-edit-url').src = result
    console.log(document.getElementById(id+'-poll-event-edit-url').src)
    document.getElementById('photoRemoveBtn').classList.remove('hidden')
    document.getElementById('restoreBtn').classList.add('hidden')
    document.getElementById('updatePollEventPhoto').type = 'file'
}

async function getEventUpdateData(){
    let eventId = document.getElementById('updateEventId').value
    let eventTitle = document.getElementById('updateEventTitle').value
    let updateEventDescription = document.getElementById('updateEventDescription').value
    let start = document.getElementById('updateEventStartDate').value
    let end = document.getElementById('updateEventEndDate').value
    let location = document.getElementById('updateEventLocation').value
    let oldPhoto = document.getElementById(eventId+'-event-edit-url').src
    let newPhoto = document.getElementById('updateEventPhoto').files
    console.log(eventId)
    console.log(eventTitle)
    console.log(updateEventDescription)
    console.log(start)
    console.log(end)
    console.log(location)
    console.log(oldPhoto)
    console.log(newPhoto)

    let data = await fetch('/event/getEventById/'+eventId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    let startDate = new Date(response.start_date)
    let startDay = String(startDate.getDate()).padStart(2, '0')
    let startMonth = String(startDate.getMonth()+1).padStart(2, '0')
    let startYear = startDate.getFullYear()
    let startHours = startDate.getHours()
    let startMinutes = startDate.getMinutes()
    let formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
    let endDate = new Date(response.end_date)
    let endDay = String(endDate.getDate()).padStart(2, '0')
    let endMonth = String(endDate.getMonth()+1).padStart(2, '0')
    let endYear = endDate.getFullYear()
    let endHours = endDate.getHours()
    let endMinutes = endDate.getMinutes()
    let formattedEndDate = ` ${endYear}-${endMonth}-${endDay}`

    if(newPhoto === ''){
        console.log('new photo is empty')
        newPhoto = null
    }
    if(start === ''){
        console.log('new statt is empty')
        start = 'old'
    }
    if(end === ''){
        console.log('new end is empty')
        end = 'old'
    }

    let updateEvent = {
        eventId : eventId,
        title : eventTitle,
        start_date : start,
        end_date : end,
        description : updateEventDescription,
        location : location,
        photo : oldPhoto,
        newPhoto :newPhoto
    }
    let formData = new FormData()
    formData.append('eventId',eventId)
    formData.append('title',eventTitle)
    formData.append('startDate',start)
    formData.append('endDate',end)
    formData.append('description',updateEventDescription)
    formData.append('location',location)
    formData.append('photo',oldPhoto)
    if(newPhoto !== null){
        formData.append('newPhoto',newPhoto[0])
    }
    if(newPhoto === null){
        formData.append('newPhoto',null)
    }

    console.log(Object.fromEntries(formData.entries()))
    console.log(updateEvent)
    console.log(JSON.stringify(updateEvent))
    let send = await fetch('/event/eventUpdate',{
        method : 'POST',
        body : formData
    })
    let res = await send.json()
    console.log(res)
}

async function deleteEvent(id){
    let data = await fetch('/event/deleteAEvent/'+id,{
        method : 'DELETE'
    })
    let result = data.json()
    console.log(result)
}


async function createAVoteOption(){
    let vote = document.getElementById('voteOptionInput').value
    console.log(vote)
    if(vote !== ''){
        let div = document.createElement('div')
        let btn = document.createElement('button')
        let li = document.createElement('li')
        div.style.display = 'flex'
        btn.classList.add('erase-btn')
        btn.textContent = 'X'
        li.classList.add('voteOption')
        let ul = document.getElementById('ulTag')
        li.textContent = vote
        div.appendChild(li)
        div.appendChild(btn)
        ul.appendChild(div)
        if(li){
            document.getElementById('voteOptionInput').value = ''
            btn.addEventListener('click', function() {
                // Remove the corresponding vote option when the button is clicked
                div.remove();
            });
        }
    }


}
async function createAVoteOptionForUpdate(){
    let vote = document.getElementById('voteOptionInputForUpdate').value
    console.log(vote)
    if(vote !== ''){
        let div = document.createElement('div')
        let btn = document.createElement('button')
        let li = document.createElement('li')
        div.style.display = 'flex'
        btn.classList.add('erase-btn')
        btn.textContent = 'X'
        li.classList.add('voteOptionForUpdate')
        let ul = document.getElementById('ulTagForUpdate')
        li.textContent = vote
        div.appendChild(li)
        div.appendChild(btn)
        ul.appendChild(div)
        if(li){
            document.getElementById('voteOptionInputForUpdate').value = ''
            btn.addEventListener('click', function() {
                // Remove the corresponding vote option when the button is clicked
                div.remove();
            });
        }
    }


}

async function createAPollPost(){
    if(validationFails()){
        alert('start date , end date , vote option of two and title is at least require')
    }else{
        let arr = []
        let values = document.querySelectorAll('.voteOption')
        values.forEach(v=>{
            arr.push(v.textContent.trim())
        })
        let data = new FormData(document.getElementById('pollForm'))
        let obj = Object.fromEntries(data.entries())
        console.log(obj)
        console.log(arr)
        data.append('opts',arr)
        data.append('multipartFile',document.getElementById('pollMultipartFile').files[0])
        console.log(data)
        let datas = await fetch('/event/createAVotePost',{
            method : 'POST',
            body : data
        })
        let response = await datas.json()
        console.log(response)
    }
}

// Add an event listener to the modal
 
 



// Function to check if validation fails
function validationFails() {
    // Add your validation logic here
    let start_date = document.getElementById('poll_start_date').value;
    let end_date = document.getElementById('poll_end_date').value;
    let title = document.getElementById('pollTitle').value;
    let arr = [];
    let values = document.querySelectorAll('.voteOption');
    values.forEach(v=>{
        arr.push(v.textContent.trim());
    });

    return (start_date === '' || end_date === '' || title === '' || arr.length < 2 ||start_date>end_date);
}

async function timeAgo(createdDate) {
    const now = new Date();
    const diff = now - createdDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return `just now`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1? '' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1? '' : ''} ago`;
    } else {
      return `${days} day${days > 1? '' : ''} ago`;
    }
  }

async function getAllPollPost(){
    isFetchingForPoll = true
    let polls = document.getElementById('polls');
    let pollTab = document.getElementById('polls')

    let data = await fetch(`/event/getPollsForNewsfeed/${currentPageForPoll}`,{
        method : 'GET'
    })
    let response = await data.json()
    isFetchingForPoll = false
    if(response.length===0){
        hasMoreForPoll = false
        displayNoPostMessage()
    }else{
    console.log(response)
    let rows = ''
    for (let r of response) {
        let expired = ''
        if(new Date()>new Date(r.end_date)){
            expired=`
            
<div class="alert alert-danger d-flex align-items-center" style=" width:265px; position: absolute; top: 55px; left:120px;  z-index: 1;" role="alert">
<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
<div>
<i class="fa-solid fa-triangle-exclamation"></i>
POLL IS EXPIRED
</div>
</div>
            
            `
        }
        let hidden = await checkVoted(r.id) === false ? '' : 'hidden'
        let notHidden = await checkVoted(r.id) === false ? 'hidden' : ''
        let row = ''
        let created = new Date(r.created_date)
        let now = new Date()
        let createdTime = await timeAgo(new Date(r.created_date))
        
        row += `
        <div class="post" id="pollPostDiv-${r.id}">
        <div class="post-top">
            <div class="dp">
                <img src="${r.user.photo}" alt="">
            </div>
            <div class="post-info">
                <p class="name">${r.user.name}</p>
                <span class="time">${createdTime}</span>
            </div>
                        <div class="dropdown offset-8">
      <a class=" dropdown-toggle" onclick="getPollEventDetail(${r.id})" href="#"   id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-ellipsis-h "></i>
            </a>
    
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
        <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#pollEventEditModalBox">Edit</a></li>
        <li><a class="dropdown-item" onclick="deleteEvent(${r.id})">Delete Post</a></li> 
      </ul>
    </div>
        </div> 
        <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button class="nav-link active" id="nav-about-tab-${r.id}" data-bs-toggle="tab" data-bs-target="#nav-about-${r.id}" type="button" role="tab" aria-controls="nav-about-${r.id}" aria-selected="true"> <i class="fa-solid fa-info"></i>  About</button>
          <button class="nav-link" id="nav-vote-tab-${r.id}" data-bs-toggle="tab" data-bs-target="#nav-vote-${r.id}" type="button" role="tab" aria-controls="nav-vote-${r.id}" aria-selected="false"> <i class="fa-solid fa-check-to-slot"></i> Vote</button> 
        </div>
      </nav>
        <div class=" post-content" data-bs-toggle="modal"  > 


        <div class="card mb-3" style="max-width: 540px;">
        <div class="row g-0">
          <div class="col-md-4">
            ${expired}
            <img src="${r.photo}" style="max-width:170px; postion:relative;" class="img-fluid rounded-start" alt="...">
          </div>
          <div class="col-md-8">
            <div class="card-body" style="max-height: 200px; overflow-y: auto;">
            <div class="tab-content" id="nav-tabContent">
  <div class="tab-pane fade show active" id="nav-about-${r.id}" role="tabpanel" aria-labelledby="nav-about-tab-${r.id}">
  
  <h5 class="card-title align-middle font-monospace">${r.title}</h5>
  <p class="card-text font-monospace">${r.description}</p>
  
  </div>
  <div class="tab-pane fade" id="nav-vote-${r.id}" role="tabpanel" aria-labelledby="nav-vote-tab-${r.id}"> 

            
            `
        let totalVotes = 0;
        for (let v of r.voteOptions) {
            let count = await getCount(v.id);
            totalVotes += count;
        }
        for (let v of r.voteOptions) {
            let count = await getCount(v.id);
            let percentage = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
            row += `
        <div class="vote-option d-flex mt-1">
        <div class="d-block">
        <div class="font-monospace ">${v.type}</div>
                <div class="d-flex">
                <div class="progress" style="height: 16px; width: 170px;">
                
                    <div class="progress-bar bg-primary" id="${v.id}-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">${Math.floor(percentage)}%</div>
                </div>`
                if(new Date()<new Date(r.end_date)){
            row += ` <button id="vote-btn-${r.id}" class="${hidden} give-btn" onclick="voteVoteOption(${v.id},${r.id})"><i class="fa-solid fa-hand" style="width:7px; margin-right:11px;"></i></button> `;
                }
            let yes = await checkVotedMark(v.id)
            let markIcon = 'hidden'
            if(yes === true){
                markIcon = ''
            }
            console.log(yes)


            row += `<div id="mark-id-${v.id}" class="${markIcon}"><i class="fa-regular fa-circle-check"></i></div>
                </div>
                </div>
                 `



            row+=`</div>`

        }
        if(new Date()<new Date(r.end_date)){
        row += `   <button id="unvote-btn-${r.id}" class="${notHidden} erase-btn" onclick = "unVote(${r.id})"><i class="fa-solid fa-eraser"></i></button> `
        }
        row+=`</div> 
    </div>
          </div>
    </div>
  </div>
</div>
         
        <div class="post-bottom">
            <div class="action" style="height: 50px">
    <div class="button_wrapper">
          <div class="all_likes_wrapper">
              <div data-title="LIKE">
                  <img src="/static/assets/img/like.png" alt="Like" />
              </div>
              <div data-title="LOVE">
                  <img src="/static/assets/img/love.png" alt="Love" />
              </div>
              <div data-title="CARE">
                  <img src="/static/assets/img/care.png" alt="Care" />
              </div>
              <div data-title="HAHA">
                  <img src="/static/assets/img/haha.png" alt="Haha" />
              </div>
              <div data-title="WOW">
                  <img src="/static/assets/img/wow.png" alt="Wow" />
              </div>
              <div data-title="SAD">
                  <img src="/static/assets/img/sad.png" alt="Sad" />
              </div>
              <div data-title="ANGRY">
                  <img src="/static/assets/img/angry.png" alt="Angry" />
              </div>
          </div>
          <button class="like_button" id=" "> 
          </button>
      </div>
            </div>
            <div class="action">
                <i class="fa-regular fa-comment"></i>
                <span onclick="pressedComment()"  data-bs-toggle="modal" data-bs-target="#commentStaticBox">Comment  </span>
            </div>
            <div class="action">
                <i class="fa fa-share"></i>
                <span>Share</span>
            </div>
        </div>
    </div>
    </div>
        `
        rows+=row



    }
    let range = document.createRange();
    let fragment = range.createContextualFragment(rows);
    while (polls.children.length > 0) {
        polls.children[0].remove();
    }
    pollTab.appendChild(fragment)
    if(fragment){
        for(let r of response){
            await updateVotePercentage(r.voteOptions)
        }
    }
}

}


async function checkVotedMark(voteOptionId){
    let data = await fetch('/event/checkVotedMark/'+voteOptionId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    return response
}

async function updateVotePercentage(vo){
    let totalVotes = 0;
    for (let v of vo) {
        let count = await getCount(v.id);
        totalVotes += count;
    }
    for(let v of vo){
        let bar = document.getElementById(v.id+'-bar')
        let count = await getCount(v.id)
        let percentage = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
        bar.style.transition = 'width 1s ease-in-out';
        bar.style.width = percentage + '%';
        document.getElementById(v.id+'-bar').textContent = Math.floor(percentage)+"%"
        if(await checkVotedMark(v.id) === true){
            document.getElementById('mark-id-'+v.id).classList.remove('hidden')
        }else{
            document.getElementById('mark-id-'+v.id).classList.add('hidden')
        }
    }
}

async function voteVoteOption(voteOptionId,eventId){
    console.log(voteOptionId,eventId)
    let data = await fetch('/event/giveVote/'+voteOptionId+'/'+eventId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    if(response){
        let data = await fetch('/event/getAllPollPost',{
            method : 'GET'
        })
        let response = await data.json()
        response.forEach(r=>{
            updateVotePercentage(r.voteOptions)
            document.querySelectorAll('#vote-btn-'+eventId).forEach(element => {
                element.classList.add('hidden');
            })
            document.querySelectorAll('#unvote-btn-'+eventId).forEach(element => {
                element.classList.remove('hidden');
            })
        })
    }
}

async function getCount(voteOptionId){
    let data = await fetch('/event/getCount/'+voteOptionId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    return response
}

async function checkVoted(eventId){
    let data = await fetch('/event/checkVoted/'+eventId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    return response
}

async function unVote(eventId){
    let data = await fetch('/event/deleteAPoll/'+eventId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    if(response){
        let data = await fetch('/event/getAllPollPost',{
            method : 'GET'
        })
        let response = await data.json()
        response.forEach(r=>{
            updateVotePercentage(r.voteOptions)
            document.querySelectorAll('#vote-btn-'+eventId).forEach(element => {
                element.classList.add('hidden');
            })
            document.querySelectorAll('#vote-btn-'+eventId).forEach(element => {
                element.classList.remove('hidden');
            })
            document.querySelectorAll('#unvote-btn-'+eventId).forEach(element => {
                element.classList.add('hidden');
            })
        })
    }
}


async function getPollEventDetail(id){
    let data = await fetch('/event/getEventById/'+id,{
        method : 'GET'
    })
    let response = await data.json()
    let startDate = new Date(response.start_date)
    let startDay = startDate.getDate()
    let startMonth = startDate.getMonth()+1
    let startYear = startDate.getFullYear()
    let startHours = startDate.getHours()
    let startMinutes = startDate.getMinutes()
    let formattedStartDate = `${startDay} : ${startMonth} : ${startYear} `;
    let endDate = new Date(response.end_date)
    let endDay = endDate.getDate()
    let endMonth = endDate.getMonth()+1
    let endYear = endDate.getFullYear()
    let endHours = endDate.getHours()
    let endMinutes = endDate.getMinutes()
    let formattedEndDate = `${endDay} : ${endMonth} : ${endYear} `
    console.log(response)
    let eventEditModal = document.getElementById('pollEventEditModal')
    let row = ''
    row += `
    <div> 
    <label for="updateEventId"></label>
    <input type="hidden" value="${response.id}" name="updateEventId" id="updatePollEventId">
    <label for="updateEventTitle"  >Title</label>
    <input type="text"  class="form-control" value="${response.title}" id="updatePollEventTitle" name="updateEventTitle">
    <label for="updateEventDescription"  >Description</label>
    <textarea type="text" class="form-control" id="updatePollEventDescription" name="updateEventDescription">${response.description}</textarea>
    <b class="form-control">${formattedStartDate}</b>
    <label for="updateEventStartDate"  >Start Date</label>
    <input class="form-control" type="date" id="updatePollEventStartDate" name="updateEventStartDate" value=''>
    <b class="form-control">${formattedEndDate}</b>
    <label for="updateEventEndDate"  >End Date</label>
    <input class="form-control" type="date" id="updatePollEventEndDate" name="updateEventEndDate" value=''>
    <label for="options">Add vote options </label>
    <div class="d-flex"><input type="text" name="voteOptionInputForUpdate" id="voteOptionInputForUpdate" class="form-control"><button type="button" class="btn btn-parimary " onclick="createAVoteOptionForUpdate()"><i class="fa-solid fa-plus text-white"></i></button></div>
    <div>
        <ul id="ulTagForUpdate">
            
        </ul>
    </div>
    <div>
    <div class="form-check">
     `

    response.voteOptions.forEach(r=>{
        row += `
        <label class="form-check-label">
          <input type="checkbox" class="form-check-input" id="votodelete"   value="${r.id}" checked>
          ${r.type}
        </label> `
    })
    row +=
        `      </div>
    </div>
    <label for="updateEventPhoto"  >Edit Photo</label>
    <input class="form-control" type="file" id="updatePollEventPhoto" name="updateEventPhoto">
    <img class="from-control" src="${response.photo}" style="width:100px; height;100px;" id="${response.id}-poll-event-edit-url">
    <button  id="restoreBtn" class="btn btn-success hidden" onclick="restorePollPhoto(${response.id})">Restore</button>
    <button class="btn btn-danger" id="photoRemoveBtn" onclick="deleteEditPollEventPhoto(${response.id})">Delete</button> 
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    <button type="button" onclick="getPollEventUpdateData()" data-bs-dismiss="modal" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loadingModalBox" >Update</button>
</div>
    `
    eventEditModal.innerHTML = row
}

async function getPollEventUpdateData(){
    let eventId = document.getElementById('updatePollEventId').value
    let eventTitle = document.getElementById('updatePollEventTitle').value
    let updateEventDescription = document.getElementById('updatePollEventDescription').value
    let start = document.getElementById('updatePollEventStartDate').value
    let end = document.getElementById('updatePollEventEndDate').value
    let oldPhoto = document.getElementById(eventId+'-poll-event-edit-url').src
    let newPhoto = document.getElementById('updatePollEventPhoto').files
    let votes = []
    let cb = document.querySelectorAll('#votodelete')
    cb.forEach(c=>{
        if(c.checked){
            votes.push(c.value)
        }
    })
    let arr = []
    let values = document.querySelectorAll('.voteOptionForUpdate')
    values.forEach(v=>{
        arr.push(v.textContent.trim())
    })
    console.log(arr)
    console.log(votes)
    console.log(eventId)
    console.log(eventTitle)
    console.log(updateEventDescription)
    console.log(start)
    console.log(end)
    console.log(location)
    console.log(oldPhoto)
    console.log(newPhoto)

    let data = await fetch('/event/getEventById/'+eventId,{
        method : 'GET'
    })
    let response = await data.json()
    console.log(response)
    let startDate = new Date(response.start_date)
    let startDay = String(startDate.getDate()).padStart(2, '0')
    let startMonth = String(startDate.getMonth()+1).padStart(2, '0')
    let startYear = startDate.getFullYear()
    let startHours = startDate.getHours()
    let startMinutes = startDate.getMinutes()
    let formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
    let endDate = new Date(response.end_date)
    let endDay = String(endDate.getDate()).padStart(2, '0')
    let endMonth = String(endDate.getMonth()+1).padStart(2, '0')
    let endYear = endDate.getFullYear()
    let endHours = endDate.getHours()
    let endMinutes = endDate.getMinutes()
    let formattedEndDate = ` ${endYear}-${endMonth}-${endDay}`

    if(newPhoto === ''){
        console.log('new photo is empty')
        newPhoto = null
    }
    if(start === ''){
        console.log('new statt is empty')
        start = 'old'
    }
    if(end === ''){
        console.log('new end is empty')
        end = 'old'
    }

    let updateEvent = {
        eventId : eventId,
        title : eventTitle,
        start_date : start,
        end_date : end,
        description : updateEventDescription,
        location : location,
        photo : oldPhoto,
        newPhoto :newPhoto
    }
    let formData = new FormData()
    formData.append('eventId',eventId)
    formData.append('title',eventTitle)
    formData.append('startDate',start)
    formData.append('endDate',end)
    formData.append('description',updateEventDescription)
    formData.append('location',location)
    formData.append('photo',oldPhoto)
    formData.append('oldOpts',votes)
    formData.append('newOpts',arr)
    if(newPhoto !== null){
        formData.append('newPhoto',newPhoto[0])
    }
    if(newPhoto === null){
        formData.append('newPhoto',null)
    }

    console.log(Object.fromEntries(formData.entries()))
    console.log(updateEvent)
    console.log(JSON.stringify(updateEvent))
    let send = await fetch('/event/pollEventUpdate',{
        method : 'POST',
        body : formData
    })
    let res = await send.json()
    console.log(res)
}

async function checkPostOwnerOrAdmin(id){
    let data = await fetch(`/post/checkPostOwnerOrAdmin/${id}`)
    let response = await data.json()
    console.log(response[0])
    return response[0]
}


async function getPosts(){
    isFetchingForPost = true
    let communityId = localStorage.getItem('communityIdForDetailPage')
    let data = await fetch(`/api/community/getPostsForCommunityDetailPage/${communityId}`)
    let response = await data.json()
    isFetchingForPost = false
    console.log(response)
    console.log('Size',response.length)
        let posts = ''
        if (response.length === 0) {
            hasMoreForPost = false;
            displayNoPostMessage();
        }
            // localStorage.setItem('currentPage', response);
            for (const p of response) {
                let createdTime = await timeAgo(new Date(p.created_date))
                const reactCount = await fetchSizes(p.id);
                const reactType = await fetchReactType(p.id);
                let likeButtonContent = '';
                if (reactType === "LIKE") {
                    likeButtonContent = `<div class="button_icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#2D86FE" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
    </div>
            <span  style="color: #2D86FE;">LIKE</span>`
                    ;
                } else if (reactType === "LOVE") {
                    likeButtonContent = `<img src="/static/assets/img/love.png" alt="Love" style="width: 20px; height: 20px"/>   
               <span>LOVE</span>`;
                } else if (reactType === "CARE") {
                    likeButtonContent = `<img src="/static/assets/img/care.png" alt="Care" style="width: 20px; height: 20px" /> 
                      <span>CARE</span>`;
                } else if (reactType === "ANGRY") {
                    likeButtonContent = `<img src="/static/assets/img/angry.png" alt="Angry" style="width: 20px; height: 20px" />
                     <span>ANGRY</span>`;
                } else if (reactType === "HAHA") {
                    likeButtonContent = `<img src="/static/assets/img/haha.png" alt="Haha" style="width: 20px; height: 20px" />
                  <span>HAHA</span>`;
                } else if (reactType === "SAD") {
                    likeButtonContent = `<img src="/static/assets/img/sad.png" alt="Sad" style="width: 20px; height: 20px" /> 
        <span>SAD</span>`;
                } else if (reactType === "WOW") {
                    likeButtonContent = `<img src="/static/assets/img/wow.png" alt="Wow" style="width: 20px; height: 20px" /> 
                    <span>WOW</span>`;
                } else {
                    likeButtonContent = `<div class="button_icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" style="width: 20px" />
                </svg>
            </div>
            <span>Like</span>`
                }

                const commentCountSize = await fetchCommentSizes(p.id);
                let post = '';
                post += `

      <div class="post">
      <div class="post-top">
          <div class="dp">
              <img src="${p.user.photo}" alt="">
          </div>
          <div class="post-info">
              <p class="name">${p.user.name}</p>
              <span class="time">${createdTime}</span>
          </div>`
          let user = await checkPostOwnerOrAdmin(p.id)
          if(user === 'ADMIN' || user === 'OWNER'){
            post += `<div class="dropdown offset-8">
            <a class=" dropdown-toggle" onclick="getPostDetail(${p.id})" href="#"   id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-ellipsis-h "></i>
                  </a>
          
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">`

            if(user=== 'OWNER'){
                post+= `<li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModalBox">Edit</a></li>`
            }
              
               post +=`<li><a class="dropdown-item" onclick="deletePost(${p.id})">Delete Post</a></li> 
            </ul>
          </div>`
          }
                     
      post+=`</div>
<div class="post-content-${p.id}" data-bs-toggle="modal" data-bs-target="#newsfeedPost${p.id}" >
      ${p.description.replace(/\n/g, '<br>')}
      `
                let oneTag = null
                let oneCloseTag = null
                let twoTag = null
                let twoCloseTag = null
                let threeTag = null
                let threeCloseTag = null
                let fourTag = null
                let fourCloseTag = null
                let fiveTag = null
                let fiveCloseTag = null
                let oneControlAttr = null
                let twoControlAttr = null
                let threeControlAttr = null
                let fourControlAttr = null
                let fiveControlAttr = null
                let one = null
                let two = null
                let three = null
                let four = null
                let five = null
                let six = null

                if(p.resources.length === 1){
                    p.resources.forEach((r, index) => {
                        if(index === 0 && r.photo !== null){
                            console.log('two')
                            one = r.photo
                            oneTag = 'img'
                            oneCloseTag = ''
                            oneControlAttr = ''
                        }else if(index === 0 && r.video !== null){
                            one = r.video
                            oneTag = 'video'
                            oneCloseTag = '</video>'
                            oneControlAttr = 'controls'
                        }
                        if (one !== null  ) {
                            post+= `
  <div class="d-flex" > 
  <${oneTag} ${oneControlAttr} src="${one}" class="img-fluid " style="width:500px; border-radius : 5px; height:500px;  " alt="">${oneCloseTag}
  </div>
  `
                        }
                    })
                }
                if(p.resources.length === 2){
                    p.resources.forEach((r, index) => {
                        if(index === 0 && r.photo !== null){
                            console.log('two')
                            one = r.photo
                            oneTag = 'img'
                            oneCloseTag = ''
                            oneControlAttr = ''
                        }else if(index === 0 && r.video !== null){
                            one = r.video
                            oneTag = 'video'
                            oneCloseTag = '</video>'
                            oneControlAttr = 'controls'
                        }
                        if(index === 1 && r.photo !== null){
                            two = r.photo
                            twoTag = 'img'
                            twoCloseTag = ''
                            twoControlAttr = ''
                        }else if(index === 1 && r.video !== null){
                            two = r.video
                            twoTag = 'video'
                            twoCloseTag = '</video>'
                            twoControlAttr = 'controls'
                        }
                        if (one !== null && two !== null  ) {
                            post+= `
  <div class="d-flex" > 
  <${oneTag} ${oneControlAttr} src="${one}" class="img-fluid " style="width:250px; border-radius : 5px; height:400px; margin:2px" alt="">${oneCloseTag}
  <${twoTag} ${twoControlAttr} src="${two}" class="img-fluid " style="width:250px; border-radius : 5px; height:400px; margin:2px" alt="">${twoCloseTag} 
  </div> `
                        }
                    })
                }
                if(p.resources.length === 3){
                    p.resources.forEach((r, index) => {
                        if(index === 0 && r.photo !== null){
                            console.log('two')
                            one = r.photo
                            oneTag = 'img'
                            oneCloseTag = ''
                            oneControlAttr = ''
                        }else if(index === 0 && r.video !== null){
                            one = r.video
                            oneTag = 'video'
                            oneCloseTag = '</video>'
                            oneControlAttr = 'controls'
                        }
                        if(index === 1 && r.photo !== null){
                            two = r.photo
                            twoTag = 'img'
                            twoCloseTag = ''
                            twoControlAttr = ''
                        }else if(index === 1 && r.video !== null){
                            two = r.video
                            twoTag = 'video'
                            twoCloseTag = '</video>'
                            twoControlAttr = 'controls'
                        }
                        if(index === 2 && r.photo !== null){
                            three = r.photo
                            threeTag = 'img'
                            threeCloseTag = ''
                            threeControlAttr = ''
                        }else if(index === 2 && r.video !== null){
                            three = r.video
                            threeTag = 'video'
                            threeCloseTag = '</video>'
                            threeControlAttr = 'controls'
                        }
                        if (one !== null && two !== null && three !== null  ) {
                            post+= `
  <div class="d-flex" > 
  <${oneTag} ${oneControlAttr} src="${one}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${oneCloseTag}
  <${twoTag} ${twoControlAttr} src="${two}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${twoCloseTag} 
  </div>
  <div class="d-flex"> 
  <${threeTag} ${threeControlAttr} src="${three}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin-left:127px" alt="">${threeCloseTag} 
  </div>`
                        }
                    })
                }
                if(p.resources.length === 4){
                    p.resources.forEach((r, index) => {
                        console.log(r)

                        if(index === 0 && r.photo !== null){
                            console.log('two')
                            one = r.photo
                            oneTag = 'img'
                            oneCloseTag = ''
                            oneControlAttr = ''
                        }else if(index === 0 && r.video !== null){
                            one = r.video
                            oneTag = 'video'
                            oneCloseTag = '</video>'
                            oneControlAttr = 'controls'
                        }
                        if(index === 1 && r.photo !== null){
                            two = r.photo
                            twoTag = 'img'
                            twoCloseTag = ''
                            twoControlAttr = ''
                        }else if(index === 1 && r.video !== null){
                            two = r.video
                            twoTag = 'video'
                            twoCloseTag = '</video>'
                            twoControlAttr = 'controls'
                        }
                        if(index === 2 && r.photo !== null){
                            three = r.photo
                            threeTag = 'img'
                            threeCloseTag = ''
                            threeControlAttr = ''
                        }else if(index === 2 && r.video !== null){
                            three = r.video
                            threeTag = 'video'
                            threeCloseTag = '</video>'
                            threeControlAttr = 'controls'
                        }
                        if(index === 3 && r.photo !== null){
                            four = r.photo
                            fourTag = 'img'
                            fourCloseTag = ''
                            fourControlAttr = ''
                        }else if(index === 3 && r.video !== null){
                            four = r.video
                            fourTag = 'video'
                            fourCloseTag = '</video>'
                            fourControlAttr = 'controls'
                        }


                        if (one !== null && two !== null && three !== null && four !== null) {
                            post+= `
      <div class="d-flex" > 
      <${oneTag} ${oneControlAttr} src="${one}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${oneCloseTag}
      <${twoTag} ${twoControlAttr} src="${two}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${twoCloseTag} 
      </div>
      <div class="d-flex"> 
      <${threeTag} ${threeControlAttr} src="${three}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${threeCloseTag}
      <${fourTag} ${fourControlAttr} src="${four}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px;  opacity: 20%" alt="">${fourCloseTag}
      </div>`
                        }
                    })

                }

                if(p.resources.length > 4 ){
                    let text = p.resources.length -4
                    console.log(text)
                    p.resources.forEach((r, index) => {
                        if(index === 0 && r.photo !== null){
                            console.log('two')
                            one = r.photo
                            oneTag = 'img'
                            oneCloseTag = ''
                            oneControlAttr = ''
                        }else if(index === 0 && r.video !== null){
                            one = r.video
                            oneTag = 'video'
                            oneCloseTag = '</video>'
                            oneControlAttr = 'controls'
                        }
                        if(index === 1 && r.photo !== null){
                            two = r.photo
                            twoTag = 'img'
                            twoCloseTag = ''
                            twoControlAttr = ''
                        }else if(index === 1 && r.video !== null){
                            two = r.video
                            twoTag = 'video'
                            twoCloseTag = '</video>'
                            twoControlAttr = 'controls'
                        }
                        if(index === 2 && r.photo !== null){
                            three = r.photo
                            threeTag = 'img'
                            threeCloseTag = ''
                            threeControlAttr = ''
                        }else if(index === 2 && r.video !== null){
                            three = r.video
                            threeTag = 'video'
                            threeCloseTag = '</video>'
                            threeControlAttr = 'controls'
                        }
                        if(index === 3 && r.photo !== null){
                            four = r.photo
                            fourTag = 'img'
                            fourCloseTag = ''
                            fourControlAttr = ''
                        }else if(index === 3 && r.video !== null){
                            four = r.video
                            fourTag = 'video'
                            fourCloseTag = '</video>'
                            fourControlAttr = 'controls'
                        }
                        if(index === 4 && r.photo !== null){
                            five = r.photo
                            fiveTag = 'img'
                            fiveCloseTag = ''
                            fiveControlAttr = ''
                        }else if(index === 4 && r.video !== null){
                            five = r.video
                            fiveTag = 'video'
                            fiveCloseTag = '</video>'
                            fiveControlAttr = 'controls'
                        }

                        if(index === 5 ){
                            six = 'hello'
                        }

                        if (one !== null && two !== null && three !== null && four !== null && five !== null && six === null) {

                            post+= `
      <div class="d-flex" > 
      <${oneTag} ${oneControlAttr} src="${one}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${oneCloseTag}
      <${twoTag} ${twoControlAttr} src="${two}" class="img-fluid " style="width:250px; border-radius : 5px; height:200px; margin:2px" alt="">${twoCloseTag} 
      </div>
      <div class="d-flex"> 
      <${threeTag} ${threeControlAttr} src="${three}" class="img-fluid " style="width:166px; border-radius : 5px; height:200px; margin:2px" alt="">${threeCloseTag}
      <${fourTag} ${fourControlAttr} src="${four}" class="img-fluid " style="width:166px; border-radius : 5px; height:200px; margin:2px" alt="">${fourCloseTag}
      <div style="position: relative; display: inline-block;">
      <${fiveTag} ${fiveControlAttr} src="${five}" class="img-fluid" style="width:166px; border-radius : 5px; height:200px; margin:2px" alt="">${fiveCloseTag}
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 25px;">+${text}</div>
      </div>
      </div>`
                        }

                    })

                }
                post += `
      </div>
      <div class="post-bottom">
          <div class="action" style="height: 50px">
<div class="button_wrapper">
        <div class="all_likes_wrapper">
            <div data-title="LIKE">
                <img src="/static/assets/img/like.png" alt="Like" />
            </div>
            <div data-title="LOVE">
                <img src="/static/assets/img/love.png" alt="Love" />
            </div>
            <div data-title="CARE">
                <img src="/static/assets/img/care.png" alt="Care" />
            </div>
            <div data-title="HAHA">
                <img src="/static/assets/img/haha.png" alt="Haha" />
            </div>
            <div data-title="WOW">
                <img src="/static/assets/img/wow.png" alt="Wow" />
            </div>
            <div data-title="SAD">
                <img src="/static/assets/img/sad.png" alt="Sad" />
            </div>
            <div data-title="ANGRY">
                <img src="/static/assets/img/angry.png" alt="Angry" />
            </div>
        </div>
        <button class="like_button" id="${p.id}">
          ${likeButtonContent + reactCount.length}
        </button>
    </div>
          </div>
          <div class="action">
              <i class="fa-regular fa-comment"></i>
              <span onclick="pressedComment('${p.id}')"  data-bs-toggle="modal" data-bs-target="#commentStaticBox">Comment ${commentCountSize}</span>
          </div>
          <div class="action">
              <i class="fa fa-share"></i>
              <span>Share</span>
          </div>
      </div>
  </div> 

<div class="modal fade" id="newsfeedPost${p.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg"  >
    <div class="modal-content" style=" background-color:transparent;  overflow-y: hidden;"> 
      <div class="modal-body p-0">
        <div id="carouselExampleControlsPostSearch${p.id}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">`

                p.resources.forEach((r, index) => {
                    let active = index == 0 ? 'active' : ''
                    if (r.photo === null && r.video !== null) {
                        post += ` <div   class="carousel-item ${active}" style="object-fit: cover; width:100%; height : 600px;" > 
              <video controls  src="${r.video}" class="d-block  carousel-image " style=" width:100%; height : 100%;"alt="..."></video>
              <div class="carousel-caption d-none d-md-block"> 
              <p>${r.description.replace(/\n/g, '<br>')}</p>
            </div>
              </div> `
                    } else if (r.video === null && r.photo !== null) {
                        post += `<div    class="carousel-item ${active}" style="object-fit: cover; width:100%; height : 600px;"> 
              <img src="${r.photo}"   class="d-block  carousel-image " style=" width:100%; height : 100%;" alt="...">
              <div class="carousel-caption d-none d-md-block"> 
              <p>${r.description.replace(/\n/g, '<br>')}</p>
            </div>
            </div>`
                    } else {
                        post += `<div    class="carousel-item ${active}" style="object-fit: cover; width:100%; height : 600px;"> 
              <video controls src="${r.video}" class="d-block  carousel-image " style=" width:100%; height : 100%;" alt="..."></video>
              <div class="carousel-caption d-none d-md-block"> 
              <p>${r.description.replace(/\n/g, '<br>')}</p>
            </div>
            </div>`
                        post += `<div    class="carousel-item ${active}" style="object-fit: cover; width:100%; height : 600px;"> 
            <img src="${r.photo}"class="d-block  carousel-image " style=" width:100%; height : 100%;"alt="...">
            <div class="carousel-caption d-none d-md-block"> 
            <p>${r.description.replace(/\n/g, '<br>')}</p>
          </div>
          </div>
           `
                    }
                })
                post+=`
             
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControlsPostSearch${p.id}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControlsPostSearch${p.id}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div> 
    </div>
  </div>
  </div>
  </div>`;

                posts += post;
            }
            let range = document.createRange();
            let fragment = range.createContextualFragment(posts);
            newsfeed.appendChild(fragment);
   // }

    const likeButtons = document.querySelectorAll(".like_button");
    likeButtons.forEach(likeButton => {
        likeButton.addEventListener('click', async (event) => {
            const postId = likeButton.id;
            const currentReactType = await fetchReactType(postId);
            console.log('sdd', currentReactType);
            if ((currentReactType !== "OTHER") || (currentReactType === null)) {
                await removeReaction(postId);
                likeButton.innerHTML = `<div class="button_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                    </svg>
                </div>
                <span>Like</span>`;
            } else {
                await pressedLike(postId, "LIKE");
                likeButton.innerHTML = `<div class="button_icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" style="width: 20px" />
                </svg>
            </div>
            <span>Like</span>`
                likeButton.classList.toggle('active');

                if (likeButton.classList.contains('active')) {
                    likeButton.style.color = "#2D86FE";
                } else {
                    likeButton.classList.remove('active');
                    likeButton.style.color = "unset";
                }
            }
        });

        likeButton.addEventListener('mouseover', () => {
            likeButton.parentNode.querySelector(".all_likes_wrapper").classList.add('active');
        });

        likeButton.addEventListener('mouseout', () => {
            likeButton.parentNode.querySelector(".all_likes_wrapper").classList.remove('active');
        });

        likeButton.parentNode.addEventListener('mouseover', () => {
            likeButton.parentNode.querySelector(".all_likes_wrapper").classList.add('active');
        });

        likeButton.parentNode.addEventListener('mouseout', () => {
            likeButton.parentNode.querySelector(".all_likes_wrapper").classList.remove('active');
        });

        likeButton.parentNode.querySelectorAll('div').forEach((like_image) => {
            like_image.addEventListener('click', async (event) => {
                let dataTitle = event.currentTarget.dataset.title;
                const postId = likeButton.id;
                await pressedLike(postId, dataTitle);
                if (dataTitle === "LIKE") {
                    likeButton.innerHTML = `<div class="button_icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                            </svg>
                        </div>
                        <span>Like</span>`;

                    likeButton.classList.add("active")
                } else {
                    likeButton.innerHTML = `<img src="/static/assets/img/${dataTitle.toLowerCase()}.png" style="width: 20px; height: 20px" /> ${dataTitle}`;
                }

                if (dataTitle === "LIKE") {
                    likeButton.style.color = "#2D86FE";
                } else if (dataTitle === "LOVE") {
                    likeButton.style.color = "#EC2D50";
                } else if (dataTitle === "CARE" || dataTitle === 'HAHA' || dataTitle === "WOW" || dataTitle === "SAD") {
                    likeButton.style.color = "#FAC551";
                } else {
                    likeButton.style.color = "#E24E05";
                }

                likeButton.parentNode.querySelector(".all_likes_wrapper").classList.remove("active");
            });
            like_image.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });
    });
}

async function getEvents(){
    isFetchingForEvent = true
    let rows =''
    let data = await fetch(`/api/community/getEventsForCommunityDetailPage/${currentPageForEvent}`,{
        method : 'GET'
    })
    let response = await data.json()
    isFetchingForEvent = false
    let row = ''
    console.log(response)
    if(response.length===0){
        hasMoreForEvent = false
        displayNoPostMessage()
    }else{
        for(const pr of response){
            let createdTime = await timeAgo(new Date(r.created_date))
            let expired = ''
            if(new Date()>new Date(r.end_date)){
                expired=`
                
    <div class="alert alert-danger d-flex align-items-center" style=" width:265px; position: absolute; top: 135px;  z-index: 1;" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
    <div>
    <i class="fa-solid fa-triangle-exclamation"></i>
    EVENT IS EXPIRED
    </div>
    </div>
                
                `
            }
            

            let photo = r.photo === null ? '/static/assets/img/eventImg.jpg' : r.photo
            let startDate = new Date(r.start_date)
            let startDay = startDate.getDate()
            let startMonth = startDate.getMonth()+1
            let startYear = startDate.getFullYear()
            let startHours = startDate.getHours()
            let startMinutes = startDate.getMinutes()
            let endDate = new Date(r.end_date)
            let endDay = endDate.getDate()
            let endMonth = endDate.getMonth()+1
            let endYear = endDate.getFullYear()
            let endHours = endDate.getHours()
            let endMinutes = endDate.getMinutes()
            let formattedStartDate = `${startDay} / ${startMonth} / ${startYear}  `;
            let formattedEndDate = `${endDay} / ${endMonth} / ${endYear}  `
            let rows =   `
        
            <div class="post">
            <div class="post-top">
                <div class="dp">
                    <img src="${r.user.photo}" alt="">
                </div>
                <div class="post-info">
                    <p class="name">${r.user.name}</p>
                    <span class="time">${createdTime}</span>
                </div>
                            <div class="dropdown offset-8">
          <a class=" dropdown-toggle" onclick="getEventDetail(${r.id})" href="#"   id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-ellipsis-h "></i>
                </a>
        
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
            <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#eventEditModalBox">Edit</a></li>
            <li><a class="dropdown-item" onclick="deleteEvent(${r.id})">Delete Post</a></li> 
          </ul>
        </div>
            </div> 
            <div class=" post-content" data-bs-toggle="modal" data-bs-target="#searchPost" > 
            <div class="card" style="width: 30rem;  margin-left:12px ;"> 
      <div class="card-body">
        <h5 class="card-title">${r.title}</h5> 
        <div class="d-flex align-items-start">
        <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
        <button class="nav-link active  " id="v-${r.id}-photo-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-photo" type="button" role="tab" aria-controls="v-${r.id}-photo" aria-selected="true"><i class="fa-solid fa-image"></i>  </button>
          <button class="nav-link  " id="v-${r.id}-about-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-about" type="button" role="tab" aria-controls="v-${r.id}-about" aria-selected="false"><i class="fa-solid fa-circle-info"></i>  </button>
          <button class="nav-link" id="v-${r.id}-location-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-location" type="button" role="tab" aria-controls="v-${r.id}-location" aria-selected="false"><i class="fa-solid fa-location-dot"></i> </button>
          <button class="nav-link" id="v-${r.id}-date-tab" data-bs-toggle="pill" data-bs-target="#v-${r.id}-date" type="button" role="tab" aria-controls="v-${r.id}-date" aria-selected="false"><i class="fa-solid fa-clock"></i></button> 
        </div>
        <div class="tab-content" id="v-${r.id}-tabContent">
          <div class="tab-pane fade" id="v-${r.id}-about" role="tabpanel" aria-labelledby="v-${r.id}-about-tab">
          <div class="text-center lh-sm font-monospace">
          ${r.description}
          </div>
          </div>
          <div class="tab-pane fade" id="v-${r.id}-location" role="tabpanel" aria-labelledby="v-${r.id}-location-tab">
          <div class="text-center fs-5 fw-bold fst-italic font-monospace ml-3">
          <div class="ml-5  mt-5 text-danger">${r.location}</div>
          </div>
          </div>
          <div class="tab-pane fade" id="v-${r.id}-date" role="tabpanel" aria-labelledby="v-${r.id}-date-tab">
          <div class="text-center fs-6 fw-bold mt-3  pl-2 font-monospace">
          <div class="mt-2 ml-5 d-flex"><div class="text-secondary"> START </div> <i class="fa-solid fa-play text-danger mx-1"></i></br></div><div class="fst-italic"> ${formattedStartDate}</div></br>
          <div class="mt-2 ml-5 d-flex"><div class="text-secondary"> END </div> <i class="fa-solid fa-play text-danger mx-1"></i><br></div><div class="fst-italic"> ${formattedEndDate}</div>
           </div>
           </div>
          <div class="tab-pane fade show active" id="v-${r.id}-photo" role="tabpanel" aria-labelledby="v-${r.id}-photo-tab"> 
          ${expired}
          <b class="p-2"><img src="${r.photo}" style="width:250px; height:200px; border-radius:20px; position:relative;">
          </div> 
        </div>
      </div>
      </div>
    </div>
            </div>
            <div class="post-bottom">
                <div class="action" style="height: 50px">
        <div class="button_wrapper">
              <div class="all_likes_wrapper">
                  <div data-title="LIKE">
                      <img src="/static/assets/img/like.png" alt="Like" />
                  </div>
                  <div data-title="LOVE">
                      <img src="/static/assets/img/love.png" alt="Love" />
                  </div>
                  <div data-title="CARE">
                      <img src="/static/assets/img/care.png" alt="Care" />
                  </div>
                  <div data-title="HAHA">
                      <img src="/static/assets/img/haha.png" alt="Haha" />
                  </div>
                  <div data-title="WOW">
                      <img src="/static/assets/img/wow.png" alt="Wow" />
                  </div>
                  <div data-title="SAD">
                      <img src="/static/assets/img/sad.png" alt="Sad" />
                  </div>
                  <div data-title="ANGRY">
                      <img src="/static/assets/img/angry.png" alt="Angry" />
                  </div>
              </div>
              <button class="like_button" id=" "> 
              </button>
          </div>
                </div>
                <div class="action">
                    <i class="fa-regular fa-comment"></i>
                    <span onclick="pressedComment()"  data-bs-toggle="modal" data-bs-target="#commentStaticBox">Comment  </span>
                </div>
                <div class="action">
                    <i class="fa fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
        `;

            row+= rows
        };

        let range = document.createRange();
        let fragment = range.createContextualFragment(row);

        eventDiv.appendChild(fragment)
     

    }

}
 
async function getPolls(){
    isFetchingForPoll = true
    let polls = document.getElementById('polls');
    let pollTab = document.getElementById('polls')

    let data = await fetch(`/api/community/getPollsForCommunityDetailPage/${currentPageForPoll}`,{
        method : 'GET'
    })
    let response = await data.json()
    isFetchingForPoll = false
    if(response.length===0){
        hasMoreForPoll = false
        displayNoPostMessage()
    }else{
    console.log(response)
    let rows = ''
    for (let r of response) {
        let expired = ''
        if(new Date()>new Date(r.end_date)){
            expired=`
            
<div class="alert alert-danger d-flex align-items-center" style=" width:265px; position: absolute; top: 55px; left:120px;  z-index: 1;" role="alert">
<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
<div>
<i class="fa-solid fa-triangle-exclamation"></i>
POLL IS EXPIRED
</div>
</div>
            
            `
        }
        let hidden = await checkVoted(r.id) === false ? '' : 'hidden'
        let notHidden = await checkVoted(r.id) === false ? 'hidden' : ''
        let row = ''
        let created = new Date(r.created_date)
        let now = new Date()
        let createdTime = await timeAgo(new Date(r.created_date))
        
        row += `
        <div class="post" id="pollPostDiv-${r.id}">
        <div class="post-top">
            <div class="dp">
                <img src="${r.user.photo}" alt="">
            </div>
            <div class="post-info">
                <p class="name">${r.user.name}</p>
                <span class="time">${createdTime}</span>
            </div>
                        <div class="dropdown offset-8">
      <a class=" dropdown-toggle" onclick="getPollEventDetail(${r.id})" href="#"   id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-ellipsis-h "></i>
            </a>
    
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
        <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#pollEventEditModalBox">Edit</a></li>
        <li><a class="dropdown-item" onclick="deleteEvent(${r.id})">Delete Post</a></li> 
      </ul>
    </div>
        </div> 
        <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button class="nav-link active" id="nav-about-tab-${r.id}" data-bs-toggle="tab" data-bs-target="#nav-about-${r.id}" type="button" role="tab" aria-controls="nav-about-${r.id}" aria-selected="true"> <i class="fa-solid fa-info"></i>  About</button>
          <button class="nav-link" id="nav-vote-tab-${r.id}" data-bs-toggle="tab" data-bs-target="#nav-vote-${r.id}" type="button" role="tab" aria-controls="nav-vote-${r.id}" aria-selected="false"> <i class="fa-solid fa-check-to-slot"></i> Vote</button> 
        </div>
      </nav>
        <div class=" post-content" data-bs-toggle="modal"  > 


        <div class="card mb-3" style="max-width: 540px;">
        <div class="row g-0">
          <div class="col-md-4">
            ${expired}
            <img src="${r.photo}" style="max-width:170px; postion:relative;" class="img-fluid rounded-start" alt="...">
          </div>
          <div class="col-md-8">
            <div class="card-body" style="max-height: 200px; overflow-y: auto;">
            <div class="tab-content" id="nav-tabContent">
  <div class="tab-pane fade show active" id="nav-about-${r.id}" role="tabpanel" aria-labelledby="nav-about-tab-${r.id}">
  
  <h5 class="card-title align-middle font-monospace">${r.title}</h5>
  <p class="card-text font-monospace">${r.description}</p>
  
  </div>
  <div class="tab-pane fade" id="nav-vote-${r.id}" role="tabpanel" aria-labelledby="nav-vote-tab-${r.id}"> 

            
            `
        let totalVotes = 0;
        for (let v of r.voteOptions) {
            let count = await getCount(v.id);
            totalVotes += count;
        }
        for (let v of r.voteOptions) {
            let count = await getCount(v.id);
            let percentage = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
            row += `
        <div class="vote-option d-flex mt-1">
        <div class="d-block">
        <div class="font-monospace ">${v.type}</div>
                <div class="d-flex">
                <div class="progress" style="height: 16px; width: 170px;">
                
                    <div class="progress-bar bg-primary" id="${v.id}-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">${Math.floor(percentage)}%</div>
                </div>`
                if(new Date()<new Date(r.end_date)){
            row += ` <button id="vote-btn-${r.id}" class="${hidden} give-btn" onclick="voteVoteOption(${v.id},${r.id})"><i class="fa-solid fa-hand" style="width:7px; margin-right:11px;"></i></button> `;
                }
            let yes = await checkVotedMark(v.id)
            let markIcon = 'hidden'
            if(yes === true){
                markIcon = ''
            }
            console.log(yes)


            row += `<div id="mark-id-${v.id}" class="${markIcon}"><i class="fa-regular fa-circle-check"></i></div>
                </div>
                </div>
                 `



            row+=`</div>`

        }
        if(new Date()<new Date(r.end_date)){
        row += `   <button id="unvote-btn-${r.id}" class="${notHidden} erase-btn" onclick = "unVote(${r.id})"><i class="fa-solid fa-eraser"></i></button> `
        }
        row+=`</div> 
    </div>
          </div>
    </div>
  </div>
</div>
         
        <div class="post-bottom">
            <div class="action" style="height: 50px">
    <div class="button_wrapper">
          <div class="all_likes_wrapper">
              <div data-title="LIKE">
                  <img src="/static/assets/img/like.png" alt="Like" />
              </div>
              <div data-title="LOVE">
                  <img src="/static/assets/img/love.png" alt="Love" />
              </div>
              <div data-title="CARE">
                  <img src="/static/assets/img/care.png" alt="Care" />
              </div>
              <div data-title="HAHA">
                  <img src="/static/assets/img/haha.png" alt="Haha" />
              </div>
              <div data-title="WOW">
                  <img src="/static/assets/img/wow.png" alt="Wow" />
              </div>
              <div data-title="SAD">
                  <img src="/static/assets/img/sad.png" alt="Sad" />
              </div>
              <div data-title="ANGRY">
                  <img src="/static/assets/img/angry.png" alt="Angry" />
              </div>
          </div>
          <button class="like_button" id=" "> 
          </button>
      </div>
            </div>
            <div class="action">
                <i class="fa-regular fa-comment"></i>
                <span onclick="pressedComment()"  data-bs-toggle="modal" data-bs-target="#commentStaticBox">Comment  </span>
            </div>
            <div class="action">
                <i class="fa fa-share"></i>
                <span>Share</span>
            </div>
        </div>
    </div>
    </div>
        `
        rows+=row



    }
    let range = document.createRange();
    let fragment = range.createContextualFragment(rows);
    while (polls.children.length > 0) {
        polls.children[0].remove();
    }
    pollTab.appendChild(fragment)
    if(fragment){
        for(let r of response){
            await updateVotePercentage(r.voteOptions)
        }
    }
}

}

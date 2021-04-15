let currentRecipient = '';
let chatInput = $('#chat-input');
let chatButton = $('#btn-send');
let userList = $('#user-list');
let messageList = $('#message-list');
let messageBox = $('#message-box');
let visibleInput=$('input-visibility')
// let contactProfile = $("#contact_profile")
let contactProfile = document.getElementById('receiver')
let userProfile = document.getElementById('user-profile')
let searchInput = $('#search-input')
// let form_data = new FormData();
// $('#OpenImgUpload').click(function(){ $('#imgupload').trigger('click'); });



// document.getElementById('imgupload').addEventListener('change', handleImage);



function handleImage(e) {
    uploadedImg = e.target.files[0];
    // console.log(uploadedImg);
    if(uploadedImg !=null){
        let body=null;
        sendMessage(currentRecipient,body,uploadedImg)
    }
}

// Fetch all users from database through api
function onSelectUser(user,username_eng){
    setCurrentRecipient(user,username_eng)
    // console.log(user)
}

function updateUserList() {
    $.getJSON('api/v1/members/', function (data) {
        // userList.children('.user').remove();[mashuq commented this]
        console.log(data)

        for (let i = 0; i < data.length; i++) {
            // const userItem = `<li class="contact">${data[i]['username']}</li>`;

            const userItem =
            `
            <div id="selectUser"   onclick="onSelectUser('${data[i]['username']}','${data[i]['username_eng']}')">
            <a href='#' style="text-decoration: none; " class="p-3 my-3">
                        <div class="row">
                            <div class="col-md-4 col-sm-2 " style="text-align:right;" >
                                <img src="https://randomuser.me/api/portraits/women/86.jpg" alt="Avatar" alt="user" width="50" class="rounded-circle " >
                            </div>
                            <div class="col-md-8 user-name-block">
                                <p style="margin: 0px" class="text-dark text-capitalize">${data[i]['username_eng']}</p>
                                <span class="text-muted">The messages are ...</span>
                                
                
                                
                            </div>
                        </div>
                </a>
          
          </div>
          `
            $(userItem).appendTo('#user-list');
        }
        // $('#selectUser').click(function (e) {
        //      selectedUser = $(e.target.value)
        //     // setCurrentRecipient(selected);
        //     console.log(selectedUser)
        // });
        // $('.user').click(function () {
        //     userList.children('.active').removeClass('active');//[the previous selected active username er front end er active class remove hobe]
        //     let selected = event.target;
        //     $(selected).addClass('active');
            // setCurrentRecipient(selected.text);
        // });
    });
}

// Receive one message and append it to message list
function drawMessage(message) {

    let date = new Date(message.timestamp);
    const hour=date.getHours()
    const minute=date.toLocaleString('en-US', { hour: 'numeric', hour12: true })
    const second=date.getSeconds()
    const day=date.getDay()
    const month=date.toLocaleString('default', { month: 'long' })
    
    
    console.log(hour)

    // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // date=date.toLocaleDateString("en-US")

    // console.log(date.toLocaleDateString("en-US")); // 9/17/2016
    // console.log(today.toLocaleDateString("en-US", options)); // Saturday, September 17, 2016
    // console.log(today.toLocaleDateString("hi-IN", options)); 

    if (message.user === currentUser) {
         const messageItem= `  <div class="row message">
         <div class="d-flex flex-row-reverse  w-50 ml-auto " style="margin-left: auto;">
          
             <div class="p-2">
                 <span class="text-muted" style="font-size: 14px;">${message.user} 11|12 pm</span>
                 <p class="sender-color p-2 receiver-color" style="margin: 0px;">${message.body}</p>
             </div>
             
             
         </div>
     </div>`
      $(messageItem).appendTo('#message-list');
    }
    else{
         const messageItem=
     `  <div class="row message">
                                       
                                        
                                            <div class="d-flex flex-row  mb-3  w-50">
                                                <div class="p-2 bd-highlight">
                                                    <img src="https://randomuser.me/api/portraits/women/86.jpg" alt="Avatar" alt="user" width="50" class="rounded-circle">
                                                </div>
                                                <div class="p-2 ">
                                                    <span class="text-muted" style="font-size: 14px;">${message.user} 11|12 pm</span>
                                                    <p class="sender-color p-2" style="margin: 0px">${message.body}</p>
                                                </div>
                                                
                                                
                                            </div>
                                    </div>
         `
    $(messageItem).appendTo('#message-list');
    }


    // $(messageItem).appendTo('#message-list');
    // console.log(currentUser)

}

// Fetch last 20 conversatio from the database
function getConversation(recipient) {
    $.getJSON(`/api/v1/message/?target=${recipient}`, function (data) {
        messageList.children('.message').remove();
        for (let i = data['results'].length - 1; i >= 0; i--) {
            drawMessage(data['results'][i]);
        }

    });

}

// Retrive message by message id and add to messageList
// Access message id from websocket
function getMessageById(message) {
    id = JSON.parse(message).message
    $.getJSON(`/api/v1/message/${id}/`, function (data) {
        if (data.user === currentRecipient ||
            (data.recipient === currentRecipient && data.user == currentUser)) {
            drawMessage(data);
        }
       ;
    });
}

// Send message to messages api
function sendMessage(recipient, body) {
   
    $.post('/api/v1/message/', {
        recipient: recipient,
        body: body,
        image:null
    }).fail(function () {
        alert('Error! Check console!');
    });
    
    userList.children('.user').remove()
}

// set clicked user as currentRecipient
// get all conversation of currentRecipient or currentUser
function setCurrentRecipient(username,username_eng) {
    // console.log(contactProfile);
    
    username_tag = contactProfile.getElementsByTagName('h3')[0]
    // console.log(b[0].innerText);
    username_tag.innerText = username_eng
    currentRecipient = username;
    // console.log(username);
    getConversation(currentRecipient);
    enableInput();
}


// Enable input button
function enableInput() {
    chatInput.prop('disabled', false);
    chatButton.prop('disabled', false);
    chatInput.focus();
    // chatInput.show()
    // chatButton.show()
}

// Disable input button
function disableInput() {
    chatInput.prop('disabled', true);
    chatButton.prop('disabled', true);
    // chatInput.hide()
    // chatButton.hide()

}

$(document).ready(function () {
    updateUserList();
    disableInput();
    // $("#message-box").scrollTop($(document).height());
    $("#search-box").hide()
    $("#back-button").hide()
    
    userProfile.getElementsByTagName('h4')[0].innerText=currentUserName
//    let socket = new WebSocket(`ws://127.0.0.1:8000/?session_key=${sessionKey}`);
    var socket = new WebSocket(
        'ws://' + window.location.host +
        '/ws?session_key=${sessionKey}')
        // HTTP GET /api/v1/message/?target=test2 200 [0.87, 127.0.0.1:38868]
    chatInput.keypress(function (e) {
        // console.log(chatInput.val());
        if (e.keyCode == 13)
            chatButton.click();
    });
    searchInput.keypress(function(e){
        if(e.keyCode==13){
            $("#search-box").children(".update-list").remove()
           if(searchInput.val().length>0){
            drawSearchedUser(searchInput.val())
            searchInput.val('')
           }
        }
    })
    searchInput.click(function(e){
        console.log("the search box is clicked!!!")
        $("#user-list").hide()
        $("#search-box").show()
        $("#back-button").show()

    })

    $("#back-button").click(function(e){
        console.log("the imput is blured")
        $("#user-list").show()
        $("#search-box").hide()
        $("#back-button").hide()
        $("#search-box").children(".update-list").remove()
    })

  chatButton.click(function () {
    if (chatInput.val().length > 0) {
      // console.log((currentRecipient));
    
      sendMessage(currentRecipient, chatInput.val());
      chatInput.val('');
    }
  });

  // Receive message from websocket
  socket.onmessage = function (e) {
    getMessageById(e.data);
  };
});
function onSelectSearchedUser(selctedSearchedUser,selctedSearchedUserID){
  $.post('/api/v1/member/add/', {
    creator: currentUserID,
    friends: selctedSearchedUserID
  }).fail(function () {
    alert('Error! Check console!');
  });
  
  setCurrentRecipient(selctedSearchedUser)
  
  $("#user-list").show()
  $("#search-box").hide()
  $("#back-button").hide()
  $("#search-box").children(".update-list").remove()
  searchInput.val('')
  
}


function drawSearchedUser(user){
  $.getJSON(`/api/v1/usersearch/?search_user=${user}`, function (data) {
      console.log(data)
    for(let i=0;i<=data.length;i++)
    {
      const searchedUser=`<a href="#" class="list-group-item list-group-item-action update-list" onclick=onSelectSearchedUser('${data[i]["username"]}','${data[i]["id"]}')>${data[i]["username_eng"]}</a>`
      $(searchedUser).appendTo('#search-box');
    }

    console.log(data)

  });
  console.log(user)



}

// for testing
// const userItem = `<li class="contact">
//     <div class="wrap">
//     <span class="contact-status online"></span>
//     <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
//     <div class="meta">
//         <p class="name" id="name_id">${data[i]['username']}</p>
//         <p class="preview">You just got LITT up, Mike.</p>
//     </div>
//     </div>
// </li>`

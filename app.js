window.onload = function() {
  const listContainer = document.getElementById("message-list");
  const remindFreq = document.getElementById("remind-freq");
  const remainTime = document.getElementById("remain-time");
  const streakCounter = document.getElementById("day-count");
  const messageInput = document.getElementById("message-input");
  let messages = JSON.parse(localStorage.getItem("myMessage")) || [];

  function saveMessages(){
      localStorage.setItem("myMessage", JSON.stringify(messages));
  }
  function renderMessage(){
      if (!messageInput) return;
      const message = messageInput.value.trim();
      if (message === "") {
          alert("Please enter a message");
          return;
      }
      messages.push(message);
      addMessageToList(message);
      saveMessages();
      messageInput.value = "";
  }

  function addMessageToList(message) {
      if (!listContainer) return;
      let li = document.createElement("li");
      li.innerHTML = message;
      let span = document.createElement("span");
      span.innerHTML = "\u00d7";
      li.appendChild(span);
      listContainer.appendChild(li);
  }

  function renderAllMessages() {
      if (!listContainer) return;
      listContainer.innerHTML = "";
      messages.forEach(addMessageToList);
  }

function reminder() { 
    const now = new Date();
    let hours = now.getHours();
    hours = hours.toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `Next streak in ${hours}h${minutes}m${seconds}s`;
    remainTime.textContent = timeString;
}
setInterval(reminder, 1000);
  if (listContainer) {
    listContainer.addEventListener("click", event => {
        if(event.target.tagName === "SPAN"){
            const li = event.target.parentElement;
            const text = li.firstChild.textContent;
            li.remove();
            messages = messages.filter(msg => msg !== text);
            saveMessages();
        }
    });
    renderAllMessages();
  }

  // Countdown logic: only update seconds every second
  let countdown = 0;
  let countdownHours = 0;
  let countdownMinutes = 0;
  let countdownSeconds = 0;
  let countdownTimer = null;

  function setCountdown() {
    let interval = 3600000;
    if (remindFreq && remindFreq.value) {
      interval = Number(remindFreq.value);
    }
    let lastSent = Number(localStorage.getItem("lastSent"));
    if (!lastSent) {
      lastSent = Date.now();
      localStorage.setItem("lastSent", lastSent);
    }
    let nextStreak = lastSent + interval;
    let diff = nextStreak - Date.now();
    if (diff < 0) diff = 0;
    countdown = Math.floor(diff / 1000);
    countdownHours = Math.floor(countdown / 3600);
    countdownMinutes = Math.floor((countdown % 3600) / 60);
    countdownSeconds = countdown % 60;
    updateCountdownDisplay();
  }

//   function updateCountdownDisplay() {
//     if (!remainTime) return;
//     const timeString = `Next streak in ${countdownHours}h${countdownMinutes}m${countdownSeconds}s`;
//     remainTime.textContent = timeString;
//   }

  function tickCountdown() {
    if (countdown > 0) {
      countdown--;
      countdownHours = Math.floor(countdown / 3600);
      countdownMinutes = Math.floor((countdown % 3600) / 60);
      countdownSeconds = countdown % 60;
      updateCountdownDisplay();
    }
  }

  // Start countdown
  setCountdown();
  countdownTimer = setInterval(tickCountdown, 1000);

  // Reset countdown when interval changes or notification is sent
  if (remindFreq) {
    remindFreq.addEventListener("change", () => {
      setCountdown();
    });
  }
  // Also reset after notification
  function notifyUser(){
      if (Notification.permission === "granted") {
          new Notification("Streak Hero", {
              body: "Don't forget the streak",
              icon: "icon.png"
          });
      }else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                  new Notification("Streak Hero", {
                      body: "Don't forget the streak",
                      icon: "icon.png"
                  });
              }
          });
      }
      setCountdown(); // reset countdown after notification
  }


  // Notification timer logic
  let notificationTimer = null;
  function startNotificationTimer() {
    if (notificationTimer) clearInterval(notificationTimer);
    let interval = 3600000; // default 1 hour
    if (remindFreq && remindFreq.value) {
      interval = Number(remindFreq.value);
    }
    notificationTimer = setInterval(() => {
      notifyUser();
      // Update lastSent for streak logic
      localStorage.setItem("lastSent", Date.now());
    }, interval);
  }

  // Listen for changes to the interval
  if (remindFreq) {
    remindFreq.addEventListener("change", startNotificationTimer);
  }
  // Start timer on load
  startNotificationTimer();

  function updateStreak() {
      if (!streakCounter) return;
      const lastSent = Number(localStorage.getItem("lastSent"));
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      let streak = Number(localStorage.getItem("currentStreak")) || 0;
      if (!lastSent) {
          streak = 1;
          localStorage.setItem("lastSent", todayMidnight);
          localStorage.setItem("currentStreak", streak);
          return;
      }
      if (wasYesterday(lastSent, todayMidnight)) {
          streak++;
      } else if (lastSent !== todayMidnight) {
          streak = 1;
      }
      localStorage.setItem("lastSent", todayMidnight);
      localStorage.setItem("currentStreak", streak);
  }

  function wasYesterday(last, today) {
      const difference = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      return difference === 1;
  }
  function displayStreak(){
      if (!streakCounter) return;
      const streak = localStorage.getItem("currentStreak") || 0;
      streakCounter.textContent = streak;
  }
  displayStreak();

  function getRandomMessage(){
       if(messages.length == 0){
          alert("No messages to send!");
          return;
      }
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
  }
  function copyToClipBoard(text){
      try{
          navigator.clipboard.writeText(text).then(() =>{
              alert("Message copied!");
          });
      } catch(err) {
          console.error("Failed to copy text: ", err);
      }
  }

  function sendMassage(){
     const message = getRandomMessage();
     if (message) {
         copyToClipBoard(message);
         window.open("https://www.tiktok.com/messages");
     }
  }
}
const listContainer = document.getElementById("message-list");
const remindFreq = document.getElementById("remind-freq");
const remainTime = document.getElementById("remain-time");
const streakCounter = document.getElementById("day-count");

const messageInput = document.getElementById("message-input");
let messages = JSON.parse(localStorage.getItem("myMessage")) || [];

function saveMessages(){
    localStorage.setItem("myMessage", JSON.stringify(messages));
}
function renderMessage(){
    const message = messageInput.value.trim();
    if (message === "") {
        alert("Please enter a message");
        return;
    }
    messages.push(message);
    addMessageToList(message);
    saveMessages();
    messageInput.value = "";
}

function addMessageToList(message) {
    let li = document.createElement("li");
    li.innerHTML = message;
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
    listContainer.appendChild(li);
}

function renderAllMessages() {
    listContainer.innerHTML = "";
    messages.forEach(addMessageToList);
}

listContainer.addEventListener("click", event => {
    if(event.target.tagName === "SPAN"){
        const li = event.target.parentElement;
        const text = li.firstChild.textContent;
        li.remove();
        messages = messages.filter(msg => msg !== text);
        saveMessages();
    }
});


// Render all messages on page load


 function notifyUser(){
     if (Notification.permission === "granted") {
        new Notification("Streak Hero", {
            body: "Don't forget the streak",
            icon: "icon.png"
        })}else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Streak Hero", {
                    body: "Don't forget the streak",
                    icon: "icon.png"
                });
            }
        });
    }
 }

function updateStreak() {
    const lastSent = Number(localStorage.getItem("lastSent"));
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let streak = Number(localStorage.getItem("currentStreak")) || 0;
    if (!lastSent) {
        streak = 1;
        localStorage.setItem("lastSent", todayMidnight);
        localStorage.setItem("currentStreak", streak);
        return;
    }
    if (wasYesterday(lastSent, todayMidnight)) {
        streak++;
    } else if (lastSent !== todayMidnight) {
        streak = 1;
    }
    localStorage.setItem("lastSent", todayMidnight);
    localStorage.setItem("currentStreak", streak);
}

function wasYesterday(last, today) {
    const difference = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    return difference === 1;
}
function displayStreak(){
    const streak = localStorage.getItem("currentStreak") || 0;
    streakCounter.textContent = streak;
}
displayStreak();

function getRandomMessage(){
     if(messages.length == 0){
        alert("No messages to send!");
        return;
    }
    const randomIndex = Math.floor(Math.random() * messages.length);

    return messages[randomIndex];
}
function copyToClipBoard(text){
    try{
        navigator.clipboard.writeText(text).then(() =>{
            alert("Message copied!");
        });
    } catch(err) {
        console.error("Failed to copy text: ", err);
    }
}

function sendMassage(){
   const message = getRandomMessage();
   if (message) {
       copyToClipBoard(message);
       window.open("https://www.tiktok.com/messages");
   }
}


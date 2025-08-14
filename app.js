const listContainer = document.getElementById("message-list");
const remindFreq = document.getElementById("remind-freq");
const remainTime = document.getElementById("remain-time");
const streakCounter = document.getElementById("day-count");
const messageInput = document.getElementById("message-input");
let messages = JSON.parse(localStorage.getItem("myMessage")) || [];

// Save messages
function saveMessages() {
    localStorage.setItem("myMessage", JSON.stringify(messages));
}

// Add new message from input
function renderMessage() {
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

// Add message to list UI
function addMessageToList(message) {
    if (!listContainer) return;
    let li = document.createElement("li");
    li.textContent = message;

    let span = document.createElement("span");
    span.textContent = "\u00d7"; // delete symbol
    li.appendChild(span);

    listContainer.appendChild(li);
}

// Render all messages
function renderAllMessages() {
    if (!listContainer) return;
    listContainer.innerHTML = "";
    messages.forEach(addMessageToList);
}

// Delete message on click
if (listContainer) {
    listContainer.addEventListener("click", event => {
        if (event.target.tagName === "SPAN") {
            const li = event.target.parentElement;
            const text = li.firstChild.textContent;
            li.remove();
            messages = messages.filter(msg => msg !== text);
            saveMessages();
        }
    });
    renderAllMessages();
}

// Countdown variables
let countdown = 0;
let countdownHours = 0;
let countdownMinutes = 0;
let countdownSeconds = 0;
let countdownTimer = null;

// Set countdown
function setCountdown() {
    let interval = remindFreq && remindFreq.value ? Number(remindFreq.value) : 3600000;
    let lastSent = Number(localStorage.getItem("lastSent"));
    if (!lastSent) {
        lastSent = Date.now();
        localStorage.setItem("lastSent", lastSent);
    }
    let nextStreak = lastSent + interval;
    let diff = nextStreak - Date.now();
    if (diff < 0) diff = 0;
    countdown = Math.floor(diff / 1000);
    updateCountdownDisplay();
}

// Update countdown display
function updateCountdownDisplay() {
    if (!remainTime) return;
    countdownHours = Math.floor(countdown / 3600);
    countdownMinutes = Math.floor((countdown % 3600) / 60);
    countdownSeconds = countdown % 60;
    remainTime.textContent = `Next streak in ${countdownHours}h ${countdownMinutes}m ${countdownSeconds}s`;
}

// Tick countdown
function tickCountdown() {
    if (countdown > 0) {
        countdown--;
        updateCountdownDisplay();
    }
}

// Notification
function notifyUser() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                navigator.serviceWorker.register('sw.js').then(registration => {
                    registration.showNotification('Streak Hero', {
                        body: "Your Streak is ready to update!",
                        icon: "icon.png",
                        actions: [
                            { action: "confirm", title: "Send" },
                            { action: "later", title: "Later" }
                        ]
                    });
                });
            }
        });
    }
    updateStreak();
    setCountdown();
}

// Notification timer
let notificationTimer = null;
function startNotificationTimer() {
    if (notificationTimer) clearInterval(notificationTimer);
    let interval = remindFreq && remindFreq.value ? Number(remindFreq.value) : 3600000;
    notificationTimer = setInterval(() => {
        notifyUser();
        localStorage.setItem("lastSent", Date.now());
    }, interval);
}

// Listen for reminder frequency change
if (remindFreq) {
    remindFreq.addEventListener("change", () => {
        setCountdown();
        startNotificationTimer();
    });
}

// Streak logic
function updateStreak() {
    const lastSent = Number(localStorage.getItem("lastSent"));
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let streak = Number(localStorage.getItem("currentStreak")) || 0;

    if (!lastSent) {
        streak = 1;
    } else if (wasYesterday(lastSent, todayMidnight)) {
        streak++;
    } else if (lastSent !== todayMidnight) {
        streak = 1;
    }

    localStorage.setItem("lastSent", todayMidnight);
    localStorage.setItem("currentStreak", streak);
    displayStreak();
}

function wasYesterday(last, today) {
    return Math.floor((today - last) / (1000 * 60 * 60 * 24)) === 1;
}

function displayStreak() {
    const streak = localStorage.getItem("currentStreak") || 0;
    streakCounter.textContent = streak;
}

// Random message
function getRandomMessage() {
    if (messages.length === 0) {
        alert("No messages to send!");
        return;
    }
    return messages[Math.floor(Math.random() * messages.length)];
}

// Copy to clipboard
function copyToClipBoard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Message copied!");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}

// Send message
function sendMassage() {
    const message = getRandomMessage();
    if (message) {
        copyToClipBoard(message);
        updateStreak();
        window.open("https://www.tiktok.com/messages");
    }
}

// Init
renderAllMessages();
displayStreak();
setCountdown();
countdownTimer = setInterval(tickCountdown, 1000);
startNotificationTimer();
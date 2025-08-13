

self.addEventListener("notification", event =>{
    event.notification.close();

    if(event.action === "confirm"){
        sendMassage();
    }else if(event.action ==="later"){
        return;
    }else{
        return;
    }
})
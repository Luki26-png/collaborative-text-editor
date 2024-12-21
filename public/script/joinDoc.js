document.getElementById("join-document").addEventListener("click", (event)=>{
    event.preventDefault();

    const sentData = JSON.stringify({roomId : document.getElementById("roomId").value})

    const xhrClient = new XMLHttpRequest();
    xhrClient.open("POST", "/check-doc");
    xhrClient.responseType = "json";
    xhrClient.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhrClient.send(sentData);

    xhrClient.onload = ()=>{
        if(xhrClient.status != 200){
            //alert('Error: ' + xhrClient.status);
            document.getElementById("doc-notify").display = 'block';
            return;
        }
        let response = xhrClient.response;
        console.log(response);
        window.location.assign('http://'+ window.location.host + '/open/' + response.roomId);
    };
})
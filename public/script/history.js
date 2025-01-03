let versionDocArray = [];

// Function to create the HTML structure
function createHistoryItem(version, date, position) {
    // Create the container div
    const container = document.createElement('div');
    container.id = position;
    container.classList.add('container-fluid', 'py-3', 'border', 'history-item');
    //container.setAttribute('onclick', 'showpreview(event)');

    // Create the first paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.textContent = 'Terakhir di edit pada';
    container.appendChild(paragraph1);

    // Create the second paragraph with a small element inside
    const paragraph2 = document.createElement('p');
    const small1 = document.createElement('small');
    small1.classList.add('fst-italic', 'fw-light');
    small1.textContent = date;
    paragraph2.appendChild(small1);
    container.appendChild(paragraph2);

    // Create the version info small element
    const small2 = document.createElement('small');
    small2.classList.add('fst-italic', 'fw-light');
    small2.textContent = version;
    container.appendChild(small2);

    return container;
}

function insertIntoHistorySideBar(versionArray, versionDateArray){
    const historySideBar = document.getElementById('history');
    if(versionArray){
       for (let i = versionArray.length - 1; i >= 0; i--) {
        let historyItem = createHistoryItem(versionArray[i], versionDateArray[i], i);
        historySideBar.appendChild(historyItem);
        } 
    }else{
        const noHistory = document.createElement('h6');
        noHistory.id = 'supplier-not-found';
        noHistory.classList.add('py-3', 'history-item');
        noHistory.textContent = 'Dokumen ini belum memiliki history';
        historySideBar.appendChild(noHistory);
    }
}

function createVersionArray(count) {
    let versionArray = [];
    
    let major = 1; // Starting with major version 1
    let minor = 0; // Starting with minor version 0
    let patch = 0; // Starting with patch version 0

    for (let i = 1; i <= count; i++) {
        let version = `${major}.${minor}.${patch}`;
        versionArray.push(version);

        // Increment the patch version for each new release
        patch++;

        // Optionally, you can update the minor or major version when certain thresholds are met:
        // For example, every 10 patch increments you could increment the minor version
        if (patch >= 10) {
            patch = 0;    // Reset patch to 0
            minor++;      // Increment minor version
        }
        if (minor >= 10) {
            minor = 0;    // Reset minor to 0
            major++;      // Increment major version
        }
    }

    return versionArray;
}

document.getElementById("open-history").addEventListener("click", function() {
    //program to make that history sidebar is empty before insertion
    const historyItem = document.querySelectorAll('.history-item');
    if(historyItem){
       historyItem.forEach(item => item.remove()); 
    }
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");
    
    //retrieve room id
    const documentRoomIdElement = document.querySelector('.document-room-id');
    const documentRoomId = documentRoomIdElement ? documentRoomIdElement.id : null;

    const xhrClient = new XMLHttpRequest();

    let formData = JSON.stringify({
        id : documentRoomId
    });

    xhrClient.open("POST", '/versions');
    xhrClient.responseType = "json";
    xhrClient.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhrClient.send(formData);

    xhrClient.onload = ()=>{
        if(xhrClient.status != 200){
            alert('Error: ' + xhrClient.status + 'error retrieving document version');
            return;
        }
        let response = xhrClient.response.versions;
        //console.log(response.versions);
        let versionTime = xhrClient.response.time;
        const versionArray = response.map(base64String => {
            const binaryString = atob(base64String); // Decode the base64 string
            const uint8Array = new Uint8Array(binaryString.length);
        
            // Convert the binary string to Uint8Array
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i);
            }
            return uint8Array;
        });
        
        //array of uint8 that hold doc state for every version
        versionDocArray = versionArray;

        const numericVersion = createVersionArray(versionTime.length);
        insertIntoHistorySideBar(numericVersion, versionTime);
        // console.log(versionArray);
        // console.log(versionTime);
        // console.log(createVersionArray(versionTime.length));
    }

    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-none");
    historyElement.classList.add("d-block");

});

document.getElementById("close-history").addEventListener("click", function() {
    const historyItem = document.querySelectorAll('.history-item');
    if(historyItem){
       historyItem.forEach(item => item.remove()); 
    }
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");
    
    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-block");
    historyElement.classList.add("d-none");
});

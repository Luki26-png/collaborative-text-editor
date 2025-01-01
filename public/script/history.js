document.getElementById("open-history").addEventListener("click", function() {
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");
    
    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-none");
    historyElement.classList.add("d-block");
});

document.getElementById("close-history").addEventListener("click", function() {
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");
    
    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-block");
    historyElement.classList.add("d-none");
});
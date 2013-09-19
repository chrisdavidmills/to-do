var note = document.getElementById('notifications');
var db;

var newItem = [
      { itemTitle: "", item: "", deadline: "", completed: "" }
    ];
    
var increment = 0;

var taskList = document.getElementById('task-list');

var taskForm = document.getElementById('task-form');
var title = document.getElementById('title');
var deadline = document.getElementById('deadline');
var submit = document.getElementById('submit');

window.onload = function() {
  note.innerHTML += '<li>App initialised.</li>';
  // In the following line, you should include the prefixes of implementations you want to test.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


  // Let us open our database
  var request = window.indexedDB.open("toDoList", 4);

  // these two event handlers act on the database being opened successfully, or not
  request.onerror = function(event) {
    note.innerHTML += '<li>Error loading database.</li>';
  };
  
  request.onsuccess = function(event) {
    note.innerHTML += '<li>Database initialised.</li>';
    db = request.result;
    displayData(db);
  };
  
  // This event handles the event whereby a new version of the database needs to be created
  // Either one has not been created before, or a new version number has been submitted via the
  // window.indexedDB.open line above
  //it is only implemented in recent browsers
  request.onupgradeneeded = function(event) { 
    var db = event.target.result;
    
    db.onerror = function(event) {
      note.innerHTML += '<li>Error loading database.</li>';
    };

    // Create an objectStore for this database
    
    var objectStore = db.createObjectStore("toDoList", { keyPath: "taskTitle" });
    
    // define what data items the objectStore will contain
    
    objectStore.createIndex("deadline", "deadline", { unique: false });
    objectStore.createIndex("completed", "completed", { unique: false });
    
    note.innerHTML += '<li>Object store created.</li>';
  };
    
  function displayData() {
    taskList.innerHTML = "";
  
    //var keyRange = IDBKeyRange.bound(2,4,false,false); only include certain data bounds in the cursor?
    var objectStore = db.transaction('toDoList').objectStore('toDoList');
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
        if(cursor) {
          var listItem = document.createElement('li');
          listItem.innerHTML = cursor.value.taskTitle + ': ' + cursor.value.deadline + '.';
          taskList.appendChild(listItem);  
          var deleteButton = document.createElement('button');
          listItem.appendChild(deleteButton);
          deleteButton.innerHTML = 'X';
          deleteButton.setAttribute('data-task',cursor.value.taskTitle);
          deleteButton.onclick = function(event) {
            deleteItem(event);
          }
          cursor.continue();
        } else {
          note.innerHTML += '<li>Entries all displayed.</li>';
      }
    }
  }
  
  taskForm.addEventListener('submit',addData,false);
  
  function addData(e) {
    e.preventDefault();
  
    if(title.value == '' || deadline.value == '') {
      note.innerHTML += '<li>Data not submitted — form incomplete.</li>';
    } else {
      
    var newItem = [
      { taskTitle: title.value, deadline: deadline.value, completed: 'No' }
    ];
        
    console.log(newItem);

    var transaction = db.transaction(["toDoList"], "readwrite");
    
    transaction.oncomplete = function(event) {
      note.innerHTML += '<li>Transaction opened for task addition.</li>';
    };

    transaction.onerror = function(event) {
      note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
    };

    var objectStore = transaction.objectStore("toDoList");
    var request = objectStore.add(newItem[0]);        
      request.onsuccess = function(event) {
        note.innerHTML += '<li>New item added to database.</li>';
        title.value = '';
        deadline.value = '';
      };
    };
    
    displayData();
  }
  
  function deleteItem(event) {
    var dataTask = event.target.getAttribute('data-task');
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
    var request = db.transaction(["toDoList"], "readwrite").objectStore("toDoList").delete(dataTask);
    request.onsuccess = function(event) {
      note.innerHTML += '<li>Task \"' + dataTask + '\" deleted.</li>';
    };
    
  }
}
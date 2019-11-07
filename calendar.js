//prof's calendar library
/*globals $:false */
(function () {
	"use strict";

	/* Date.prototype.deltaDays(n)
	 *
	 * Returns a Date object n days in the future.
	 */
	Date.prototype.deltaDays = function (n) {
		// relies on the Date object to automatically wrap between months for us
		return new Date(this.getFullYear(), this.getMonth(), this.getDate() + n);
	};

	/* Date.prototype.getSunday()
	 *
	 * Returns the Sunday nearest in the past to this date (inclusive)
	 */
	Date.prototype.getSunday = function () {
		return this.deltaDays(-1 * this.getDay());
	};
}());

/** Week
 *
 * Represents a week.
 *
 * Functions (Methods):
 *	.nextWeek() returns a Week object sequentially in the future
 *	.prevWeek() returns a Week object sequentially in the past
 *	.contains(date) returns true if this week's sunday is the same
 *		as date's sunday; false otherwise
 *	.getDates() returns an Array containing 7 Date objects, each representing
 *		one of the seven days in this month
 */
function Week(initial_d) {
	"use strict";

	this.sunday = initial_d.getSunday();


	this.nextWeek = function () {
		return new Week(this.sunday.deltaDays(7));
	};

	this.prevWeek = function () {
		return new Week(this.sunday.deltaDays(-7));
	};

	this.contains = function (d) {
		return (this.sunday.valueOf() === d.getSunday().valueOf());
	};

	this.getDates = function () {
		var dates = [];
		for(var i=0; i<7; i++){
			dates.push(this.sunday.deltaDays(i));
		}
		return dates;
	};
}

/** Month
 *
 * Represents a month.
 *
 * Properties:
 *	.year == the year associated with the month
 *	.month == the month number (January = 0)
 *
 * Functions (Methods):
 *	.nextMonth() returns a Month object sequentially in the future
 *	.prevMonth() returns a Month object sequentially in the past
 *	.getDateObject(d) returns a Date object representing the date
 *		d in the month
 *	.getWeeks() returns an Array containing all weeks spanned by the
 *		month; the weeks are represented as Week objects
 */
function Month(year, month) {
	"use strict";

	this.year = year;
	this.month = month;

	this.nextMonth = function () {
		return new Month( year + Math.floor((month+1)/12), (month+1) % 12);
	};

	this.prevMonth = function () {
		return new Month( year + Math.floor((month-1)/12), (month+11) % 12);
	};

	this.getDateObject = function(d) {
		return new Date(this.year, this.month, d);
	};

	this.getWeeks = function () {
		var firstDay = this.getDateObject(1);
		var lastDay = this.nextMonth().getDateObject(0);

		var weeks = [];
		var currweek = new Week(firstDay);
		weeks.push(currweek);
		while(!currweek.contains(lastDay)){
			currweek = currweek.nextWeek();
			weeks.push(currweek);
		}

		return weeks;
	};
}


//=====================================================================================================
//================================actual logic for calendar============================================
//=====================================================================================================


var currentMonth = new Month(2018, 3);

var month = document.getElementById("currentMonth");
var year = document.getElementById("currentYear");
var loggedIn = false;
var others = false;
var friends = [];

updateCalendar();
changeButtonDisplay();


// Change the month when the "next" button is pressed
document.getElementById("next_month_btn").addEventListener("click", function(event){
	currentMonth = currentMonth.nextMonth();
	updateCalendar();
}, false);

document.getElementById("prev_month_btn").addEventListener("click", function(event){
	currentMonth = currentMonth.prevMonth();
	updateCalendar();
}, false);

//================================jquery==========================================
//==================event modal==========================================================


$(window).on('load', function () {
	$('#editEventModal').on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget); // Button that triggered the modal
	  var title = button.data('title'); // Extract info from data-* attributes
		var description = button.data('description');
		var date = button.data('date');
		var time = button.data('time');
		var category = button.data('category');
		var id = button.data('id');

	  var modal = $(this);
	  modal.find('#edit-event-title').val(title);
		modal.find('#edit-event-description').val(description);
		modal.find('#edit-event-date').val(date);
		modal.find('#edit-event-time').val(time);
		modal.find('#editevent-category').val(category);
		modal.find('#edit-event-id').text(id);
	});
	$('#readEventModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		var title = button.data('title'); // Extract info from data-* attributes
		var description = button.data('description');
		var date = button.data('date');
		var time = button.data('time');
		var category = button.data('category');
		var id = button.data('id');

		var modal = $(this);
		modal.find('#read-event-title').text(title);
		modal.find('#read-event-description').text(description);
		modal.find('#read-event-date').text(date);
		modal.find('#read-event-time').text(time);
		modal.find('#readevent-category').text(category);
		modal.find('#read-event-id').text(id);
	});
	$('#DropDown').on('hide.bs.dropdown', function (event) {
	  var dropdown = $(this);
		dropdown.find('#shareItems').empty();
	});
	$('#DropDown').on('show.bs.dropdown', function (event) {
		getSharesAjax(event);
	});
	$('#loginModal').on('hide.bs.modal', function (event) {
		var loginModal = $(this);
		loginModal.find('#login-username').val("");
		loginModal.find('#login-password').val("");
	});

	$('#registerModal').on('hide.bs.modal', function (event) {
		var registerModal = $(this);
		registerModal.find('#register-username').val("");
		registerModal.find('#register-password').val("");
	});

});


//================================login.js=========================================
function loginAjax(event){
  event.preventDefault();

	var login_username = document.getElementById("login-username").value; // Get the username from the form
	var login_password = document.getElementById("login-password").value; // Get the password from the form

	// Make a URL-encoded string for passing POST data:
	var dataString = "username=" + encodeURIComponent(login_username) + "&password=" + encodeURIComponent(login_password);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "login.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("You've been Logged In!");
			loggedIn = true;
			changeButtonDisplay();
			updateCalendar();
		}else{
			alert("You were not logged in.  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}


document.getElementById("login_btn").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click

//=================================change button display=================================================

function changeButtonDisplay(){
		var loginDisplay = document.getElementById("login");
		var registerDisplay = document.getElementById("register");
		var addEventDisplay = document.getElementById("addEvent");
		var logoutDisplay = document.getElementById("logout");
		var shareMenuDisplay = document.getElementById("shareMenu");
		var shareDivDisplay = document.getElementById("shareDiv");
		var backDisplay = document.getElementById("back");


		if(loggedIn){
			  if(others){
					if (backDisplay.style.display === "none") {
							backDisplay.style.display = "block";
					}
					addEventDisplay.style.display = "none";
					logoutDisplay.style.display = "block";
					shareMenuDisplay.style.display = "none";
					shareDivDisplay.style.display = "none";
					loginDisplay.style.display = "none";
					registerDisplay.style.display = "none";

				}else{
					if (addEventDisplay.style.display === "none" || logoutDisplay.style.display === "none" || shareMenuDisplay.style.display === "none" || shareDivDisplay.style.display === "none") {
							addEventDisplay.style.display = "block";
							logoutDisplay.style.display = "block";
							shareMenuDisplay.style.display = "block";
							shareDivDisplay.style.display = "block";
					}
					loginDisplay.style.display = "none";
					registerDisplay.style.display = "none";
					backDisplay.style.display = "none";
				}
		}else{
				if (loginDisplay.style.display === "none" || loginDisplay.style.display === "none") {
						loginDisplay.style.display = "block";
						registerDisplay.style.display = "block";
				}
				addEventDisplay.style.display = "none";
				logoutDisplay.style.display = "none";
				shareMenuDisplay.style.display = "none";
				shareDivDisplay.style.display = "none";
				backDisplay.style.display = "none";
		}
}

//======================register.js==================================================
function registerAjax(event){
	var register_username = document.getElementById("register-username").value; // Get the username from the form
	var register_password = document.getElementById("register-password").value; // Get the password from the form

	// Make a URL-encoded string for passing POST data:
	var dataString = "username=" + encodeURIComponent(register_username) + "&password=" + encodeURIComponent(register_password);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "register.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Register successful! Please try to login now!");
		}else{
			alert("Register not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}

document.getElementById("register_btn").addEventListener("click", registerAjax, false); // Bind the AJAX call to button click

//======================addEvent.js==================================================
function addEventAjax(event){
	var addEvent_title = document.getElementById("add-event-title").value;
	var addEvent_description = document.getElementById("add-event-description").value;
	var addEvent_date = document.getElementById("add-event-date").value;
	var addEvent_time = document.getElementById("add-event-time").value;
	var addEvent_category = document.getElementById("addevent-category").value;

	// Make a URL-encoded string for passing POST data:
	var dataString = "title=" + encodeURIComponent(addEvent_title) +
										"&description=" + encodeURIComponent(addEvent_description) +
										"&date=" + encodeURIComponent(addEvent_date) +
										"&time=" + encodeURIComponent(addEvent_time) +
										"&category=" + encodeURIComponent(addEvent_category);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "addevent.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Add event success!");
			updateCalendar();
		}else{
			alert("Add not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
	if(friends.length !== 0){
		for(var i = 0; i < friends.length; i++){
				// Make a URL-encoded string for passing POST data:
				console.log("I am in here");

				dataString = dataString + "&name=" + encodeURIComponent(friends[i]);

				sendAjax(dataString);
		}
	}
}

function sendAjax(dataString){
	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "addGroupEvent.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			friends = [];
		}else{
			alert("Add not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}
document.getElementById("addEvent_btn").addEventListener("click", addEventAjax, false); // Bind the AJAX call to button click


//======================editEvent.js==================================================
function editEventAjax(event){
	var editEvent_title = document.getElementById("edit-event-title").value;
	var editEvent_description = document.getElementById("edit-event-description").value;
	var editEvent_date = document.getElementById("edit-event-date").value;
	var editEvent_time = document.getElementById("edit-event-time").value;
	var editEvent_category = document.getElementById("editevent-category").value;
	var id = document.getElementById("edit-event-id").innerHTML;

	// Make a URL-encoded string for passing POST data:
	var dataString = "title=" + encodeURIComponent(editEvent_title) +
										"&description=" + encodeURIComponent(editEvent_description) +
										"&date=" + encodeURIComponent(editEvent_date) +
										"&time=" + encodeURIComponent(editEvent_time) +
										"&category=" + encodeURIComponent(editEvent_category)+
										"&id=" + encodeURIComponent(id);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "editEvent.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Save event success!");
			updateCalendar();
		}else{
			alert("Save not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}

document.getElementById("editEvent_btn").addEventListener("click", editEventAjax, false); // Bind the AJAX call to button click

//======================editEvent.js==================================================
function deleteEventAjax(event){
	var id = document.getElementById("edit-event-id").innerHTML;
	// Make a URL-encoded string for passing POST data:
	var dataString = "id=" + encodeURIComponent(id);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "deleteEvent.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Delete event success!");
			updateCalendar();
		}else{
			alert("Delete not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}

document.getElementById("deleteEvent_btn").addEventListener("click", deleteEventAjax, false); // Bind the AJAX call to button click

//===========================logout========================================================================
function logoutAjax(event){
	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("GET", "logout.php", true);
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Logged out!");
			loggedIn = false;
			changeButtonDisplay();
			updateCalendar();
		}else{
			alert("Logout not successful!  "+jsonData.message);
		}
	}, false);
	xmlHttp.send(null);
}

document.getElementById("logout").addEventListener("click", logoutAjax, false); // Bind the AJAX call to button click

//===========================share calendar========================================================================
function getSharesAjax(event){
	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("GET", "getShares.php", true);
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object

		var dropDown = document.getElementById("shareItems");
		for(var i = 0; i < jsonData.id.length; i++){
			var litag = document.createElement("li");
			var atag = document.createElement("a");
			atag.appendChild(document.createTextNode(jsonData.name[i]));
			atag.setAttribute("class", "dropdown-item");
			atag.setAttribute("href", "#");
			atag.setAttribute("data-id",jsonData.id[i]);
			litag.appendChild(atag);
			dropDown.appendChild(litag);
			litag.addEventListener("click", sharedCalendarAjax, false);
		}
	}, false);
	xmlHttp.send(null);
}
//======================addEvent.js==================================================
function addShareAjax(event){
	var addUsername = document.getElementById("shareUser").value;

	// Make a URL-encoded string for passing POST data:
	var dataString = "username=" + encodeURIComponent(addUsername);

	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "addShare.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
		event.preventDefault();
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			alert("Add share success!");
			updateCalendar();
		}else{
			alert("Add not successful!  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}

document.getElementById("addShareUser_btn").addEventListener("click", addShareAjax, false); // Bind the AJAX call to button click

function sharedCalendarAjax(event){
	others = true;
	changeButtonDisplay();
	updateCalendar();
	var id = event.target.getAttribute('data-id');

	// Make a URL-encoded string for passing POST data:
	var dataString = "id=" + encodeURIComponent(id);

	 var xmlHttp = new XMLHttpRequest();
	 xmlHttp.open("POST", "getSharedEvents.php", true);
	 xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	 xmlHttp.addEventListener("load", function(event){
 		event.preventDefault();
 		var events = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(events.length !== 0){
			//////////////////////////////////////////////////////////////////
				var weeks = currentMonth.prevMonth().getWeeks();

				for(var w in weeks){
				 if (weeks.hasOwnProperty(w)) {
					var days = weeks[w].getDates();

					for(var d in days){
						if (days.hasOwnProperty(d)) {
							var queryString = "w"+w+"d"+d;
							var currentDay = document.getElementById(queryString);
							for(var i = 0; i < events.id.length; i++){
								var dateString = events.date[i] + " "+ events.time[i];
								var eventDay = new Date(dateString);
								if(eventDay.getDate() === days[d].getDate() &&
									 eventDay.getMonth() === days[d].getMonth() &&
									 eventDay.getFullYear() === days[d].getFullYear()
								){
									var ptag = document.createElement("p");
									ptag.appendChild(document.createTextNode(events.time[i] + " " + events.title[i]));
									ptag.setAttribute("class", events.category[i] + " event");
									ptag.setAttribute("data-toggle", "modal");
									ptag.setAttribute("data-target", "#readEventModal");
									ptag.setAttribute("data-id", events.id[i]);
									ptag.setAttribute("data-title", events.title[i]);
									ptag.setAttribute("data-description", events.description[i]);
									ptag.setAttribute("data-date", events.date[i]);
									ptag.setAttribute("data-time", events.time[i]);
									ptag.setAttribute("data-category", events.category[i]);
									currentDay.appendChild(ptag);

								}
							}
						}
					}
				 }
				}
			//////////////////////////////////////////////////////////
		} //bracket for if events !== NULL

   }, false);
	 xmlHttp.send(dataString);

}

function backToMine(event){
	others = false;
	changeButtonDisplay();
	updateCalendar();
}

document.getElementById("back").addEventListener("click", backToMine, false); // Bind the AJAX call to button click

function addFriend(event){
    var friendName = document.getElementById("add-friend").value;
		friends.push(friendName);
		var list = document.getElementById("friendList");
		var litag = document.createElement("li");
		litag.appendChild(document.createTextNode(friendName));
		list.appendChild(litag);
}
document.getElementById("addFriend_btn").addEventListener("click", addFriend, false); // Bind the AJAX call to button click

//======================get events=========================================================================
function getEvents(){
	 var xmlHttp = new XMLHttpRequest();
	 xmlHttp.open("GET", "getEvents.php", true);
	 xmlHttp.addEventListener("load", function(event){
 		event.preventDefault();
 		var events = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(events.length !== 0){
			//////////////////////////////////////////////////////////////////
				var weeks = currentMonth.prevMonth().getWeeks();

				for(var w in weeks){
				 if (weeks.hasOwnProperty(w)) {
					var days = weeks[w].getDates();

					for(var d in days){
						if (days.hasOwnProperty(d)) {
							var queryString = "w"+w+"d"+d;
							var currentDay = document.getElementById(queryString);
							for(var i = 0; i < events.id.length; i++){
								var dateString = events.date[i] + " "+ events.time[i];
								var eventDay = new Date(dateString);
								if(eventDay.getDate() === days[d].getDate() &&
									 eventDay.getMonth() === days[d].getMonth() &&
									 eventDay.getFullYear() === days[d].getFullYear()
								){
									var ptag = document.createElement("p");
									ptag.appendChild(document.createTextNode(events.time[i] + " " + events.title[i]));
									ptag.setAttribute("class", events.category[i] + " event");
									ptag.setAttribute("data-toggle", "modal");
									ptag.setAttribute("data-target", "#editEventModal");
									ptag.setAttribute("data-id", events.id[i]);
									ptag.setAttribute("data-title", events.title[i]);
									ptag.setAttribute("data-description", events.description[i]);
									ptag.setAttribute("data-date", events.date[i]);
									ptag.setAttribute("data-time", events.time[i]);
									ptag.setAttribute("data-category", events.category[i]);
									currentDay.appendChild(ptag);

								}
							}
						}
					}
				 }
				}
			//////////////////////////////////////////////////////////
		} //bracket for if events !== NULL

   }, false);
	 xmlHttp.send(null);

}


//======================update calendar====================================================================

function updateCalendar(){
	if(loggedIn && others === false){
		getEvents();
	}
	//change the month and year display on the calendar
	var tempMonth, tempYear;
	if(currentMonth.month === 0){
		 tempMonth = 12;
		 tempYear = currentMonth.year - 1;
	}else{
		 tempMonth = currentMonth.month;
		 tempYear = currentMonth.year;
	}

  month.innerHTML = tempMonth;
  year.innerHTML = tempYear;

	var weeks = currentMonth.prevMonth().getWeeks();

	for(var w in weeks){
	 if (weeks.hasOwnProperty(w)) {
		var days = weeks[w].getDates();

		for(var d in days){
			if (days.hasOwnProperty(d)) {
			var queryString = "w"+w+"d"+d;
			var currentDay = document.getElementById(queryString);

			if((days[d].getMonth() + 1) === tempMonth){
				currentDay.textContent = days[d].getDate();
				if (currentDay.classList.contains('notInMonth') ){
						currentDay.classList.remove('notInMonth');
				}
				currentDay.classList.add('inMonth');
			}else{
				currentDay.textContent = days[d].getDate();
				if (currentDay.classList.contains('inMonth') ){
						currentDay.classList.remove('inMonths');
				}
				currentDay.classList.add('notInMonth');
			}
		}
	 }
	}
}


	if(weeks.length <= 5){
		for(var i = 0; i < 7; i++){
			var queryString2 = "w5d"+i;
			var currentDay2 = document.getElementById(queryString2);
			currentDay2.textContent = " ";
		}
	}

}

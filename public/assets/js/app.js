// When the save button is clicked:
$(".save").on("click", function() {
	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "POST",
		url: "/articles/save/" + thisId,
	}).done(function() {
		alert("Article seccessfully saved!\n(Alerts will be replaced with nice modals if I have time)");
	})
})

// When the unsave button is clicked: 
$(".unsave").on("click", function() {
	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "POST",
		url: "/articles/unsave/" + thisId,
	}).done(function() {
		alert("Article successfully unsaved!\n(Alerts will be replaced with nice modals if I have time)");
		location.reload();
	})
})

// When we click any of the Submit buttons in the 'Add Note' modal: 
$(".submitnote").on("click", function() {
	var thisId = $(this).attr("data-id");
	$.ajax({
		method: "POST",
		url: "/articles/" + thisId,
		data: {
			// Getting the input value of the correct modal using the data-id ID
			body: $("#" + thisId + "input").val()
		}
	}).done(function(data) {
		console.log(data.note.body);
	})
})

// When we click the View Notes button:
$(".viewnotes").on("click", function() {
	var thisId = $(this).attr("data-id");
	console.log("You want to view notes for article: " + thisId)
	$.ajax({
		method: "GET",
		url: "/articles/" + thisId
	}).done(function(data) {
		console.log(data.note.body);
		$("#notebody").html("<ol><li>" + data.note.body + "</li></ol>")
	})
})




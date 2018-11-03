$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD2l5omOhmA9lIkKEvk-sTGjCklvuS1ejc",
        authDomain: "trainscheduler-b86ac.firebaseapp.com",
        databaseURL: "https://trainscheduler-b86ac.firebaseio.com",
        projectId: "trainscheduler-b86ac",
        storageBucket: "trainscheduler-b86ac.appspot.com",
        messagingSenderId: "1003238378421"
    };
    firebase.initializeApp(config);
    /////////////////////////////////////////////////////////////////////////////////////////
    var database = firebase.database();
    //Adding Fom Details in DB///////////////////////////////////////////////////////////////
    var index = 0;
    /////////////////////////////////////////////////////////////////////////////////////////
    $("#submit-train").on("click", function (event) {
        event.preventDefault();

        var name = $("#name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var firstTime = $("#first-train-time-input").val().trim();
        var frequency = $("#frequency-input").val().trim();

        console.log("name  " + name + destination + firstTime + frequency);

        database.ref("/schedule").push({
            name: name,
            destination: destination,
            firstTime: firstTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        $("#name-input").val("");
        $("#destination-input").val("");
        $("#first-train-time-input").val("");
        $("#frequency-input").val("");
        return false;
    });//End of Click Submit

    function removeRow() {
        $(".row-" + $(this).attr("data-index")).remove();
        database.ref().child($(this).attr("data-key")).remove();
    };

    //Adding Data in table
    database.ref("/schedule").orderByChild("dateAdded").on("child_added", function (childSnapshot) {

        var removeButton = $("<button>").html("<span class='glyphicon glyphicon-remove'></span>").addClass("removeButton").attr("data-index", index).attr("data-key", childSnapshot.key);

        var firstTime = childSnapshot.val().firstTime;
        var tFrequency = parseInt(childSnapshot.val().frequency);
        var firstTrain = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log(firstTrain);
        console.log(firstTime);
        var currentTime = moment();
        var currentTimeCalc = moment().subtract(1, "years");
        var diffTime = moment().diff(moment(firstTrain), "minutes");
        var tRemainder = diffTime % tFrequency;
        var minutesRemaining = tFrequency - tRemainder;
        var nextTRain = moment().add(minutesRemaining, "minutes").format("hh:mm A");
        var beforeCalc = moment(firstTrain).diff(currentTimeCalc, "minutes");
        var beforeMinutes = Math.ceil(moment.duration(beforeCalc).asMinutes());

        if ((currentTimeCalc - firstTrain) < 0) {
            nextTrain = childSnapshot.val().firstTime;
            console.log("Before First Train");
            minutesRemaining = beforeMinutes;
        }
        else {
            nextTrain = moment().add(minutesRemaining, "minutes").format("hh:mm A");
            minutesRemaining = tFrequency - tRemainder;
            console.log("Working");
        }

        console.log("index  " + index);

        var newRow = $("<tr>");
        newRow.addClass("row-" + index);
        var cell1 = $("<td>").text(childSnapshot.val().name);
        var cell2 = $("<td>").text(childSnapshot.val().destination);
        var cell3 = $("<td>").text(childSnapshot.val().frequency);
        var cell4 = $("<td>").text(nextTrain);
        var cell5 = $("<td>").text(minutesRemaining);
        var cell6 = $("<td>").append(removeButton);

        newRow
            .append(cell1)
            .append(cell2)
            .append(cell2)
            .append(cell3)
            .append(cell4)
            .append(cell5)
            .append(cell6)

        $("#Add-Schedule").append(newRow);

        index++;
        console.log(index);

    }, function (error) {

        console.log(error.code);

    });

    function submitRow() {
        var newName = $(".newName").val().trim();
        var newDestination = $(".newDestination").val().trim();
        var newFrequency = $(".newFrequency").val().trim();

        database.ref().child($(this).attr("data-key")).child("name").set(newName);
        database.ref().child($(this).attr("data-key")).child("destination").set(newDestination);
        database.ref().child($(this).attr("data-key")).child("frequency").set(newFrequency);

        $(".row-" + $(this).attr("data-index")).children().eq(1).html(newName);
        $(".row-" + $(this).attr("data-index")).children().eq(2).html(newDestination);
        $(".row-" + $(this).attr("data-index")).children().eq(3).html(newFrequency);
        $(this).toggleClass("updateButton").toggleClass("submitButton");
    };

    $(document).on("click", ".removeButton", removeRow);
    $(document).on("click", ".submitButton", submitRow);

})//End of document


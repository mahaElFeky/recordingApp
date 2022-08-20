let microphoneButton = document.getElementsByClassName("startRecording")[0];
let recordingControlButtonsContainer = document.getElementsByClassName("recordingIndicator")[0];
let stopRecordingButton = document.getElementsByClassName("stopRecording")[0];
let cancelRecordingButton = document.getElementsByClassName("cancelRecording")[0];
let audioElement = document.getElementsByClassName("audio-element")[0];
let audioElementSource = document.getElementsByClassName("audio-element")[0]
    .getElementsByTagName("source")[0];
let elapsedTimeTag = document.getElementsByClassName("elapsed-time")[0];
let childIdentity = document.getElementById("childIdentity");
let uplodedImgUrl;
let image = document.getElementById("image");



function getName(v) {
    let h2 = document.getElementById("titleName");
    h2.innerText = v;
    document.getElementById("nameOfChild").style.display = "none";
}

function getImage() {
    childIdentity.style.display = "block";
}

function readFile(input) {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        uplodedImgUrl = reader.result;
        console.log(uplodedImgUrl);
        image.classList.remove("source");
        image.src = uplodedImgUrl;
        childIdentity.style.display = "none";
    };
    reader.readAsDataURL(file);
}

//Controller

/** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
let audioRecordStartTime;
/** Stores the maximum recording time in hours to stop recording once maximum recording hour has been reached */
let maximumRecordingTimeInHours = 1;
/** Stores the reference of the setInterval function that controls the timer in audio recording*/
let elapsedTimeTimer;
/** Displays recording control buttons */

function handleDisplayingRecordingControlButtons() {
    //Hide the microphone button that starts audio recording
    microphoneButton.style.display = "none";
    //Display the recording control buttons
    recordingControlButtonsContainer.classList.remove("hide");
    // uploadedImage.style.display = "block";
    image.classList.add("animationInfo");
    //Handle the displaying of the elapsed recording time
    handleElapsedRecordingTime();
}

/** Hide the displayed recording control buttons */
function handleHidingRecordingControlButtons() {
    //Display the microphone button that starts audio recording
    microphoneButton.style.display = "block";
    //Hide the recording control buttons
    recordingControlButtonsContainer.classList.add("hide");
    image.classList.remove("animationInfo");
    //stop interval that handles both time elapsed and the red dot
    clearInterval(elapsedTimeTimer);
}


/** Starts the audio recording*/
function startAudioRecording() {
    window.navigator.userAgent;
    //If a previous audio recording is playing, pause it
    let recorderAudioIsPlaying = !audioElement.paused; // the paused property tells whether the media element is paused or not
    console.log("paused?", !recorderAudioIsPlaying);
    if (recorderAudioIsPlaying) {
        audioElement.pause();
    }
    //start recording using the audio recording API
    audioRecorder.start()
        .then(() => { //on success
            //store the recording start time to display the elapsed time according to it
            audioRecordStartTime = new Date();
            console.log(audioRecordStartTime);
            //display control buttons to offer the functionality of stop and cancel
            handleDisplayingRecordingControlButtons();
        })
        .catch(error => { //on error
            //No Browser Support Error
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                console.log("To record audio, use browsers like Chrome and Firefox.");
                displayBrowserNotSupportedOverlay();
            }

            //Error handling structure
            switch (error.name) {
                case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                    console.log("An AbortError has occured.");
                    break;
                case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotAllowedError has occured. User might have denied permission.");
                    break;
                case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotFoundError has occured.");
                    break;
                case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotReadableError has occured.");
                    break;
                case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                    console.log("A SecurityError has occured.");
                    break;
                case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A TypeError has occured.");
                    break;
                case 'InvalidStateError': //error from the MediaRecorder.start
                    console.log("An InvalidStateError has occured.");
                    break;
                case 'UnknownError': //error from the MediaRecorder.start
                    console.log("An UnknownError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
        });

}


// function startAudioRecording() {
function StopAudioRecording() {


    //stop the recording using the audio recording API
    console.log("Stopping Audio Recording...")
    audioRecorder.stop()
        .then(audioAsblob => { //stopping makes promise resolves to the blob file of the recorded audio
            console.log("stopped with audio Blob:", audioAsblob);
            playAudio(audioAsblob);
            handleHidingRecordingControlButtons();
            //...
            computeElapsedTime(audioRecordStartTime);
        })

    .catch(error => {
        //Error handling structure
        switch (error.name) {
            case 'InvalidStateError': //error from the MediaRecorder.stop
                console.log("An InvalidStateError has occured.");
                break;
            default:
                console.log("An error occured with the error name " + error.name);
        };

    });

}
/** Cancel the currently started audio recording */
function cancelAudioRecording() {
    console.log("Canceling audio...");
    //cancel the recording using the audio recording API
    audioRecorder.cancel();

    //Do something after audio recording is cancelled
}

function createSourceForAudioElement() {
    audioElement.style.display = "block";

    let sourceElement = document.createElement("source");
    audioElement.appendChild(sourceElement);

    audioElementSource = sourceElement;
}

/** Plays recorded audio using the audio element in the HTML document
 * param {Blob} recorderAudioAsBlob - recorded audio as a Blob Object 
 */
function playAudio(recorderAudioAsBlob) {
    //read content of files (Blobs) asynchronously
    let reader = new FileReader();
    console.log(reader);

    //once content has been read
    reader.onload = (e) => {
        //store the base64 URL that represents the URL of the recording audio
        let base64URL = e.target.result;
        console.log(base64URL);

        //If this is the first audio playing, create a source element
        //as pre populating the HTML with a source of empty src causes error
        if (!audioElementSource) //if its not defined create it (happens first time only)
            createSourceForAudioElement();

        //set the audio element's source using the base64 URL
        audioElementSource.src = base64URL;

        //set the type of the audio element based on the recorded audio's Blob type
        let BlobType = recorderAudioAsBlob.type.includes(";") ?
            recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
        audioElementSource.type = BlobType

        //call the load method as it is used to update the audio element after changing the source or other settings
        audioElement.load();

        //play the audio after successfully setting new src and type that corresponds to the recorded audio
        console.log("Playing audio...");
        audioElement.play();

        //Display text indicator of having the audio play in the background
        displayTextIndicatorOfAudioPlaying();
    };

    //read content and convert it to a URL (base64)
    reader.readAsDataURL(recorderAudioAsBlob);
    // audioSourceElement.src = recorderAudioAsBlob;
    // audioElement.appendChild(audioElementSource);
    // console.log(audioSourceElement);
}

/** Computes the elapsed recording time since the moment the function is called in the format h:m:s*/
function handleElapsedRecordingTime() {
    //display inital time when recording begins
    displayElapsedTimeDuringAudioRecording("00:00");

    //create an interval that compute & displays elapsed time, as well as, animate red dot - every second
    elapsedTimeTimer = setInterval(() => {
        //compute the elapsed time every second
        let elapsedTime = computeElapsedTime(audioRecordStartTime); //pass the actual record start time
        //display the elapsed time
        displayElapsedTimeDuringAudioRecording(elapsedTime);
    }, 1000); //every second
}

/** Display elapsed time during audio recording
 * @param {String} elapsedTime - elapsed time in the format mm:ss or hh:mm:ss 
 */
function displayElapsedTimeDuringAudioRecording(elapsedTime) {
    //1. display the passed elapsed time as the elapsed time in the elapsedTime HTML element
    elapsedTimeTag.innerHTML = elapsedTime;

    //2. Stop the recording when the max number of hours is reached
    if (elapsedTimeReachedMaximumNumberOfHours(elapsedTime)) {
        stopAudioRecording();
    }
}

/**
 * @param {String} elapsedTime - elapsed time in the format mm:ss or hh:mm:ss  
 * @returns {Boolean} whether the elapsed time reached the maximum number of hours or not
 */
function elapsedTimeReachedMaximumNumberOfHours(elapsedTime) {
    //Split the elapsed time by the symbo :
    let elapsedTimeSplitted = elapsedTime.split(":");

    //Turn the maximum recording time in hours to a string and pad it with zero if less than 10
    let maximumRecordingTimeInHoursAsString = maximumRecordingTimeInHours < 10 ? "0" +
        maximumRecordingTimeInHours : maximumRecordingTimeInHours.toString();

    //if it the elapsed time reach hours and also reach the maximum recording time in hours return true
    if (elapsedTimeSplitted.length === 3 && elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString)
        return true;
    else //otherwise, return false
        return false;
}

/** Computes the elapsedTime since the moment the function is called in the format mm:ss or hh:mm:ss
 * @param {String} startTime - start time to compute the elapsed time since
 * @returns {String} elapsed time in mm:ss format or hh:mm:ss format, if elapsed hours are 0.
 */
function computeElapsedTime(startTime) {
    //record end time
    let endTime = new Date();

    //time difference in ms
    let timeDiff = endTime - startTime;

    //convert time difference from ms to seconds
    timeDiff = timeDiff / 1000;

    //extract integer seconds that dont form a minute using %
    let seconds = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)

    //pad seconds with a zero if neccessary
    seconds = seconds < 10 ? "0" + seconds : seconds;

    //convert time difference from seconds to minutes using %
    timeDiff = Math.floor(timeDiff / 60);

    //extract integer minutes that don't form an hour using %
    let minutes = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds
    minutes = minutes < 10 ? "0" + minutes : minutes;

    //convert time difference from minutes to hours
    timeDiff = Math.floor(timeDiff / 60);

    //extract integer hours that don't form a day using %
    let hours = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds

    //convert time difference from hours to days
    timeDiff = Math.floor(timeDiff / 24);

    // the rest of timeDiff is number of days
    let days = timeDiff; //add days to hours

    let totalHours = hours + (days * 24);
    totalHours = totalHours < 10 ? "0" + totalHours : totalHours;

    if (totalHours === "00") {
        return minutes + ":" + seconds;
    } else {
        return totalHours + ":" + minutes + ":" + seconds;
    }
}
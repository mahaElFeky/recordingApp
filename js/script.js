// child identification for name and image
function getName(v) {
    let h2 = document.getElementById("titleName");
    h2.innerText = v;
    document.getElementById("nameOfChild").style.display = "none";
}
let childIdentity = document.getElementById("childIdentity");

function getImage() {
    childIdentity.style.display = "block";
}

let image = document.getElementById("image");

function readFile(input) {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let uplodedImgUrl = reader.result;
        console.log(uplodedImgUrl);
        image.classList.remove("source");
        image.src = uplodedImgUrl;
        childIdentity.style.display = "none";
    };
    reader.readAsDataURL(file);
}


// menu for all Quran surahs
let menuToggel = "false";
let menu = document.getElementById("menu");

function openMenu() {
    if (menuToggel) {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
    menuToggel = !menuToggel;
}

function outsideClick() {
    menu.style.display = "none";
    menuToggel = !menuToggel;

}
let suraAudio = document.getElementById("surahAudio");

function playSurah(surah) {
    let surahName = document.getElementById("surahName");
    surahName.innerHTML = surah.name;
    suraAudio.src = surah.value;
    menu.style.display = "none";
    menuToggel = !menuToggel;

}

//Controller
/** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
let audioRecordStartTime;
/** Stores the reference of the setInterval function that controls the timer in audio recording*/
let elapsedTimeTimer;
/** Displays recording control buttons */
let recordTryNumber = 0;

window.addEventListener('DOMContentLoaded', () => {
    const getMic = document.getElementById('mic');
    const recordButton = document.getElementById('record');
    const pauseBtn = document.getElementById('pause');

    if ('MediaRecorder' in window) {
        getMic.addEventListener('click', async() => {
            getMic.setAttribute('hidden', 'hidden');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                        // video: { width: 1280, height: 720 }
                        // for front camera in mobile: { audio: true, video: { facingMode: "user" } }
                        //rear camera { audio: true, video: { facingMode: { exact: "environment" } } }
                        // check { video: { facingMode: (front? "user" : "environment") } };
                });
                const mimeType = 'audio/webm';
                let chunks = [];
                const recorder = new MediaRecorder(stream, { type: mimeType });
                recorder.addEventListener('dataavailable', event => {
                    if (typeof event.data === 'undefined') return;
                    if (event.data.size === 0) return;
                    chunks.push(event.data);
                });
                recorder.addEventListener('stop', () => {
                    const recording = new Blob(chunks, {
                        type: mimeType
                    });
                    renderRecording(recording);
                    chunks = [];
                });
                recordButton.removeAttribute('hidden');
                pauseBtn.removeAttribute('hidden');

                recordButton.addEventListener('click', () => {
                    if (recorder.state === 'inactive') {
                        recorder.start();
                        suraAudio.play();
                        image.classList.add("animationInfo");
                        audioRecordStartTime = new Date();
                        handleElapsedRecordingTime();
                        // recordButton.innerText = 'وقف التسجيل';
                        recordButton.src = "images/stop.png";

                    } else {
                        recorder.stop();
                        suraAudio.pause();
                        image.classList.remove("animationInfo");
                        computeElapsedTime(audioRecordStartTime);
                        clearInterval(elapsedTimeTimer);
                        // recordButton.innerText = 'تسجيل';
                        recordButton.src = "images/record.png";

                        recordTryNumber++;
                    }
                });
                pauseBtn.addEventListener('click', () => {
                    if (recorder.state === 'paused') {
                        recorder.resume();
                        suraAudio.play();
                    } else {
                        recorder.pause();
                        suraAudio.pause();
                    }
                });
            } catch {
                renderError(
                    'You denied access to the microphone so this demo will not work.'
                );
            }
        });
    } else {
        renderError(
            "Sorry, your browser doesn't support the MediaRecorder API, so this demo will not work."
        );
    }
});

function renderError(message) {
    const main = document.querySelector('main');
    main.innerHTML = `<div class="error"><p>${message}</p></div>`;
}

function renderRecording(blob) {
    const blobUrl = URL.createObjectURL(blob);
    const li = document.createElement('li');
    const audio = document.createElement('audio');
    const anchor = document.createElement('a');
    const list = document.getElementById('recordings');
    const downloadIcon = document.createElement('img');
    const deleteAudio = document.createElement('img');

    downloadIcon.src = 'images/download.png';
    // downloadIcon.id = "downloadIconImg";
    downloadIcon.classList.add("buttonIcons");
    anchor.appendChild(downloadIcon);
    audio.id = "recordAudio";
    console.log(downloadIcon);
    anchor.setAttribute('href', blobUrl);
    const now = new Date();
    anchor.setAttribute(
        'download',
        `record no.${recordTryNumber}- ${now
    .getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now
    .getDay()
    .toString()
    .padStart(2, '0')}  ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}.webm`);
    console.log(anchor);
    audio.setAttribute('src', blobUrl);
    audio.setAttribute('controls', 'controls');
    // console.log(audio);

    // deleteAudio.innerHTML = 'delete';
    deleteAudio.classList.add("buttonIcons");
    deleteAudio.src = 'images/delete.png';

    // deleteAudio.style.cursor = 'pointer';
    // deleteAudio.style.paddingLeft = "5px";
    // deleteAudio.style.paddingRight = "5px";
    // anchor.style.paddingLeft = "5px";


    li.appendChild(audio);
    li.appendChild(deleteAudio);
    li.appendChild(anchor);
    list.appendChild(li);
    deleteAudio.addEventListener('click', () => {
        list.removeChild(li);
    });
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

function displayElapsedTimeDuringAudioRecording(elapsedTime) {
    //1. display the passed elapsed time as the elapsed time in the elapsedTime HTML element
    let elapsedTimeTag = document.getElementsByClassName("elapsed-time")[0];
    elapsedTimeTag.innerHTML = elapsedTime;

}

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


// In JavaScript, padStart() is a string method that is used to pad the start of a string 
// with a specific string to a certain length. This type of padding is sometimes called left pad or lpad.
//  Because the padStart() method is a method of the String object, it must be invoked through a particular
//  instance of the String class.
// string.padStart(length [, pad_string]);
// const time = new Date;
// const Y = time.getFullYear()
// const M = (time.getMonth() + 1).toString().padStart(2, '0')
// to pad the start of M string with '0' until it is the desired length of 2 characters 
// so if it is = 2 characters then 0 will not added.
// https://www.techonthenet.com/js/string_padstart.php


// console.log(`${Y}-${M}-${D} ${h}:${m}:${s}`);
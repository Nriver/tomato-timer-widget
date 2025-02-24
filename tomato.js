/*
 * Pomodoro timer for Trilium Notes.
 * A gift designed for me, who suffers from lumbar disc herniation, reminding me to take a break every half an hour.
 * 
 * 1. You can tweak configs in the `config` subnote.
 * 2. i18n support, check the `translations` subnote for the translated texts.
 * 3. There will be a notification tells you to rest :)
 * 4. Buttons comes with sound effects so does the notification alarm.
 */

// Access translations based on the selected language
const i18n = key => translations.trans[config.lang][key];

const TPL = `
<audio id="tomatoButtonSound" src="custom/sound/tomatoButton.mp3"></audio>
<audio id="tomatoAlarmSound" src="custom/sound/tomatoAlarm.mp3"></audio>

<div id="tomato-bar" class="tomato">
    <center><div id="status">` + i18n('working') + `</div></center>
    <center><div id="timer">--:--</div></center>
    <button id="workButton">` + i18n('doWork') + `</button>
    <button id="restButton">` + i18n('takeBreak') + `</button>
    <button id="startButton">` + i18n('start') + `</button>
    <button id="pauseButton">` + i18n('pause') + `</button>
    <button id="resetButton">` + i18n('reset') + `</button>
</div>
`;

const styles = `
#tomato-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-top: 1px solid #555555;
    border-bottom: 1px solid #555555;
    contain: none;
    white-space: nowrap;
}

#status {
    font-size: 18px;
    width: auto;
    padding-left: 10px;
    padding-right: 10px;
    font-weight: bold;
}

#timer {
    font-size: 24px;
    width: 70px;
    border: 2px solid #FF6347;
    background-color: #transparent;
    border-radius: 10px;
}

.tomato button {
    background-color: #a52a2a;
    border-radius: 5px;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    color: #ffffff;
}

.tomato button:hover {
    background-color: #800000;
}

#workButton {
    background-color: #2196F3;
}

#workButton:hover {
    background-color: #1e87db;
}

#restButton {
    background-color: #4CAF50;
}

#restButton:hover {
    background-color: #45a049;
}

`;

var isInit = true;
var timerInterval;

class TomatoWidget extends api.NoteContextAwareWidget {
    get position() { return 200; }
    get parentWidget() { return "center-pane"; }

    constructor() {
        super();
        this.title = "";
    }

    isEnabled() {
        if (!super.isEnabled()) return false;
        const widgetDisable = api.startNote.hasLabel("disable");
        return !widgetDisable;
    }

    doRender() {
        this.$widget = $(TPL);
        this.timer = this.$widget.find("#timer");
        this.status = this.$widget.find("#status");
        const tomatoStatus = localStorage.getItem('tomatoStatus');
        if (tomatoStatus) {
            this.status.text(i18n(tomatoStatus));
        }
        this.cssBlock(styles);

        return this.$widget;
    }

    async refreshWithNote() {
        // prevent duplicate timer initialization
        if (!isInit) {
            return;
        }
        isInit = false;
        
        const WORK_TIME = config.WORK_TIME;
        const BREAK_TIME = config.BREAK_TIME;
        
        let isWorking = localStorage.getItem('tomatoStatus') ? localStorage.getItem('tomatoStatus') == 'working' : true;
        let time = localStorage.getItem('tomatoTime') ? parseInt(localStorage.getItem('tomatoTime')): WORK_TIME;
        let running = false;
        const timerDisplay = document.getElementById('timer');
        const startButton = document.getElementById('startButton');
        const pauseButton = document.getElementById('pauseButton');
        const resetButton = document.getElementById('resetButton');
        
        const workButton = document.getElementById('workButton');
        const restButton = document.getElementById('restButton');
        
        const tomatoButtonSound = document.getElementById("tomatoButtonSound");
        const tomatoAlarmSound = document.getElementById("tomatoAlarmSound");
        const playButtonSound = () => {
            if (config.enableSound){
                // Reset the play time to enable correct and smooth playback when the button is repeatedly and rapidly pressed
                tomatoButtonSound.currentTime = 0;
                tomatoButtonSound.play();
            }
        }
        const playAlarmSound = () => {
            if (config.enableSound){
                tomatoAlarmSound.currentTime = 0;
                tomatoAlarmSound.play();
            }
        }
        
        const startTimer = () => {
            if (!running) {
                running = true;
                timerInterval = setInterval(updateTimer, 1000);
            }
        };

        const pauseTimer = () => {
            playButtonSound();
            running = false;
            clearInterval(timerInterval);
        };

        const resetTimer = () => {
            playButtonSound();
            running = false;
            clearInterval(timerInterval);
            time = isWorking ? WORK_TIME : BREAK_TIME; // 25 minutes for work and 5 minutes for break
            localStorage.setItem('tomatoTime', time);
            updateTimer();
        };

        const restTimer = () => {
            playButtonSound();
            running = false;
            clearInterval(timerInterval);
            time = BREAK_TIME; // 5 minutes break
            isWorking = false; // set rest status
            localStorage.setItem('tomatoTime', time);
            localStorage.setItem('tomatoStatus', 'resting');
            this.status.text(i18n(localStorage.getItem('tomatoStatus')));
            updateTimer();
            startTimer();
        };
        
        const workTimer = () => {
            playButtonSound();
            running = false;
            clearInterval(timerInterval);
            time = WORK_TIME; // 25 minutes work
            isWorking = true; // set work status
            localStorage.setItem('tomatoTime', time);
            localStorage.setItem('tomatoStatus', 'working');
            this.status.text(i18n(localStorage.getItem('tomatoStatus')));
            updateTimer();
            startTimer();
        };


        const updateTimer = () => {
            const minutes = Math.floor(time / 60);
            let seconds = time % 60;
            seconds = seconds < 10 ? '0' + seconds : seconds; // add leading zero if necessary

            timerDisplay.textContent = `${minutes}:${seconds}`;

            if (time > 0) {
                time--;
                localStorage.setItem('tomatoTime', time);
            } else {
                clearInterval(timerInterval);
                if (isWorking) {
                    isWorking = false;
                    time = BREAK_TIME; // 5 minutes break
                    localStorage.setItem('tomatoStatus', 'resting');
                    this.status.text(i18n(localStorage.getItem('tomatoStatus')));
                    // System level notification, incase trilium is minimized
                    new window.Notification(i18n('restNotificationTitle'), {
                        body: i18n('restNotificationBody')
                    });
                    // Popup message inside trilium window
                    api.showMessage(i18n('takeBreakMessage'));
                    restTimer();
                    playAlarmSound();
                } else {
                    isWorking = true;
                    time = WORK_TIME; // 25 minutes work
                    localStorage.setItem('tomatoTime', time);
                    localStorage.setItem('tomatoStatus', 'working');
                    this.status.text(i18n(localStorage.getItem('tomatoStatus')));
                    new window.Notification(i18n('workNotificationTitle'), {
                        body: i18n('workNotificationBody')
                    });
                    api.showMessage(i18n('timeToDoSomething'));
                    workTimer();
                    playAlarmSound();
                }
                startTimer();
            }
        };

        startButton.addEventListener('click', () => {
            playButtonSound();
            startTimer();
        });
        pauseButton.addEventListener('click', pauseTimer);
        resetButton.addEventListener('click', resetTimer);
        workButton.addEventListener('click', workTimer);
        restButton.addEventListener('click', restTimer);
        

        // auto start timer when startup
        if (config.autoStartCountDown){
            startTimer();
        }
    }

    async entitiesReloadedEvent({ loadResults }) {

    }

}

module.exports = new TomatoWidget();

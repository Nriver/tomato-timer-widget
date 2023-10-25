// Please do not modify the name of this note.

// Change language name to anyone you like in the translations file. For example, 'cn' for Chinese, 'en' for english.
var lang = 'en';
// Set true to enable sound effects, false to disable it.
var enableSound = true;
// Start count down automatically when you open Trilium.
var autoStartCountDown = true;

const WORK_TIME = 1500; //1500s = 25min
const BREAK_TIME = 300; // 300s = 5min

// Don't forget to expose configs to the main js file
module.exports = {
    enableSound,
    autoStartCountDown,
    lang,
    WORK_TIME,
    BREAK_TIME
}
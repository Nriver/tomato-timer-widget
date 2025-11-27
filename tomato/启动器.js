// will add a launcher to the left sidebar
api.createOrUpdateLauncher({
    id: 'Tomato',
    type: 'script',
    title: 'Show/Hide Tomato',
    icon: 'bx-timer',
    keyboardShortcut: 'alt+z',
    scriptNoteId: api.currentNote.getRelationValue('ToggleTomato'),
    isVisible: true
});
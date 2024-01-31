let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

  // activeNote is used to keep track of the note in the textarea
  let activeNote = {};

  const getNotes = () => {
    return fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  const saveNote = (note) => {
    return fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    });
  };

  const deleteNote = (id) => {
    return fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(clearBtn);
    activeNote = {};
    // Clear the input fields
    noteTitle.value = '';
    noteText.value = '';
  };
    if (activeNote.id) {
      show(newNoteBtn);
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      hide(newNoteBtn);
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
    }
  saveNoteBtn.addEventListener('click', handleNoteSave);
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value
    };
    saveNote(newNote)
      .then(() => {
        getAndRenderNotes();
        activeNote = {};
        renderActiveNote();
      })
      .catch(error => {
        console.error('Error saving note:', error);
      });
  };

  // Delete the clicked note
  const handleNoteDelete = (e) => {
    // Prevents the click listener for the list from being called when the button inside of it is clicked
    e.stopPropagation();

    const noteId = JSON.parse(e.target.parentElement.dataset.note).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId)
      .then(() => {
        getAndRenderNotes();
        renderActiveNote();
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      });
  };

  // Sets the activeNote and displays it
  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.dataset.note);
    renderActiveNote();
  };

  // Sets the activeNote to an empty object and allows the user to enter a new note
  newNoteBtn.addEventListener('click', handleNewNoteView);
  const handleNewNoteView = (e) => {
    activeNote = {};
    show(clearBtn);
    renderActiveNote();
  };

  // Renders the appropriate buttons based on the state of the form
  const handleRenderBtns = () => {
    show(clearBtn);
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  // Render the list of note titles
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    noteList.innerHTML = ''; // Clear the list before rendering

    if (jsonNotes.length === 0) {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.textContent = 'No saved Notes';
      noteList.appendChild(li);
    } else {
      jsonNotes.forEach((note) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.dataset.note = JSON.stringify(note);

        const spanEl = document.createElement('span');
        spanEl.classList.add('list-item-title');
        spanEl.innerText = note.title;
        spanEl.addEventListener('click', handleNoteView);
        li.appendChild(spanEl);

        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
        delBtnEl.addEventListener('click', handleNoteDelete);
        li.appendChild(delBtnEl);

        noteList.appendChild(li);
      });
    }
  };

  // Gets notes from the db and renders them to the sidebar
  const getAndRenderNotes = () => {
    getNotes()
      .then(renderNoteList)
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  };

  if (window.location.pathname === '/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    noteForm.addEventListener('input', handleRenderBtns);
    getAndRenderNotes();
  };

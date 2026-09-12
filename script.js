const STORAGE_KEY = 'todo-list-items';
const defaultTasks = [
  { id: crypto.randomUUID(), text: 'Review project goals', completed: false },
  { id: crypto.randomUUID(), text: 'Finish the weekly tasks', completed: true },
  { id: crypto.randomUUID(), text: 'Drink water and take a short break', completed: false },
];

const state = {
  tasks: loadTasks(),
  filter: 'all',
};

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const taskCount = document.querySelector('#task-count');
const clearCompletedBtn = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter');

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved;
    }
  } catch (error) {
    console.warn('Unable to load saved tasks:', error);
  }

  return defaultTasks;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function getFilteredTasks() {
  switch (state.filter) {
    case 'active':
      return state.tasks.filter((task) => !task.completed);
    case 'completed':
      return state.tasks.filter((task) => task.completed);
    case 'all':
    default:
      return state.tasks;
  }
}

function updateTaskCount() {
  const remaining = state.tasks.filter((task) => !task.completed).length;
  const total = state.tasks.length;

  taskCount.textContent = `${remaining} of ${total} task${total === 1 ? '' : 's'} left`;
}

function renderTasks() {
  const tasks = getFilteredTasks();

  if (!tasks.length) {
    list.innerHTML = `
      <li class="empty-state">
        ${state.filter === 'all'
          ? 'No tasks yet. Add one to get started.'
          : `No ${state.filter} tasks.`}
      </li>
    `;
    updateTaskCount();
    return;
  }

  list.innerHTML = tasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="todo-main">
            <input
              class="todo-checkbox"
              type="checkbox"
              aria-label="Mark task complete"
              ${task.completed ? 'checked' : ''}
            />
            <span class="todo-text">${escapeHtml(task.text)}</span>
          </div>
          <button class="delete-btn" type="button" aria-label="Delete task">Delete</button>
        </li>
      `
    )
    .join('');

  updateTaskCount();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    input.focus();
    return;
  }

  state.tasks.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
  });

  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
}

function toggleTask(id) {
  state.tasks = state.tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(input.value);
});

list.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-btn');
  if (deleteButton) {
    const taskItem = deleteButton.closest('.todo-item');
    if (taskItem) {
      deleteTask(taskItem.dataset.id);
    }
    return;
  }

  const checkbox = event.target.closest('.todo-checkbox');
  if (checkbox) {
    const taskItem = checkbox.closest('.todo-item');
    if (taskItem) {
      toggleTask(taskItem.dataset.id);
    }
  }
});

list.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.todo-checkbox');
  if (checkbox) {
    const taskItem = checkbox.closest('.todo-item');
    if (taskItem) {
      toggleTask(taskItem.dataset.id);
    }
  }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle('active', filterButton === button);
    });

    renderTasks();
  });
});

renderTasks();

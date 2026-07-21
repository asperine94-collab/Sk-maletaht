// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initElements();
        this.loadTodos();
        this.attachEventListeners();
        this.render();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.deleteAllBtn = document.getElementById('deleteAll');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.deleteAllBtn.addEventListener('click', () => this.deleteAllTodos());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            alert('Please enter a task');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        this.todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        if (this.todos.some(t => t.completed)) {
            if (confirm('Delete all completed tasks?')) {
                this.todos = this.todos.filter(todo => !todo.completed);
                this.saveTodos();
                this.render();
            }
        } else {
            alert('No completed tasks to clear');
        }
    }

    deleteAllTodos() {
        if (this.todos.length === 0) {
            alert('No tasks to delete');
            return;
        }
        if (confirm('Delete all tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalCount.textContent = this.todos.length;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.todoList.style.display = 'block';
            
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.dataset.id = todo.id;
                
                if (this.editingId === todo.id) {
                    li.classList.add('edit-mode');
                    li.innerHTML = `
                        <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}" autofocus>
                        <div class="todo-actions">
                            <button class="save-btn">Save</button>
                            <button class="cancel-btn">Cancel</button>
                        </div>
                    `;
                    
                    const editInput = li.querySelector('.edit-input');
                    const saveBtn = li.querySelector('.save-btn');
                    const cancelBtn = li.querySelector('.cancel-btn');
                    
                    const saveEdit = () => {
                        this.editTodo(todo.id, editInput.value);
                        this.editingId = null;
                    };
                    
                    saveBtn.addEventListener('click', saveEdit);
                    editInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') saveEdit();
                    });
                    
                    cancelBtn.addEventListener('click', () => {
                        this.editingId = null;
                        this.render();
                    });
                } else {
                    li.innerHTML = `
                        <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="priority ${todo.priority}">${todo.priority}</span>
                        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                        <div class="todo-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn-item">Delete</button>
                        </div>
                    `;
                    
                    const checkbox = li.querySelector('.checkbox');
                    const editBtn = li.querySelector('.edit-btn');
                    const deleteBtn = li.querySelector('.delete-btn-item');
                    
                    checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
                    editBtn.addEventListener('click', () => {
                        this.editingId = todo.id;
                        this.render();
                    });
                    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
                }
                
                this.todoList.appendChild(li);
            });
        }
        
        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading todos:', e);
                this.todos = [];
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

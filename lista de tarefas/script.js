document.addEventListener('DOMContentLoaded', () => {

    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
        setInterval(updateClock, 1000);
        updateClock();
    }

    const pomodoroTimerEl = document.getElementById('pomodoro-timer');
    const pomodoroStateEl = document.getElementById('pomodoro-state');
    const startBtn = document.getElementById('pomodoro-start');
    const pauseBtn = document.getElementById('pomodoro-pause');
    const resetBtn = document.getElementById('pomodoro-reset');
    const workTimeInput = document.getElementById('work-time-input');
    const breakTimeInput = document.getElementById('break-time-input');
    const settingsBtn = document.getElementById('pomodoro-settings-btn');
    
    let workTime = workTimeInput.value * 60;
    let breakTime = breakTimeInput.value * 60;
    let timerInterval = null;
    let currentTime = workTime;
    let isPaused = true;
    let isWorkSession = true;

    function setCustomTimes() {
        const newWorkTime = parseInt(workTimeInput.value);
        const newBreakTime = parseInt(breakTimeInput.value);
        if (newWorkTime > 0 && newBreakTime > 0) {
            workTime = newWorkTime * 60;
            breakTime = newBreakTime * 60;
            alert('Tempos atualizados!');
            resetTimer();
        } else {
            alert('Por favor, insira valores válidos e positivos.');
        }
    }
    settingsBtn.addEventListener('click', setCustomTimes);

    function updateTimerDisplay() {
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        pomodoroTimerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function switchState() {
        isWorkSession = !isWorkSession;
        currentTime = isWorkSession ? workTime : breakTime;
        pomodoroStateEl.textContent = isWorkSession ? "Hora de focar!" : "Faça uma pausa curta.";
        updateTimerDisplay();
    }

    function tick() {
        currentTime--;
        updateTimerDisplay();
        if (currentTime < 0) {
            clearInterval(timerInterval);
            new Audio('https://www.soundjay.com/buttons/sounds/button-7.mp3').play();
            switchState();
            isPaused = true;
        }
    }

    startBtn.addEventListener('click', () => {
        if (isPaused) {
            isPaused = false;
            timerInterval = setInterval(tick, 1000);
            pomodoroStateEl.textContent = isWorkSession ? "Hora de focar!" : "Faça uma pausa curta.";
        }
    });

    pauseBtn.addEventListener('click', () => {
        isPaused = true;
        clearInterval(timerInterval);
        pomodoroStateEl.textContent = "Pausado.";
    });

    function resetTimer() {
        isPaused = true;
        clearInterval(timerInterval);
        isWorkSession = true;
        currentTime = workTime;
        updateTimerDisplay();
        pomodoroStateEl.textContent = "Pronto para começar?";
    }
    resetBtn.addEventListener('click', resetTimer);
    updateTimerDisplay();

    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('category-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const completedTaskList = document.getElementById('completed-task-list');
    const toggleCompletedBtn = document.getElementById('toggle-completed-btn');
    const totalCompletedTasksEl = document.getElementById('total-completed-tasks');
    const pessoalSegment = document.getElementById('pessoal-segment');
    const trabalhoSegment = document.getElementById('trabalho-segment');
    const estudoSegment = document.getElementById('estudo-segment');
    const pessoalStats = document.getElementById('pessoal-stats');
    const trabalhoStats = document.getElementById('trabalho-stats');
    const estudoStats = document.getElementById('estudo-stats');

    function handleTaskCompletion(li, checkbox) {
        if (checkbox.checked) {
            li.dataset.completionDate = new Date().toISOString();
            li.classList.add('disintegrating');
    
            setTimeout(() => {
                completedTaskList.appendChild(li);
                li.classList.remove('disintegrating');
                saveTasks();
            }, 400);
    
        } else {
            delete li.dataset.completionDate;
            li.classList.add('disintegrating');
    
            setTimeout(() => {
                taskList.appendChild(li);
                li.classList.remove('disintegrating');
                saveTasks();
            }, 400);
        }
    }

    addTaskBtn.addEventListener('click', () => addTask());
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.category);
        });
    });

    function addTask(taskData = {}, silent = false) {
        const {
            text = null,
            category = null,
            isCompleted = false,
            isPriority = false,
            completionDate = null
        } = taskData;
    
        const taskTextValue = text || taskInput.value.trim();
        const categoryValue = category || categorySelect.value;
        if (taskTextValue === '') return;
    
        const li = document.createElement('li');
        li.className = categoryValue;
        if (isPriority) li.classList.add('priority');
        if (completionDate) li.dataset.completionDate = completionDate;
    
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', () => handleTaskCompletion(li, checkbox));
        li.appendChild(checkbox);
    
        const taskContent = document.createElement('span');
        taskContent.textContent = taskTextValue;
        taskContent.className = 'task-content';
        li.appendChild(taskContent);
    
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        const categoryTag = document.createElement('span');
        categoryTag.textContent = categoryValue;
        categoryTag.className = 'category-tag';
        const priorityBtn = document.createElement('button');
        priorityBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        priorityBtn.addEventListener('click', () => {
            li.classList.toggle('priority');
            saveTasks();
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
            li.classList.add('disintegrating');
            li.addEventListener('animationend', () => {
                li.remove();
                saveTasks();
            }, { once: true });
        });
        taskActions.appendChild(categoryTag);
        taskActions.appendChild(priorityBtn);
        taskActions.appendChild(deleteBtn);
        li.appendChild(taskActions);
    
        if (isCompleted) {
            completedTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    
        if (!silent) {
            taskInput.value = '';
            taskInput.focus();
            saveTasks();
        }
    }

    function filterTasks(category) {
        taskList.querySelectorAll('li').forEach(task => {
            if (category === 'all' || task.classList.contains(category)) {
                task.classList.remove('hidden');
            } else {
                task.classList.add('hidden');
            }
        });
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li, #completed-task-list li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-content').textContent,
                category: li.className.split(' ')[0],
                completed: li.querySelector('.task-checkbox').checked, 
                priority: li.classList.contains('priority'),
                completionDate: li.dataset.completionDate || null
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProductivityDashboard();
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTask(task, true);
        });
        updateProductivityDashboard();
    }

    function updateProductivityDashboard() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed);
        totalCompletedTasksEl.textContent = `${completedTasks.length} de ${totalTasks} Concluídas`;
    
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
    
        const completedThisWeek = tasks.filter(task => {
            if (!task.completed || !task.completionDate) return false;
            const completionDate = new Date(task.completionDate);
            return completionDate >= sevenDaysAgo;
        });
        const totalCompletedThisWeek = completedThisWeek.length;
    
        const categoryCounts = { pessoal: 0, trabalho: 0, estudo: 0 };
        completedThisWeek.forEach(task => {
            if (categoryCounts.hasOwnProperty(task.category)) {
                categoryCounts[task.category]++;
            }
        });
    
        const categories = ['pessoal', 'trabalho', 'estudo'];
        categories.forEach(category => {
            const count = categoryCounts[category];
            const percentage = totalCompletedThisWeek > 0 ? (count / totalCompletedThisWeek) * 100 : 0;
    
            document.getElementById(`${category}-segment`).style.width = `${percentage}%`;
            document.getElementById(`${category}-stats`).textContent = `${percentage.toFixed(0)}% (${count})`;
        });
    }
   

    const calendarEl = document.getElementById('calendar');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventTitleInput = document.getElementById('event-title-input');
    const eventDateInput = document.getElementById('event-date-input');
    const toggleCalendarBtn = document.getElementById('toggle-calendar-btn');
    const closeCalendarBtn = document.querySelector('.close-calendar-btn');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: JSON.parse(localStorage.getItem('calendarEvents')) || [],
        eventDidMount: function(info) {
            info.el.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm('Tem certeza que deseja remover este evento?')) {
                    info.event.remove();
                    saveCalendarEvents();
                }
            });
        }
    });

    calendar.render();

    function saveCalendarEvents() {
        const events = calendar.getEvents().map(event => ({
            title: event.title,
            start: event.startStr
        }));
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
    
    addEventBtn.addEventListener('click', () => {
        const title = eventTitleInput.value;
        const date = eventDateInput.value;

        if (title && date) {
            calendar.addEvent({
                title: title,
                start: date,
                allDay: true
            });
            saveCalendarEvents();
            eventTitleInput.value = '';
            eventDateInput.value = '';
        } else {
            alert('Por favor, preencha o título e a data do evento.');
        }
    });
    
    loadTasks();



toggleCalendarBtn.addEventListener('click', () => {
    const calendarModule = document.querySelector('.calendar-module');
    calendarModule.classList.toggle('visible');
    toggleCalendarBtn.classList.toggle('active');

    
    if (calendarModule.classList.contains('visible')) {
        calendar.render();
    }
});

closeCalendarBtn.addEventListener('click', () => {
    document.querySelector('.calendar-module').classList.remove('visible');
    document.getElementById('toggle-calendar-btn').classList.remove('active');
});

toggleCompletedBtn.addEventListener('click', () => {
    completedTaskList.classList.toggle('hidden');
    const icon = toggleCompletedBtn.querySelector('i');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
});
});


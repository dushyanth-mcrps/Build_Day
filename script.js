const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const clearAll = document.getElementById("clearAll");
const filterBtns = document.querySelectorAll(".filter-btns button");
const sound = document.getElementById("doneSound");

sound.src = "https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function humanTime(dateStr) {
    const diffMin = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    return `${Math.floor(diffMin / 60)} hr ago`;
}

function render() {
    taskList.innerHTML = "";

    const filtered = tasks.filter(t => {
        if (currentFilter === "active") return !t.completed;
        if (currentFilter === "completed") return t.completed;
        return true;
    });

    if (filtered.length === 0) {
        taskList.innerHTML = `
      <p style="text-align:center;color:#6b7280;margin-top:20px">
        No tasks here. Add something meaningful.
      </p>`;
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        const left = document.createElement("div");
        const title = document.createElement("span");
        title.textContent = task.text;

        const stamp = document.createElement("span");
        stamp.className = "timestamp";
        stamp.textContent = humanTime(task.created);

        left.append(title, stamp);

        const controls = document.createElement("div");
        controls.className = "controls";

        const toggle = document.createElement("button");
        toggle.className = "ctrl-btn";
        toggle.innerHTML = task.completed ? "↺" : "✓";
        toggle.onclick = () => {
            task.completed = !task.completed;
            if (task.completed) {
                sound.currentTime = 0;
                sound.play().catch(() => { });
            }
            save();
            render();
        };

        const edit = document.createElement("button");
        edit.className = "ctrl-btn";
        edit.textContent = "✎";
        edit.onclick = () => {
            const updated = prompt("Edit task:", task.text);
            if (updated && updated.trim()) {
                task.text = updated.trim();
                save();
                render();
            }
        };

        const del = document.createElement("button");
        del.className = "ctrl-btn";
        del.textContent = "✕";
        del.onclick = () => {
            tasks = tasks.filter(t => t !== task);
            save();
            render();
        };

        controls.append(toggle, edit, del);
        li.append(left, controls);
        taskList.append(li);
    });
}

addBtn.onclick = () => {
    const txt = input.value.trim();
    if (!txt) return;
    tasks.push({ text: txt, completed: false, created: new Date().toISOString() });
    save();
    input.value = "";
    render();
};

clearAll.onclick = () => {
    tasks = [];
    save();
    render();
};

filterBtns.forEach(btn => {
    btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        render();
    };
});

render();
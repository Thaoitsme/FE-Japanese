export function renderSidebar(lesson = {}) {
    const container = document.querySelector("#lesson-sidebar");
    if (!container) {
        return;
    }

    const percentValue = Math.round((lesson.progress?.percent ?? 0) * 100);
    const completedLessons = lesson.progress?.completedLessons ?? 0;
    const totalLessons = lesson.progress?.totalLessons ?? 0;

    const renderLesson = (lessonItem) => {
        const statusClass =
            lessonItem.status === "complete"
                ? "lesson-item is-complete"
                : "lesson-item is-pending";
        const currentClass = lessonItem.isCurrent ? " is-active" : "";
        const icon = lessonItem.status === "complete" ? "[x]" : "[ ]";

        const titleMarkup = lessonItem.link
            ? `<a href="${lessonItem.link}" class="lesson-link">${lessonItem.title}</a>`
            : `<span class="lesson-text">${lessonItem.title}</span>`;

        return `
            <li class="${statusClass}${currentClass}">
                <div class="lesson-info">
                    <span class="lesson-icon">${icon}</span>
                    <div>
                        <p class="lesson-title">${titleMarkup}</p>
                    </div>
                </div>
                <span class="lesson-duration">${lessonItem.duration ?? ""}</span>
            </li>
        `;
    };

    const chapterSections =
        lesson.chapters
            ?.map((chapter, index) => {
                const isOpen = chapter.isCurrent || index === 0;
                const currentClass = chapter.isCurrent ? " is-current" : "";
                return `
                    <section class="syllabus-chapter${isOpen ? " is-open" : ""}${currentClass}">
                        <button class="chapter-toggle" type="button" aria-expanded="${isOpen ? "true" : "false"}">
                            <span class="chapter-name">${chapter.title}</span>
                            <span class="chapter-progress">${chapter.completedLessons ?? 0}/${chapter.totalLessons ?? 0}</span>
                        </button>
                        <ol class="lesson-list">
                            ${(chapter.lessons ?? []).map(renderLesson).join("")}
                        </ol>
                    </section>
                `;
            })
            .join("") ?? "";

    container.innerHTML = `
        <header class="sidebar-title">
            <h2>Course Outline</h2>
            <button class="sidebar-collapse" type="button" data-sidebar-toggle data-toggle-variant="icon" aria-expanded="true" aria-label="Hide outline">▾</button>
        </header>
        <div class="sidebar-progress-group">
            <div class="sidebar-progress-labels">
                <span>Course progress</span>
                <span>${percentValue}%</span>
            </div>
            <div class="sidebar-progress">
                <div class="sidebar-progress-bar" style="width: ${percentValue}%"></div>
            </div>
            <p class="sidebar-progress-detail">${completedLessons}/${totalLessons} lessons completed</p>
        </div>
        <nav class="syllabus" aria-label="Lesson list">
            ${chapterSections}
        </nav>
    `;

    container.querySelectorAll(".chapter-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.closest(".syllabus-chapter");
            if (!section) {
                return;
            }
            const isOpen = section.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    });

    setupSidebarToggles();
}

function setupSidebarToggles() {
    const root = document.body;
    const buttons = document.querySelectorAll("[data-sidebar-toggle]");

    const applyState = (collapsed) => {
        root.classList.toggle("sidebar-collapsed", collapsed);
        buttons.forEach((button) => {
            button.setAttribute("aria-expanded", collapsed ? "false" : "true");
            if (button.dataset.toggleVariant === "icon") {
                button.textContent = collapsed ? "▸" : "▾";
                button.setAttribute("aria-label", collapsed ? "Show outline" : "Hide outline");
            } else {
                button.textContent = collapsed ? "Show outline" : "Hide outline";
            }
        });
    };

    const toggle = () => {
        const collapsed = !root.classList.contains("sidebar-collapsed");
        applyState(collapsed);
    };

    buttons.forEach((button) => {
        if (button.dataset.sidebarToggleBound) {
            return;
        }
        button.addEventListener("click", toggle);
        button.dataset.sidebarToggleBound = "true";
    });

    applyState(root.classList.contains("sidebar-collapsed"));
}

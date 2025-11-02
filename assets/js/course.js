const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

const speakKana = (text, lang = "ja-JP") => {
    if (!speechSupported || !text) {
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
};

const handleKanaSpeak = (event) => {
    const button = event.currentTarget;
    const parent = button.closest(".kana-item");
    if (!parent) {
        return;
    }
    const kana = parent.dataset.jp;
    speakKana(kana);
};

const handleVocabSpeak = (event) => {
    const button = event.currentTarget;
    const text = button.dataset.speak || button.previousElementSibling?.querySelector(".word")?.textContent;
    speakKana(text);
};

const toggleTabs = (event) => {
    const targetButton = event.currentTarget;
    const targetSelector = targetButton.dataset.tabTarget;
    if (!targetSelector) {
        return;
    }

    document.querySelectorAll(".lesson-tab").forEach((button) => {
        button.classList.toggle("is-active", button === targetButton);
        button.setAttribute("aria-current", button === targetButton ? "true" : "false");
    });

    const targetPanel = document.querySelector(targetSelector);
    if (!targetPanel) {
        return;
    }

    targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
};

const handlePracticeSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = form.querySelector(".practice-feedback");
    const selected = form.querySelector("input[name='answer']:checked");
    const practiceCard = form.closest(".practice-card");
    const completeButton = practiceCard?.querySelector("[data-action='complete-lesson']");
    const nextLessonLink = practiceCard?.querySelector("[data-next-lesson]");

    if (!selected) {
        feedback.textContent = "Hay chon mot dap an truoc khi nop nhe!";
        feedback.dataset.state = "warning";
        return;
    }

    const isCorrect = selected.value === "a";

    if (isCorrect) {
        feedback.textContent = "Chinh xac! あ doc la /a/. Ban co the danh dau hoan thanh va sang bai tiep theo.";
        feedback.dataset.state = "success";
        if (completeButton) {
            completeButton.disabled = false;
        }
        if (nextLessonLink) {
            nextLessonLink.classList.remove("is-disabled");
            nextLessonLink.removeAttribute("aria-disabled");
        }
    } else {
        feedback.textContent = "Chua dung roi. Thu nghe lai phat am va chon dap an khac nhe!";
        feedback.dataset.state = "error";
        form.reset();
        if (completeButton) {
            completeButton.disabled = true;
        }
        if (nextLessonLink) {
            nextLessonLink.classList.add("is-disabled");
            nextLessonLink.setAttribute("aria-disabled", "true");
        }
    }
};

const toggleChapter = (event) => {
    const button = event.currentTarget;
    const chapter = button.closest(".syllabus-chapter");
    if (!chapter) {
        return;
    }
    const expanded = chapter.classList.toggle("is-open");
    button.setAttribute("aria-expanded", expanded);
};

const toggleAssistantPanel = (show) => {
    const panel = document.querySelector("#assistant-panel");
    const fab = document.querySelector(".assistant-fab");
    if (!panel || !fab) {
        return;
    }
    const willShow = typeof show === "boolean" ? show : panel.hasAttribute("hidden");
    if (willShow) {
        panel.removeAttribute("hidden");
        fab.setAttribute("aria-expanded", "true");
    } else {
        panel.setAttribute("hidden", "");
        fab.setAttribute("aria-expanded", "false");
    }
};

const toggleSidebarOutline = () => {
    const outline = document.querySelector(".syllabus");
    const progress = document.querySelector(".sidebar-progress-group");
    const toggle = document.querySelector(".sidebar-collapse");
    if (!outline || !progress || !toggle) {
        return;
    }
    const expanded = toggle.getAttribute("aria-expanded") !== "false";
    const nextState = !expanded;
    toggle.setAttribute("aria-expanded", nextState ? "true" : "false");
    outline.style.display = nextState ? "grid" : "none";
    progress.style.display = nextState ? "grid" : "none";
};

const initWritingTrainer = () => {
    const buttons = Array.from(document.querySelectorAll(".writing-pills button"));
    const display = document.querySelector("[data-writing-display]");
    const speakButton = display?.querySelector("[data-writing-speak]");
    if (!buttons.length || !display || !speakButton) {
        return;
    }

    const kanaElement = display.querySelector(".writing-kana");
    const romajiElement = display.querySelector(".writing-romaji");
    const descElement = display.querySelector(".writing-desc");
    const gifElement = display.querySelector(".writing-gif img");
    const tipElement = display.querySelector(".writing-tip p");

    const updateDisplay = (button) => {
        buttons.forEach((btn) => {
            btn.classList.toggle("is-active", btn === button);
        });
        const { kana, romaji, desc, tip, gif } = button.dataset;
        if (kanaElement) {
            kanaElement.textContent = kana ?? "";
        }
        if (romajiElement) {
            romajiElement.textContent = romaji ?? "";
        }
        if (descElement) {
            descElement.textContent = desc ?? "";
        }
        if (gifElement && gif) {
            gifElement.src = gif;
            gifElement.alt = `Huong dan viet chu ${kana}`;
        }
        if (tipElement) {
            tipElement.textContent = tip ?? "";
        }
        speakButton.dataset.kana = kana ?? "";
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => updateDisplay(button));
    });

    speakButton.addEventListener("click", () => {
        const kana = speakButton.dataset.kana;
        speakKana(kana);
    });

    updateDisplay(buttons[0]);
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".kana-item [data-speak]").forEach((button) => {
        button.addEventListener("click", handleKanaSpeak);
    });

    document.querySelectorAll(".vocab-table [data-speak]").forEach((button) => {
        button.addEventListener("click", handleVocabSpeak);
    });

    document.querySelectorAll(".lesson-tab").forEach((button) => {
        button.addEventListener("click", toggleTabs);
    });

    document.querySelectorAll(".practice-form").forEach((form) => {
        form.addEventListener("submit", handlePracticeSubmit);
    });

    document.querySelectorAll(".syllabus-chapter .chapter-toggle").forEach((button) => {
        button.addEventListener("click", toggleChapter);
    });

    const fab = document.querySelector(".assistant-fab");
    const closeButton = document.querySelector("[data-close-assistant]");
    if (fab) {
        fab.addEventListener("click", () => toggleAssistantPanel());
    }
    if (closeButton) {
        closeButton.addEventListener("click", () => toggleAssistantPanel(false));
    }

    const sidebarToggle = document.querySelector(".sidebar-collapse");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebarOutline);
    }

    initWritingTrainer();
});

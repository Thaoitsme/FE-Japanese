const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

const speakKana = (text) => {
    if (!speechSupported || !text) {
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
};

export function renderPractice(practiceData = {}) {
    const container = document.querySelector("#panel-practice");
    if (!container) {
        return;
    }

    const questions = Array.isArray(practiceData.sections)
        ? practiceData.sections.flatMap((section) =>
              (section.questions ?? []).map((question) => ({
                  ...question,
                  type: question.type ?? section.type ?? "multiple",
              })),
          )
        : practiceData.quiz
          ? [{ ...practiceData.quiz, type: practiceData.quiz.type ?? "multiple" }]
          : [];

    if (!questions.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = createPracticeShell(practiceData, questions.length);
    const state = createState(questions, practiceData);
    renderQuestion(container, state);
    bindControls(container, state);
}

function createPracticeShell(practiceData, totalQuestions) {
    const meta = practiceData.quiz?.meta ?? {};
    const progressPercent =
        typeof practiceData.progressPercent === "number" ? practiceData.progressPercent : null;

    return `
        <article class="lesson-card practice-card">
            <header class="practice-header">
                <div>
                    <h2 class="practice-title">Bai tap thuc hanh</h2>
                    <p class="practice-subtitle">Luyen tap ngay sau khi hoc de cung co kien thuc.</p>
                </div>
                <div class="practice-meta-badges">
                    <span class="practice-badge" data-question-progress>Cau 1 / ${totalQuestions}</span>
                    <span class="practice-badge" data-question-timer>${meta.timeRemaining ?? "00:00"}</span>
                    ${
                        progressPercent !== null
                            ? `<span class="practice-badge">Tien do: ${Math.round(progressPercent)}%</span>`
                            : ""
                    }
                </div>
            </header>
            <div class="practice-body" data-question-container></div>
            <div class="practice-global" data-global-feedback></div>
            <footer class="practice-footer">
                <div class="practice-actions">
                    <button type="button" class="practice-nav" data-action="prev" disabled>Cau truoc</button>
                    <button type="button" class="practice-nav" data-action="next">Cau tiep theo</button>
                    <button type="button" class="btn btn-success" data-action="submit" disabled>Nop bai</button>
                </div>
                <nav class="practice-lesson-nav">
                    <a href="${practiceData.previousLessonUrl ?? "#"}" data-prev-lesson>&lt;&lt; Bai truoc</a>
                    <a
                        href="${practiceData.nextLessonUrl ?? "#"}"
                        class="practice-next-link is-disabled"
                        data-next-lesson
                        aria-disabled="true"
                    >
                        Bai tiep theo &gt;&gt;
                    </a>
                </nav>
            </footer>
        </article>
    `;
}

function createState(questions, practiceData) {
    return {
        questions: questions.map((question, index) => ({ ...question, index })),
        currentIndex: 0,
        answers: new Map(),
        incorrectSet: new Set(),
        passed: false,
        practiceData,
    };
}

function renderQuestion(container, state) {
    const { questions, currentIndex, answers, incorrectSet } = state;
    const question = questions[currentIndex];
    const wrapper = container.querySelector("[data-question-container]");
    const storedAnswer = answers.get(question.index);

    const promptKanaMarkup = question.promptKana ? `<div class="prompt-kana">${question.promptKana}</div>` : "";

    wrapper.innerHTML = `
        <form
            class="practice-form"
            data-question-form
            data-question-type="${question.type ?? "multiple"}"
            data-question-index="${question.index}"
        >
            <p class="prompt">${question.prompt ?? ""}</p>
            ${promptKanaMarkup}
            ${renderAudio(question)}
            ${renderInput(question, storedAnswer)}
            <p class="practice-feedback" role="status" aria-live="polite"></p>
        </form>
    `;

    const form = wrapper.querySelector(".practice-form");
    if (!form) {
        return;
    }

    if (incorrectSet.has(question.index)) {
        form.classList.add("is-incorrect");
        const feedback = form.querySelector(".practice-feedback");
        if (feedback) {
            feedback.textContent = "Cau tra loi chua chinh xac. Hay thu lai.";
            feedback.dataset.state = "error";
        }
    } else if (state.passed) {
        form.classList.add("is-correct");
    }

    attachQuestionListeners(form, question, state, container);
    updateMetaBadges(container, state);
    updateNavigationButtons(container, state);
    updateSubmissionState(container, state);
}

function renderAudio(question) {
    if (question.type !== "listening" || !question.audio) {
        return "";
    }
    return `
        <div class="listening-audio">
            <audio controls data-practice-audio>
                <source src="${question.audio}" type="audio/mpeg">
                Trinh duyet cua ban khong ho tro phat audio.
            </audio>
        </div>
    `;
}

function renderInput(question, storedAnswer) {
    const type = question.type ?? "multiple";
    if (type === "writing") {
        return `<textarea rows="3" placeholder="Nhap cau tra loi...">${storedAnswer ?? ""}</textarea>`;
    }

    return `
        <div class="options-grid" data-options>
            ${(question.choices ?? [])
                .map((choice) => {
                    const selected = storedAnswer === choice.value ? "is-selected" : "";
                    const checked = storedAnswer === choice.value ? "checked" : "";
                    return `
                        <label class="option ${selected}">
                            <input type="radio" name="answer" value="${choice.value}" ${checked}>
                            <span>${choice.label.toUpperCase()}. ${choice.text}</span>
                        </label>
                    `;
                })
                .join("")}
        </div>
    `;
}

function attachQuestionListeners(form, question, state, container) {
    const type = form.dataset.questionType;
    if (type === "writing") {
        const textarea = form.querySelector("textarea");
        textarea?.addEventListener("input", (event) => {
            form.classList.remove("is-incorrect", "is-correct");
            const value = event.target.value.trim();
            if (value.length) {
                state.answers.set(question.index, value);
            } else {
                state.answers.delete(question.index);
            }
            state.incorrectSet.delete(question.index);
            state.passed = false;
            updateSubmissionState(container, state);
        });
        return;
    }

    const options = form.querySelectorAll(".option");
    options.forEach((option) => {
        const input = option.querySelector("input");
        input?.addEventListener("change", () => {
            form.classList.remove("is-incorrect", "is-correct");
            options.forEach((opt) => opt.classList.remove("is-selected"));
            option.classList.add("is-selected");
            state.answers.set(question.index, input.value);
            state.incorrectSet.delete(question.index);
            state.passed = false;
            updateSubmissionState(container, state);
        });
    });
}

function bindControls(container, state) {
    const nextButton = container.querySelector("[data-action='next']");
    const prevButton = container.querySelector("[data-action='prev']");
    const submitButton = container.querySelector("[data-action='submit']");

    nextButton?.addEventListener("click", () => {
        if (state.currentIndex < state.questions.length - 1) {
            state.currentIndex += 1;
            renderQuestion(container, state);
        }
    });

    prevButton?.addEventListener("click", () => {
        if (state.currentIndex > 0) {
            state.currentIndex -= 1;
            renderQuestion(container, state);
        }
    });

    submitButton?.addEventListener("click", () => {
        if (!allAnswered(state)) {
            showGlobalFeedback(container, {
                state: "warning",
                message: "Hay hoan thanh tat ca cau hoi truoc khi nop bai.",
            });
            return;
        }

        const incorrectSet = evaluateAnswers(state);
        state.incorrectSet = incorrectSet;
        state.passed = incorrectSet.size === 0;

        if (state.passed) {
            showGlobalFeedback(container, {
                state: "success",
                message: "Tuyet voi! Ban da tra loi chinh xac tat ca cau hoi.",
            });
        } else {
            showGlobalFeedback(container, {
                state: "error",
                message: `Ban con ${incorrectSet.size} cau chua chinh xac. Hay xem lai cac cau duoc danh dau.`,
            });
        }

        renderQuestion(container, state);
        updateSubmissionState(container, state);

        if (state.passed) {
            submitButton.disabled = true;
            const nextLessonLink = container.querySelector("[data-next-lesson]");
            nextLessonLink?.classList.remove("is-disabled");
            nextLessonLink?.removeAttribute("aria-disabled");
        }
    });
}

function allAnswered(state) {
    return state.questions.every((question) => {
        const answer = state.answers.get(question.index);
        if (question.type === "writing") {
            return Boolean(answer && answer.trim().length);
        }
        return typeof answer !== "undefined";
    });
}

function evaluateAnswers(state) {
    const incorrectSet = new Set();
    state.questions.forEach((question) => {
        const answer = state.answers.get(question.index);
        const type = question.type ?? "multiple";
        let isCorrect = false;

        if (type === "writing") {
            isCorrect = normalizeText(answer ?? "") === normalizeText(question.answer ?? "");
        } else {
            isCorrect = answer === question.answer;
        }

        if (!isCorrect) {
            incorrectSet.add(question.index);
        }
    });
    return incorrectSet;
}

function showGlobalFeedback(container, { state, message }) {
    const feedback = container.querySelector("[data-global-feedback]");
    if (!feedback) {
        return;
    }
    feedback.textContent = message;
    feedback.dataset.state = state;
}

function updateNavigationButtons(container, state) {
    const prevButton = container.querySelector("[data-action='prev']");
    const nextButton = container.querySelector("[data-action='next']");

    if (prevButton) {
        prevButton.disabled = state.currentIndex === 0;
    }

    if (nextButton) {
        nextButton.disabled = state.currentIndex >= state.questions.length - 1;
    }
}

function updateMetaBadges(container, state) {
    const progressBadge = container.querySelector("[data-question-progress]");
    if (progressBadge) {
        progressBadge.textContent = `Cau ${state.currentIndex + 1} / ${state.questions.length}`;
    }
}

function updateSubmissionState(container, state) {
    const submitButton = container.querySelector("[data-action='submit']");
    if (!submitButton) {
        return;
    }

    if (state.passed) {
        submitButton.disabled = true;
        return;
    }

    submitButton.disabled = !allAnswered(state);
}

function normalizeText(value = "") {
    return value.replace(/\s+/g, "").toLowerCase();
}

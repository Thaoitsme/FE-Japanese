import { renderSidebar } from "./sidebar.js";
import { renderTheory } from "./theory.js";
import { renderSimulation } from "./simulation.js";
import { renderPractice } from "./practice.js";

const RESOURCE_BASE = "../../resources";

function getLessonSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("lesson") ?? "lesson-1";
}

async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
        throw new Error(`Failed to load resource: ${path}`);
    }
    return response.json();
}

async function fetchLessonResources(slug) {
    const buildPath = (name) => `${RESOURCE_BASE}/${slug}/${name}.json`;
    const [meta, sidebar, theory, simulation, practice] = await Promise.all([
        fetchJSON(buildPath("meta")),
        fetchJSON(buildPath("sidebar")),
        fetchJSON(buildPath("theory")),
        fetchJSON(buildPath("simulation")),
        fetchJSON(buildPath("practice"))
    ]);
    return { meta, sidebar, theory, simulation, practice };
}

function updateMeta(meta) {
    const metaWrapper = document.querySelector("[data-lesson-meta]");
    if (!metaWrapper) {
        return;
    }
    const unitElement = metaWrapper.querySelector(".topbar-unit");
    const titleElement = metaWrapper.querySelector("h1");
    if (unitElement) {
        unitElement.textContent = meta.unitTitle ?? "";
    }
    if (titleElement) {
        titleElement.textContent = meta.title ?? "Lesson";
    }
}

function initTabs() {
    document.querySelectorAll(".lesson-tab").forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.tabTarget;
            if (!target) {
                return;
            }
            document.querySelectorAll(".lesson-tab").forEach((tab) => {
                const isActive = tab === button;
                tab.classList.toggle("is-active", isActive);
                tab.setAttribute("aria-current", isActive ? "true" : "false");
            });
            const section = document.querySelector(target);
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function initAssistant() {
    const fab = document.querySelector(".assistant-fab");
    const panel = document.querySelector("#assistant-panel");
    const closeButton = document.querySelector("[data-close-assistant]");
    const form = document.querySelector("[data-assistant-form]");
    const messages = document.querySelector("[data-assistant-messages]");

    if (fab && panel) {
        fab.addEventListener("click", () => {
            const isHidden = panel.hasAttribute("hidden");
            if (isHidden) {
                panel.removeAttribute("hidden");
                fab.setAttribute("aria-expanded", "true");
            } else {
                panel.setAttribute("hidden", "");
                fab.setAttribute("aria-expanded", "false");
            }
        });
    }

    closeButton?.addEventListener("click", () => {
        panel?.setAttribute("hidden", "");
        fab?.setAttribute("aria-expanded", "false");
    });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const textarea = form.querySelector("textarea");
        const value = textarea?.value.trim();
        if (!value || !messages) {
            return;
        }
        const userBubble = document.createElement("div");
        userBubble.className = "assistant-message";
        userBubble.innerHTML = `<p><strong>You:</strong> ${value}</p>`;
        messages.appendChild(userBubble);
        textarea.value = "";

        const autoReply = document.createElement("div");
        autoReply.className = "assistant-message";
        autoReply.innerHTML = `<p>Sensei AI will get back to you soon! Keep practicing meanwhile.</p>`;
        messages.appendChild(autoReply);
        messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
    });
}

function hideLoading() {
    const loading = document.querySelector("#lesson-loading");
    if (loading) {
        loading.remove();
    }
}

function showError(message) {
    const main = document.querySelector(".course-main");
    if (main) {
        main.innerHTML = `<div class="lesson-card"><p>${message}</p></div>`;
    }
}

async function bootstrapLesson() {
    const slug = getLessonSlug();
    try {
        const { meta, sidebar, theory, simulation, practice } = await fetchLessonResources(slug);
        updateMeta(meta);
        renderSidebar({ progress: meta.progress, chapters: sidebar.chapters ?? [] });
        renderTheory(theory);
        renderSimulation(simulation);
        renderPractice({
            ...practice,
            progressPercent: practice.progressPercent ?? Math.round((meta.progress?.percent ?? 0) * 100),
            previousLessonUrl: practice.previousLessonUrl ?? meta.navigation?.previousLessonUrl ?? "#",
            nextLessonUrl: practice.nextLessonUrl ?? meta.navigation?.nextLessonUrl ?? "#",
        });
        hideLoading();
        initTabs();
        initAssistant();
    } catch (error) {
        hideLoading();
        showError(error.message ?? "Failed to load lesson data.");
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", bootstrapLesson);

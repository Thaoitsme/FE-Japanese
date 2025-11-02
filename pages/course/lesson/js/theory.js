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

const toneFallback = ["tone-blue", "tone-green", "tone-purple", "tone-orange", "tone-pink"];

export function renderTheory(theoryData = {}) {
    const container = document.querySelector("#panel-theory");
    if (!container) {
        return;
    }

    const heading = theoryData.heading ?? {};
    const kanaList = theoryData.kanaList ?? [];
    const vocab = theoryData.vocab ?? [];
    const writing = theoryData.writing ?? {};
    const writingCharacters = writing.characters ?? [];

    const kanaMarkup = kanaList.length
        ? `
            <ul class="kana-list">
                ${kanaList
                    .map((item, index) => {
                        const toneClass = item.toneClass ?? toneFallback[index % toneFallback.length];
                        return `
                            <li class="kana-item ${toneClass}" data-jp="${item.character}">
                                <div>
                                    <h3>${item.romaji ?? ""}</h3>
                                    <p>${item.description ?? ""}</p>
                                </div>
                                <button class="icon-button" type="button" data-action="speak-kana" data-kana="${item.character}">
                                    🔊
                                </button>
                            </li>
                        `;
                    })
                    .join("")}
            </ul>
        `
        : "";

    const vocabMarkup = vocab.length
        ? `
            <section class="vocab-section tight-section">
                <header>
                    <h3>Từ vựng cần nhớ</h3>
                    <p>Ôn luyện các từ cơ bản trong bài.</p>
                </header>
                <ul class="vocab-table">
                    ${vocab
                        .map(
                            (item) => `
                                <li>
                                    <div class="lesson-info">
                                        <span class="word">${item.word}</span>
                                        ${item.romaji ? `<span class="romaji">${item.romaji}</span>` : ""}
                                        <span class="meaning">${item.meaning}</span>
                                    </div>
                                    <button class="icon-button" type="button" data-action="speak-word" data-word="${item.word}">
                                        🔊
                                    </button>
                                </li>
                            `,
                        )
                        .join("")}
                </ul>
            </section>
        `
        : "";

    const writingMarkup =
        writingCharacters.length > 0
            ? `
                <section class="writing-section">
                    <header>
                        <h3>Luyện tập viết chữ</h3>
                        <p>${writing.description ?? "Chọn chữ cái để xem cách viết và luyện phát âm."}</p>
                    </header>
                    <div class="writing-pills">
                        ${writingCharacters
                            .map(
                                (char, index) => `
                                    <button
                                        type="button"
                                        ${index === 0 ? 'class="is-active"' : ""}
                                        data-kana="${char.kana}"
                                        data-romaji="${char.romaji}"
                                        data-desc="${char.description}"
                                        data-tip="${char.tip}"
                                        data-gif="${char.gif}">
                                        ${char.kana}
                                    </button>
                                `,
                            )
                            .join("")}
                    </div>
                    <div class="writing-display" data-writing-display>
                        <div class="writing-header">
                            <span class="writing-kana">${writingCharacters[0]?.kana ?? ""}</span>
                            <div>
                                <p class="writing-romaji">${writingCharacters[0]?.romaji ?? ""}</p>
                                <p class="writing-desc">${writingCharacters[0]?.description ?? ""}</p>
                            </div>
                            <button class="icon-button" type="button" data-writing-speak aria-label="Phát âm ký tự đang chọn">
                                🔊 Phát âm
                            </button>
                        </div>
                        <div class="writing-gif">
                            <img src="${writingCharacters[0]?.gif ?? ""}" alt="Hướng dẫn viết chữ ${writingCharacters[0]?.kana ?? ""}">
                        </div>
                        <div class="writing-tip">
                            <strong>Mẹo viết:</strong>
                            <p>${writingCharacters[0]?.tip ?? ""}</p>
                        </div>
                    </div>
                </section>
            `
            : "";

    const grammar = theoryData.grammar ?? [];
    const grammarMarkup =
        grammar.length > 0
            ? `
                <section class="grammar-section">
                    <header>
                        <h3>Ngữ pháp cơ bản</h3>
                    </header>
                    <ol class="grammar-list">
                        ${grammar
                            .map(
                                (rule) => `
                                    <li>
                                        <h4>${rule.title ?? ""}</h4>
                                        <p class="grammar-structure">${rule.structure ?? ""}</p>
                                        ${rule.romaji ? `<p class="grammar-romaji">${rule.romaji}</p>` : ""}
                                        <p class="grammar-translation">${rule.translation ?? ""}</p>
                                        ${rule.notes ? `<p class="grammar-notes">${rule.notes}</p>` : ""}
                                    </li>
                                `,
                            )
                            .join("")}
                    </ol>
                </section>
            `
            : "";

    const tips = theoryData.tips ?? [];
    const tipsMarkup =
        tips.length > 0
            ? `
                <section class="tips-section">
                    <header>
                        <h3>Ghi nhớ nhanh</h3>
                    </header>
                    <ul class="tips-list">
                        ${tips.map((tip) => `<li>${tip}</li>`).join("")}
                    </ul>
                </section>
            `
            : "";

    const conversation = theoryData.conversation;
    const conversationMarkup = conversation
        ? `
            <section class="conversation-section">
                <header>
                    <h3>Hội thoại mẫu</h3>
                </header>
                ${renderConversationAudio(conversation.audio)}
                <div class="conversation-lines">
                    ${(conversation.lines ?? [])
                        .map(
                            (line) => `
                                <div class="conversation-line">
                                    <span class="conversation-speaker">${line.speaker}:</span>
                                    <div>
                                        <p class="jp">${line.jp}</p>
                                        ${line.romaji ? `<p class="romaji">${line.romaji}</p>` : ""}
                                        <p class="vi">${line.vi}</p>
                                    </div>
                                </div>
                            `,
                        )
                        .join("")}
                </div>
            </section>
        `
        : "";

    container.innerHTML = `
        <article class="lesson-card compact-card">
            <header class="lesson-card-header">
                <div>
                    <h2>${heading.title ?? "Nội dung lý thuyết"}</h2>
                    <p>${heading.description ?? ""}</p>
                </div>
            </header>
            <div class="theory-layout">
                ${kanaMarkup}
                ${vocabMarkup}
            </div>
            ${grammarMarkup}
            ${conversationMarkup}
            ${tipsMarkup}
            ${writingMarkup}
        </article>
    `;

    container.querySelectorAll('[data-action="speak-kana"]').forEach((button) => {
        button.addEventListener("click", () => speakKana(button.dataset.kana));
    });

    container.querySelectorAll('[data-action="speak-word"]').forEach((button) => {
        button.addEventListener("click", () => speakKana(button.dataset.word));
    });

    const writingDisplay = container.querySelector("[data-writing-display]");
    const speakButton = writingDisplay?.querySelector("[data-writing-speak]");
    if (writingDisplay && speakButton) {
        const kanaElement = writingDisplay.querySelector(".writing-kana");
        const romajiElement = writingDisplay.querySelector(".writing-romaji");
        const descElement = writingDisplay.querySelector(".writing-desc");
        const gifElement = writingDisplay.querySelector(".writing-gif img");
        const tipElement = writingDisplay.querySelector(".writing-tip p");

        const updateWritingDisplay = (button) => {
            container.querySelectorAll(".writing-pills button").forEach((btn) => {
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
                gifElement.alt = `Hướng dẫn viết chữ ${kana}`;
            }
            if (tipElement) {
                tipElement.textContent = tip ?? "";
            }
            speakButton.dataset.kana = kana ?? "";
        };

        container.querySelectorAll(".writing-pills button").forEach((button) => {
            button.addEventListener("click", () => updateWritingDisplay(button));
        });

        speakButton.addEventListener("click", () => {
            const kana = speakButton.dataset.kana || container.querySelector(".writing-kana")?.textContent;
            speakKana(kana);
        });

        const firstButton = container.querySelector(".writing-pills button");
        if (firstButton) {
            updateWritingDisplay(firstButton);
        }
    }

    setupConversationAudio(conversation);
}

function renderConversationAudio(audioUrl) {
    if (!audioUrl) {
        return "";
    }
    return `
        <div class="conversation-audio">
            <audio controls data-conversation-audio>
                <source src="${audioUrl}" type="audio/mpeg">
                Trình duyệt của bạn không hỗ trợ audio.
            </audio>
            <button type="button" class="icon-button" data-conversation-play>
                🔊 Phát bằng trình duyệt
            </button>
            <p class="conversation-audio-error" hidden>
                Không phát được tệp ghi âm. Hãy dùng nút “Phát bằng trình duyệt” để nghe hội thoại qua trình đọc.
            </p>
        </div>
    `;
}

function setupConversationAudio(conversation) {
    if (!conversation) {
        return;
    }

    const audioWrapper = document.querySelector(".conversation-audio");
    const audioElement = document.querySelector("[data-conversation-audio]");
    const playButton = document.querySelector("[data-conversation-play]");
    const errorMessage = document.querySelector(".conversation-audio-error");

    if (audioElement) {
        audioElement.addEventListener("error", () => {
            if (audioWrapper && playButton) {
                audioWrapper.classList.add("audio-error");
                playButton.removeAttribute("hidden");
            }
            if (errorMessage) {
                errorMessage.hidden = false;
            }
        });
    }

    if (playButton) {
        playButton.addEventListener("click", () => {
            const lines = conversation.lines ?? [];
            const script = lines.map((line) => `${line.jp}`).join("。");
            speakKana(script);
        });
    }
}

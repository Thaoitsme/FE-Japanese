export function renderSimulation(simulationData = {}) {
    const container = document.querySelector("#panel-simulation");
    if (!container) {
        return;
    }

    const video = simulationData.video ?? {};
    const summary = simulationData.summary ?? {};
    const hasEmbed = Boolean(video.embedUrl);

    container.innerHTML = `
        <article class="lesson-card media-card">
            <header class="lesson-card-header">
                <div>
                    <h2>Video bài học</h2>
                    <p>${simulationData.description ?? "Xem lại video mô phỏng để luyện nghe và phát âm chuẩn."}</p>
                </div>
                <span class="badge">Thời lượng ${video.duration ?? "—"}</span>
            </header>
            <div class="media-layout">
                <div class="media-player">
                    <div class="media-poster">
                        ${hasEmbed ? renderEmbed(video.embedUrl) : renderVideoPlayer(video)}
                    </div>
                    ${hasEmbed ? "" : renderVideoFooter(video)}
                </div>
                <aside class="lesson-summary">
                    <h3>Mô tả bài học</h3>
                    <ul class="summary-list">
                        ${(summary.items ?? [])
                            .map((item) => `<li>${item}</li>`)
                            .join("")}
                    </ul>
                    ${summary.tip ? `<div class="summary-tip"><strong>Mẹo học:</strong> ${summary.tip}</div>` : ""}
                </aside>
            </div>
        </article>
    `;
}

function renderEmbed(url) {
    return `
        <div class="media-embed">
            <iframe src="${url}" title="Lesson simulation video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    `;
}

function renderVideoPlayer(video) {
    return `
        <video controls preload="metadata" poster="${video.poster ?? ""}">
            <source src="${video.source ?? ""}" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ video.
        </video>
    `;
}

function renderVideoFooter(video) {
    return `
        <footer class="media-footer">
            <div class="media-progress">
                <div class="media-progress-bar" style="width: ${
                    video.progress && video.duration
                        ? calculateProgressPercent(video.progress, video.duration)
                        : 0
                }%"></div>
            </div>
            <div class="media-meta">
                <span>${video.progress ?? "00:00"} / ${video.duration ?? "00:00"}</span>
                <div class="media-controls">
                    <button class="icon-button ghost" type="button" aria-label="Phụ đề">CC</button>
                    <button class="icon-button ghost" type="button" aria-label="Âm lượng">🔊</button>
                    <button class="icon-button ghost" type="button" aria-label="Cài đặt">⚙</button>
                </div>
            </div>
        </footer>
    `;
}

function calculateProgressPercent(progress, duration) {
    const toSeconds = (time) => {
        const [minutes = 0, seconds = 0] = time.split(":").map(Number);
        return minutes * 60 + seconds;
    };
    const progressSeconds = toSeconds(progress);
    const durationSeconds = toSeconds(duration);
    if (!durationSeconds) {
        return 0;
    }
    return Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));
}

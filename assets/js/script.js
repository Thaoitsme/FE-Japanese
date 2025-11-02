document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const links = document.querySelectorAll('a[href^="#"]');

    const toggleHeaderShadow = () => {
        if (!header) {
            return;
        }
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
    toggleHeaderShadow();

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") {
                return;
            }
            const targetElement = document.querySelector(targetId);
            if (!targetElement) {
                return;
            }
            event.preventDefault();
            targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
});

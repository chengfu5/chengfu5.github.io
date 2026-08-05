(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = [...document.querySelectorAll(".nav-link")];
    const sections = [...document.querySelectorAll("section[id]")];
    const scrollToTopButton = document.querySelector(".scroll-to-top");
    const notification = document.querySelector(".notification");
    const contactForm = document.querySelector(".contact-form");
    const formStatus = document.querySelector(".form-status");
    const projectsGrid = document.querySelector(".projects-grid");
    const scrollLeftButton = document.getElementById("scroll-left");
    const scrollRightButton = document.getElementById("scroll-right");
    const currentYear = document.getElementById("current-year");

    let notificationTimeout;
    let ticking = false;

    function setMenuState(isOpen) {
        if (!hamburger || !navMenu) {
            return;
        }

        hamburger.classList.toggle("active", isOpen);
        navMenu.classList.toggle("active", isOpen);
        document.body.classList.toggle("menu-open", isOpen);

        hamburger.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        hamburger.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );
    }

    function closeMenu() {
        setMenuState(false);
    }

    function handleAnchorClick(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute("href");

        if (
            !href ||
            href === "#" ||
            !href.startsWith("#")
        ) {
            return;
        }

        const target = document.querySelector(href);

        if (!target) {
            return;
        }

        event.preventDefault();
        closeMenu();

        target.scrollIntoView({
            behavior: prefersReducedMotion
                ? "auto"
                : "smooth",
            block: "start"
        });

        history.replaceState(
            null,
            "",
            href
        );
    }

    function updateScrollState() {
        const scrollPosition = window.scrollY;

        navbar?.classList.toggle(
            "scrolled",
            scrollPosition > 80
        );

        scrollToTopButton?.classList.toggle(
            "visible",
            scrollPosition > 350
        );

        let currentSection = sections[0]?.id || "";

        for (const section of sections) {
            const sectionTop = section.offsetTop - 180;

            if (scrollPosition >= sectionTop) {
                currentSection = section.id;
            }
        }

        navLinks.forEach(link => {
            const isActive =
                link.getAttribute("href") ===
                `#${currentSection}`;

            link.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        });

        ticking = false;
    }

    function requestScrollUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(
                updateScrollState
            );

            ticking = true;
        }
    }

    function showNotification(
        message,
        type = "info"
    ) {
        if (!notification) {
            return;
        }

        window.clearTimeout(
            notificationTimeout
        );

        notification.textContent = message;
        notification.className =
            `notification ${type} visible`;

        notificationTimeout =
            window.setTimeout(() => {
                notification.classList.remove(
                    "visible"
                );
            }, 4000);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    }

    async function copyToClipboard(text) {
        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    text
                );
            } else {
                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value = text;
                textarea.setAttribute(
                    "readonly",
                    ""
                );

                textarea.style.position =
                    "fixed";

                textarea.style.opacity =
                    "0";

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                const copied =
                    document.execCommand(
                        "copy"
                    );

                textarea.remove();

                if (!copied) {
                    throw new Error(
                        "Clipboard fallback failed."
                    );
                }
            }

            showNotification(
                "Email copied to clipboard.",
                "success"
            );
        } catch (error) {
            console.error(
                "Clipboard error:",
                error
            );

            showNotification(
                `Copy failed. Email: ${text}`,
                "error"
            );
        }
    }

    function setupRevealAnimations() {
        const animatedElements =
            document.querySelectorAll(
                ".skill-category, .project-card, .about-stats .stat, .education-item"
            );

        if (
            prefersReducedMotion ||
            !("IntersectionObserver" in window)
        ) {
            animatedElements.forEach(
                element => {
                    element.classList.add(
                        "revealed"
                    );
                }
            );

            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(
                        entry => {
                            if (
                                entry.isIntersecting
                            ) {
                                entry.target.classList.add(
                                    "revealed"
                                );

                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );
                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -45px 0px"
                }
            );

        animatedElements.forEach(
            element => {
                element.classList.add(
                    "reveal"
                );

                observer.observe(
                    element
                );
            }
        );
    }

    function updateCarouselButtons() {
        if (
            !projectsGrid ||
            !scrollLeftButton ||
            !scrollRightButton
        ) {
            return;
        }

        const maxScrollLeft =
            projectsGrid.scrollWidth -
            projectsGrid.clientWidth;

        const tolerance = 4;

        scrollLeftButton.disabled =
            projectsGrid.scrollLeft <=
            tolerance;

        scrollRightButton.disabled =
            projectsGrid.scrollLeft >=
            maxScrollLeft -
            tolerance;
    }

    function getCarouselScrollAmount() {
        if (!projectsGrid) {
            return 360;
        }

        const firstCard =
            projectsGrid.querySelector(
                ".project-card"
            );

        const computedStyle =
            window.getComputedStyle(
                projectsGrid
            );

        const gap =
            Number.parseFloat(
                computedStyle.columnGap ||
                computedStyle.gap
            ) || 32;

        return firstCard
            ? firstCard.getBoundingClientRect().width +
                gap
            : 360;
    }

    function scrollProjects(direction) {
        if (!projectsGrid) {
            return;
        }

        projectsGrid.scrollBy({
            left:
                getCarouselScrollAmount() *
                direction,
            behavior: prefersReducedMotion
                ? "auto"
                : "smooth"
        });
    }

    function setupProjectTilt() {
        if (
            prefersReducedMotion ||
            window.matchMedia(
                "(hover: none)"
            ).matches
        ) {
            return;
        }

        const cards =
            document.querySelectorAll(
                ".project-card"
            );

        cards.forEach(card => {
            card.addEventListener(
                "mousemove",
                event => {
                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const rotateX =
                        (
                            (
                                y -
                                rect.height / 2
                            ) /
                            rect.height
                        ) *
                        -5;

                    const rotateY =
                        (
                            (
                                x -
                                rect.width / 2
                            ) /
                            rect.width
                        ) *
                        5;

                    card.style.transform =
                        `perspective(1100px) ` +
                        `rotateX(${rotateX}deg) ` +
                        `rotateY(${rotateY}deg) ` +
                        `translateY(-8px)`;
                }
            );

            card.addEventListener(
                "mouseleave",
                () => {
                    card.style.transform =
                        "";
                }
            );

            card.addEventListener(
                "blur",
                () => {
                    card.style.transform =
                        "";
                },
                true
            );
        });
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        if (!contactForm) {
            return;
        }

        const formData =
            new FormData(
                contactForm
            );

        const name =
            String(
                formData.get("name") ||
                ""
            ).trim();

        const email =
            String(
                formData.get("email") ||
                ""
            ).trim();

        const subject =
            String(
                formData.get("subject") ||
                ""
            ).trim();

        const message =
            String(
                formData.get("message") ||
                ""
            ).trim();

        if (
            !name ||
            !email ||
            !subject ||
            !message
        ) {
            showNotification(
                "Please fill in all fields.",
                "error"
            );

            formStatus.textContent =
                "Please complete every field.";

            return;
        }

        if (!isValidEmail(email)) {
            showNotification(
                "Please enter a valid email address.",
                "error"
            );

            formStatus.textContent =
                "Please enter a valid email address.";

            return;
        }

        const submitButton =
            contactForm.querySelector(
                'button[type="submit"]'
            );

        const originalText =
            submitButton?.textContent ||
            "Send Message";

        if (submitButton) {
            submitButton.textContent =
                "Sending...";

            submitButton.disabled =
                true;
        }

        formStatus.textContent =
            "Sending your message...";

        try {
            const response =
                await fetch(
                    contactForm.action,
                    {
                        method: "POST",
                        body: formData,
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Form submission failed with status ${response.status}.`
                );
            }

            contactForm.reset();

            formStatus.textContent =
                "Message sent successfully.";

            showNotification(
                "Message sent successfully! I’ll get back to you soon.",
                "success"
            );
        } catch (error) {
            console.error(
                "Form submission error:",
                error
            );

            formStatus.textContent =
                "The message could not be sent. Please try again.";

            showNotification(
                "There was a problem sending your message. Please try again.",
                "error"
            );
        } finally {
            if (submitButton) {
                submitButton.textContent =
                    originalText;

                submitButton.disabled =
                    false;
            }
        }
    }

    function initialize() {
        if (currentYear) {
            currentYear.textContent =
                String(
                    new Date().getFullYear()
                );
        }

        hamburger?.addEventListener(
            "click",
            () => {
                const isOpen =
                    hamburger.getAttribute(
                        "aria-expanded"
                    ) === "true";

                setMenuState(
                    !isOpen
                );
            }
        );

        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    closeMenu();
                }
            }
        );

        document.addEventListener(
            "click",
            event => {
                if (
                    !navMenu ||
                    !hamburger ||
                    !navMenu.classList.contains(
                        "active"
                    )
                ) {
                    return;
                }

                const clickedInsideMenu =
                    navMenu.contains(
                        event.target
                    );

                const clickedHamburger =
                    hamburger.contains(
                        event.target
                    );

                if (
                    !clickedInsideMenu &&
                    !clickedHamburger
                ) {
                    closeMenu();
                }
            }
        );

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(anchor => {
                anchor.addEventListener(
                    "click",
                    handleAnchorClick
                );
            });

        document
            .querySelectorAll(
                "[data-copy]"
            )
            .forEach(item => {
                item.addEventListener(
                    "click",
                    () => {
                        copyToClipboard(
                            item.dataset.copy
                        );
                    }
                );
            });

        scrollToTopButton
            ?.addEventListener(
                "click",
                () => {
                    window.scrollTo({
                        top: 0,
                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth"
                    });
                }
            );

        contactForm
            ?.addEventListener(
                "submit",
                handleFormSubmit
            );

        scrollLeftButton
            ?.addEventListener(
                "click",
                () => {
                    scrollProjects(-1);
                }
            );

        scrollRightButton
            ?.addEventListener(
                "click",
                () => {
                    scrollProjects(1);
                }
            );

        projectsGrid
            ?.addEventListener(
                "scroll",
                () => {
                    window.requestAnimationFrame(
                        updateCarouselButtons
                    );
                }
            );

        projectsGrid
            ?.addEventListener(
                "keydown",
                event => {
                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {
                        event.preventDefault();
                        scrollProjects(-1);
                    }

                    if (
                        event.key ===
                        "ArrowRight"
                    ) {
                        event.preventDefault();
                        scrollProjects(1);
                    }
                }
            );

        window.addEventListener(
            "scroll",
            requestScrollUpdate,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            () => {
                closeMenu();
                updateCarouselButtons();
                requestScrollUpdate();
            }
        );

        setupRevealAnimations();
        setupProjectTilt();
        updateCarouselButtons();
        updateScrollState();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );
    } else {
        initialize();
    }
})();
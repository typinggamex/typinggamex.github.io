document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. HEADER NAVIGATION & DROPDOWN CONTROLLER
       ========================================================================== */
    const navToggle = document.getElementById('cyberNavToggle');
    const mainNav = document.getElementById('cyberMainNav');
    const gamesDropdown = document.getElementById('cyberGamesDropdown');
    const gamesDropdownTrigger = document.getElementById('cyberGamesTrigger');

    const desktopMedia = window.matchMedia('(min-width: 901px)');

    function playClickSfx(freq = 600) {
        if (typeof window.playTone === 'function' && !window.isMuted) {
            window.playTone(freq, 0.04, 'sine', 0.04);
        }
    }

    function setNavState(isOpen) {
        if (!navToggle || !mainNav) return;

        navToggle.setAttribute('aria-expanded', String(isOpen));
        mainNav.classList.toggle('nav-open', isOpen);
        navToggle.classList.toggle('active', isOpen);
        document.body.classList.toggle('nav-locked', isOpen);

        if (isOpen) {
            playClickSfx(720);
            const firstFocusable = mainNav.querySelector('a, button');
            if (firstFocusable) firstFocusable.focus();
        } else {
            playClickSfx(480);
            closeGamesDropdown();
        }
    }

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            setNavState(!isExpanded);
        });
    }

    function setDropdownState(isOpen) {
        if (!gamesDropdown || !gamesDropdownTrigger) return;
        gamesDropdown.classList.toggle('dropdown-open', isOpen);
        gamesDropdownTrigger.setAttribute('aria-expanded', String(isOpen));
    }

    function closeGamesDropdown() {
        setDropdownState(false);
    }

    if (gamesDropdown && gamesDropdownTrigger) {
        gamesDropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = gamesDropdown.classList.contains('dropdown-open');
            setDropdownState(!isOpen);
            playClickSfx(isOpen ? 520 : 680);
        });
    }

    document.addEventListener('click', (e) => {
        if (gamesDropdown && !gamesDropdown.contains(e.target)) {
            closeGamesDropdown();
        }
        if (mainNav && navToggle && !desktopMedia.matches) {
            if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
                if (mainNav.classList.contains('nav-open')) {
                    setNavState(false);
                }
            }
        }
    });

    if (mainNav) {
        const navLinks = mainNav.querySelectorAll('a:not(#cyberGamesTrigger)');
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (!desktopMedia.matches) {
                    setNavState(false);
                }
            });
        });
    }

    desktopMedia.addEventListener('change', (e) => {
        if (e.matches && mainNav && mainNav.classList.contains('nav-open')) {
            setNavState(false);
        }
    });


    /* ==========================================================================
       2. SPEED TYPING TEST ENGINE (FIXED FOR TEXT DISPLAY)
       ========================================================================== */
    const passages = [
        "The digital frontier expands continuously as developers craft new protocols and interfaces to shape tomorrow's interconnected cyberspace.",
        "Speed typing tests measure your precision and cadence across varied keyboard layouts to build reliable muscle memory and efficiency.",
        "Neon lights flicker across the futuristic urban grid while cybernetic networks transmit data streams silently through the encrypted night."
    ];

    let currentPassageIndex = 0;
    let timer = null;
    let timeElapsed = 0;
    let totalTyped = 0;
    let errors = 0;
    let isStarted = false;
    let isFinished = false;

    const textDisplay = document.getElementById("textDisplay");
    const arena = document.getElementById("typingArena") || document.querySelector(".typing-arena");
    const restartBtn = document.getElementById("restartBtn");
    const nextBtn = document.getElementById("nextBtn");

    function loadPassage(index) {
        if (!textDisplay) return;
        const text = passages[index];
        textDisplay.innerHTML = "";
        
        text.split("").forEach((char, idx) => {
            const span = document.createElement("span");
            span.classList.add("char", "pending");
            if (idx === 0) span.classList.add("current");
            span.textContent = char;
            textDisplay.appendChild(span);
        });

        resetState();
    }

    function resetState() {
        clearInterval(timer);
        isStarted = false;
        isFinished = false;
        timeElapsed = 0;
        totalTyped = 0;
        errors = 0;
        if (arena) arena.classList.remove("focused");
    }

    function initTest() {
        loadPassage(currentPassageIndex);
    }

    // Unified Keydown Event Listener
    document.addEventListener("keydown", (e) => {
        const isNavOpen = mainNav && mainNav.classList.contains('nav-open');
        const isDropdownOpen = gamesDropdown && gamesDropdown.classList.contains('dropdown-open');

        // 1. ESC Key Handling
        if (e.key === 'Escape') {
            if (isDropdownOpen) {
                closeGamesDropdown();
                if (gamesDropdownTrigger) gamesDropdownTrigger.focus();
                return;
            }
            if (isNavOpen && !desktopMedia.matches) {
                setNavState(false);
                if (navToggle) navToggle.focus();
                return;
            }
            initTest();
            return;
        }

        // 2. Tab Trap inside Mobile Navigation
        if (e.key === 'Tab' && isNavOpen && !desktopMedia.matches) {
            const focusables = Array.from(mainNav.querySelectorAll('a, button:not([disabled])'));
            if (focusables.length === 0) return;

            const firstEl = focusables[0];
            const lastEl = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
            return;
        }

        // 3. Arrow Navigation inside Games Dropdown
        if (isDropdownOpen && gamesDropdown) {
            const dropdownLinks = Array.from(gamesDropdown.querySelectorAll('.cyber-dropdown-link'));
            const currentIndex = dropdownLinks.indexOf(document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownLinks.length;
                dropdownLinks[nextIndex].focus();
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownLinks.length) % dropdownLinks.length;
                dropdownLinks[prevIndex].focus();
                return;
            }
        }

        // 4. Typing Game Core Logic
        if (isFinished || !textDisplay) return;

        const chars = textDisplay.querySelectorAll(".char");
        let currentIndex = Array.from(chars).findIndex(c => c.classList.contains("current") || c.classList.contains("current-end"));

        if (currentIndex === -1) currentIndex = 0;

        if (!isStarted && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            isStarted = true;
            if (arena) arena.classList.add("focused");
            timer = setInterval(() => {
                timeElapsed++;
            }, 1000);
        }

        if (e.key === "Backspace") {
            if (currentIndex > 0) {
                chars[currentIndex].classList.remove("current", "current-end");
                currentIndex--;
                chars[currentIndex].classList.remove("correct", "wrong");
                chars[currentIndex].classList.add("current", "pending");
            }
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && currentIndex < chars.length) {
            totalTyped++;
            const expectedChar = chars[currentIndex].textContent;

            chars[currentIndex].classList.remove("current", "current-end", "pending");

            if (e.key === expectedChar) {
                chars[currentIndex].classList.add("correct");
            } else {
                chars[currentIndex].classList.add("wrong");
                errors++;
            }

            currentIndex++;

            if (currentIndex < chars.length) {
                chars[currentIndex].classList.add("current");
            } else {
                clearInterval(timer);
                isFinished = true;
                if (arena) arena.classList.remove("focused");
            }
        }
    });

    if (restartBtn) {
        restartBtn.addEventListener("click", () => initTest());
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentPassageIndex = (currentPassageIndex + 1) % passages.length;
            initTest();
        });
    }

    if (arena) {
        arena.addEventListener("click", () => arena.focus());
    }

    // Initial Load
    initTest();
});

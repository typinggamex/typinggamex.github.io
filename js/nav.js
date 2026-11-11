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
       2. SPEED TYPING TEST ENGINE (WITH STORY PASSAGES)
       ========================================================================== */
    const passages = [
        "Leo woke up early to watch the sunrise. The sky started soft and pink, turning bright gold as the morning breeze rustled the garden leaves. He loved these quiet moments before the busy day began.",
        "Yesterday, his grandfather had shared an ancient wooden puzzle. The complex mechanism featured intricate brass gears and a hidden latch. At first, Leo felt overwhelmed by the perplexing design. Every twist seemed futile, and the tiny interlocking pieces resisted his logical efforts.",
        "Instead of surrendering, he analyzed the geometric patterns carefully. He discovered a subtle indentation on the side panel. With a gentle push, a secret compartment opened, revealing a handwritten journal from decades past. The fading pages detailed a remarkable journey across uncharted oceans, filled with breathtaking discoveries and profound resilience.",
        "Leo realized that every challenge in life, no matter how formidable or obscure, carries hidden wisdom. By maintaining relentless curiosity and patience, we unlock doors we never knew existed. He smiled, ready to embrace whatever extraordinary adventures awaited him today."
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
    const nextBtn = document.getElementById("nextPassageBtn") || document.getElementById("nextBtn");
    const passageNum = document.getElementById("passageNum");

    function loadPassage(index) {
        if (!textDisplay) return;
        const text = passages[index];
        textDisplay.innerHTML = "";
        
        // Split text by words to handle spaces correctly
        const words = text.split(" ");
        words.forEach((wordStr, wordIdx) => {
            const wordSpan = document.createElement("span");
            wordSpan.classList.add("word");
            
            wordStr.split("").forEach((char) => {
                const span = document.createElement("span");
                span.classList.add("char", "pending");
                span.textContent = char;
                wordSpan.appendChild(span);
            });

            // Append space character span after each word except the last one
            if (wordIdx < words.length - 1) {
                const spaceSpan = document.createElement("span");
                spaceSpan.classList.add("char", "pending");
                spaceSpan.textContent = " ";
                wordSpan.appendChild(spaceSpan);
            }

            textDisplay.appendChild(wordSpan);
        });

        // Set initial current class on the very first character
        const firstChar = textDisplay.querySelector(".char");
        if (firstChar) firstChar.classList.add("current");

        if (passageNum) passageNum.textContent = `Passage #${index + 1}`;
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

// Morrowind-OwS Main JavaScript

// Global state
const MorrowindOS = {
    apps: {},
    windows: [],
    activeWindow: null,
    zIndexCounter: 100,
    isBooting: true,
    desktopIcons: [],
    desktopIconPositions: {},
    desktopIconMetrics: null,
    desktopIconZIndex: 1,
    contextMenu: null,
    startMenu: null,
    notifications: [],
    particles: [],
    mist: []
};

// App registry
const AppRegistry = {
    scrolldit: {
        name: 'Scrolldit',
        icon: 'scrolldit-icon',
        logo: 'scrolldit-icon',
        title: 'Scrolldit - Scrollers of Doom',
        width: 900,
        height: 700,
        minWidth: 700,
        minHeight: 600,
        resizable: true
    },
    ouijagpt: {
        name: 'OuijaGPT',
        icon: 'ouijagpt-icon',
        logo: 'ouijagpt-icon',
        title: 'OuijaGPT',
        width: 700,
        height: 500,
        minWidth: 500,
        minHeight: 400,
        resizable: true
    },
    timber: {
        name: 'Timber',
        icon: 'timber-icon',
        logo: 'timber-icon',
        title: 'Timber - Where Dark Souls Meet',
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 500,
        resizable: true
    },
    wraiths: {
        name: 'WraithsApp',
        icon: 'wraiths-icon',
        logo: 'wraiths-icon',
        title: 'WraithsApp - Spirit Communications',
        width: 900,
        height: 700,
        minWidth: 700,
        minHeight: 600,
        resizable: true
    },
    abacus: {
        name: 'Abacus',
        icon: 'abacus-icon',
        logo: 'abacus-icon',
        title: 'Abacus - Mystical Calculator',
        width: 400,
        height: 550,
        minWidth: 400,
        minHeight: 550,
        maxWidth: 400,
        maxHeight: 550,
        resizable: false
    },
    laudify: {
        name: 'Laudify',
        icon: 'laudify-icon',
        logo: 'laudify-icon',
        title: 'Laudify - Mystical Music Player',
        width: 900,
        height: 600,
        minWidth: 700,
        minHeight: 500,
        resizable: true
    },
};

// Get responsive app dimensions based on screen size
function getResponsiveAppDimensions(appConfig) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Default dimensions
    let { width, height, minWidth, minHeight } = appConfig;

    // Adjust for mobile devices
    if (screenWidth <= 768) {
        // Tablet
        width = Math.min(width, screenWidth * 0.8);
        height = Math.min(height, screenHeight * 0.7);
        minWidth = Math.min(minWidth, screenWidth * 0.6);
        minHeight = Math.min(minHeight, screenHeight * 0.5);
    }

    if (screenWidth <= 480) {
        // Phone
        width = Math.min(width, screenWidth * 0.95);
        height = Math.min(height, screenHeight * 0.8);
        minWidth = Math.min(minWidth, screenWidth * 0.8);
        minHeight = Math.min(minHeight, screenHeight * 0.6);
    }

    return { width, height, minWidth, minHeight };
}

// Initialize the OS
document.addEventListener('DOMContentLoaded', function () {
    initializeOS();
});

function initializeOS() {
    // Show loading screen
    showLoadingScreen();

    // Initialize components
    loadSavedState();
    updateDesktopIconMetrics();
    initializeDesktop();
    initializeClock();
    initializeParticles();
    initializeMist();
    initializeContextMenu();

    // Simulate boot process
    setTimeout(() => {
        hideLoadingScreen();
        MorrowindOS.isBooting = false;
        showNotification('Welcome to Morrowind-OwS', 'May your journey be filled with magic and wonder!', 'success');
    }, 3000);
    // Initialize session cleanup for API keys
    initializeSessionCleanup();
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');

        // Animate progress bar
        const progressBar = loadingScreen.querySelector('.loading-progress-bar');
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        }
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            loadingScreen.style.opacity = '1';
        }, 1000);
    }
}

function initializeDesktop() {
    // Initialize desktop icons
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        const appName = icon.getAttribute('data-app');
        if (appName && AppRegistry[appName]) {
            // Desktop double-click for desktop
            icon.addEventListener('dblclick', () => openApp(appName));

            // Touch events for mobile double-tap
            let lastTap = 0;
            icon.addEventListener('touchend', (e) => {
                if (icon.dataset.wasDragged === 'true') {
                    icon.dataset.wasDragged = 'false';
                    return;
                }

                e.preventDefault(); // Prevent mouse events
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    // Double tap detected
                    openApp(appName);
                }
                lastTap = currentTime;
            });

            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, 'desktop-icon', { appName });
            });
            MorrowindOS.desktopIcons.push({
                element: icon,
                appName: appName
            });

            icon.dataset.wasDragged = 'false';

            makeDesktopIconDraggable(icon, appName);
        }
    });

    prepareDesktopIconsForDragging();

    // Desktop context menu
    const desktop = document.getElementById('desktop');
    if (desktop) {
        desktop.addEventListener('contextmenu', (e) => {
            if (e.target === desktop || e.target.id === 'wallpaper') {
                e.preventDefault();
                showContextMenu(e, 'desktop');
            }
        });

        desktop.addEventListener('click', () => {
            hideContextMenu();
            if (window.taskbarManager) {
                window.taskbarManager.hideStartMenu();
            }
        });
    }
}

function prepareDesktopIconsForDragging() {
    const container = document.getElementById('desktop-icons');
    if (!container || !MorrowindOS.desktopIcons.length) {
        return;
    }

    updateDesktopIconMetrics();

    requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();

        const measuredPositions = MorrowindOS.desktopIcons.map(icon => {
            const rect = icon.element.getBoundingClientRect();
            const left = rect.left - containerRect.left;
            const top = rect.top - containerRect.top;

            return { icon, position: { left, top } };
        });

        container.classList.add('desktop-icons-draggable');

        measuredPositions.forEach(({ icon, position }) => {
            const appliedPosition = setDesktopIconPosition(icon.element, position.left, position.top);
            icon.defaultPosition = appliedPosition;

            if (!Object.prototype.hasOwnProperty.call(MorrowindOS.desktopIconPositions, icon.appName)) {
                MorrowindOS.desktopIconPositions[icon.appName] = appliedPosition;
            }
        });

        applyDesktopIconPositions();
    });
}

function updateDesktopIconMetrics() {
    MorrowindOS.desktopIconMetrics = getResponsiveIconMetrics();
}

function getResponsiveIconMetrics() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 480) {
        return { iconWidth: 70, iconHeight: 90, columnGap: 8, rowGap: 8 };
    }
    if (viewportWidth <= 768) {
        return { iconWidth: 80, iconHeight: 100, columnGap: 10, rowGap: 10 };
    }
    return { iconWidth: 100, iconHeight: 120, columnGap: 15, rowGap: 15 };
}

function getDesktopIconLayoutKey(container) {
    if (!container || !MorrowindOS.desktopIcons.length) {
        return 'default';
    }

    const metrics = MorrowindOS.desktopIconMetrics || getResponsiveIconMetrics();
    const effectiveIconWidth = MorrowindOS.desktopIcons[0].element.offsetWidth || metrics.iconWidth;
    const gap = metrics.columnGap;
    const availableWidth = Math.max(container.clientWidth, effectiveIconWidth);
    const columns = Math.max(1, Math.floor((availableWidth + gap) / (effectiveIconWidth + gap)));
    const widthBucket = Math.round(availableWidth / 20);
    return `${widthBucket}:${columns}`;
}

function reflowDesktopIcons(container, layoutKey) {
    if (!container || !MorrowindOS.desktopIcons.length) {
        return;
    }

    updateDesktopIconMetrics();

    const metrics = MorrowindOS.desktopIconMetrics || getResponsiveIconMetrics();
    const sampleIcon = MorrowindOS.desktopIcons[0].element;
    const iconWidth = sampleIcon ? sampleIcon.offsetWidth : metrics.iconWidth;
    const iconHeight = sampleIcon ? sampleIcon.offsetHeight : metrics.iconHeight;
    const columnGap = metrics.columnGap;
    const rowGap = metrics.rowGap;
    const columns = Math.max(1, Math.floor((Math.max(container.clientWidth, iconWidth) + columnGap) / (iconWidth + columnGap)));
    const effectiveLayoutKey = layoutKey || getDesktopIconLayoutKey(container);

    MorrowindOS.desktopIcons.forEach((icon, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const left = column * (iconWidth + columnGap);
        const top = row * (iconHeight + rowGap);
        const position = setDesktopIconPosition(icon.element, left, top, effectiveLayoutKey);
        MorrowindOS.desktopIconPositions[icon.appName] = position;
    });

    saveDesktopIconPositions();
}

function makeDesktopIconDraggable(iconElement, appName) {
    const dragThreshold = 4;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let isDragging = false;

    iconElement.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0 && event.pointerType !== 'touch') {
            return;
        }

        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        initialLeft = parseFloat(iconElement.style.left) || 0;
        initialTop = parseFloat(iconElement.style.top) || 0;
        isDragging = false;

        iconElement.setPointerCapture(pointerId);
        bringDesktopIconToFront(iconElement);
    });

    iconElement.addEventListener('pointermove', (event) => {
        if (pointerId === null || event.pointerId !== pointerId || !iconElement.hasPointerCapture(pointerId)) {
            return;
        }

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;

        if (!isDragging) {
            if (Math.abs(deltaX) + Math.abs(deltaY) < dragThreshold) {
                return;
            }
            isDragging = true;
            iconElement.classList.add('dragging');
        }

        if (!isDragging) {
            return;
        }

        event.preventDefault();

        const container = document.getElementById('desktop-icons');
        if (!container) {
            return;
        }

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const maxLeft = container.clientWidth - iconElement.offsetWidth;
        const maxTop = container.clientHeight - iconElement.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        iconElement.style.left = `${newLeft}px`;
        iconElement.style.top = `${newTop}px`;
    });

    const endDrag = (event) => {
        if (pointerId === null || event.pointerId !== pointerId || !iconElement.hasPointerCapture(pointerId)) {
            return;
        }

        iconElement.releasePointerCapture(pointerId);

        if (isDragging) {
            const container = document.getElementById('desktop-icons');
            if (container) {
                const currentLeft = parseFloat(iconElement.style.left) || 0;
                const currentTop = parseFloat(iconElement.style.top) || 0;
                const snapped = snapDesktopIconPosition(currentLeft, currentTop);
                const finalPosition = setDesktopIconPosition(iconElement, snapped.left, snapped.top);
                MorrowindOS.desktopIconPositions[appName] = finalPosition;
                saveDesktopIconPositions();
            }
            iconElement.dataset.wasDragged = 'true';
            setTimeout(() => {
                iconElement.dataset.wasDragged = 'false';
            }, 150);
        } else {
            iconElement.dataset.wasDragged = 'false';
        }

        iconElement.classList.remove('dragging');
        pointerId = null;
        isDragging = false;
    };

    iconElement.addEventListener('pointerup', endDrag);
    iconElement.addEventListener('pointercancel', endDrag);
}

function bringDesktopIconToFront(iconElement) {
    MorrowindOS.desktopIconZIndex += 1;
    iconElement.style.zIndex = `${MorrowindOS.desktopIconZIndex}`;
}

function setDesktopIconPosition(iconElement, left, top, layoutKey = null) {
    const container = document.getElementById('desktop-icons');
    if (!container) {
        return { left, top, layoutKey: layoutKey || 'default' };
    }

    const maxLeft = Math.max(0, container.clientWidth - iconElement.offsetWidth);
    const maxTop = Math.max(0, container.clientHeight - iconElement.offsetHeight);

    const clampedLeft = Math.max(0, Math.min(left, maxLeft));
    const clampedTop = Math.max(0, Math.min(top, maxTop));

    iconElement.style.position = 'absolute';
    iconElement.style.left = `${clampedLeft}px`;
    iconElement.style.top = `${clampedTop}px`;

    const resolvedLayoutKey = layoutKey || getDesktopIconLayoutKey(container);
    return { left: clampedLeft, top: clampedTop, layoutKey: resolvedLayoutKey };
}

function applyDesktopIconPositions() {
    const container = document.getElementById('desktop-icons');
    if (!container || !MorrowindOS.desktopIcons.length) {
        return;
    }

    updateDesktopIconMetrics();
    const currentLayoutKey = getDesktopIconLayoutKey(container);

    let requiresReflow = false;
    MorrowindOS.desktopIcons.forEach(icon => {
        const saved = MorrowindOS.desktopIconPositions[icon.appName];
        if (saved && saved.layoutKey && saved.layoutKey !== currentLayoutKey) {
            requiresReflow = true;
        }
    });

    if (requiresReflow) {
        reflowDesktopIcons(container, currentLayoutKey);
        return;
    }

    const seenPositions = new Set();
    let hasCollision = false;
    let updated = false;

    MorrowindOS.desktopIcons.forEach(icon => {
        const saved = MorrowindOS.desktopIconPositions[icon.appName];
        if (!saved) {
            return;
        }

        const left = Number(saved.left);
        const top = Number(saved.top);

        if (!Number.isFinite(left) || !Number.isFinite(top)) {
            return;
        }

        const newPosition = setDesktopIconPosition(icon.element, left, top, saved.layoutKey || currentLayoutKey);
        const key = `${Math.round(newPosition.left)}|${Math.round(newPosition.top)}`;
        if (seenPositions.has(key)) {
            hasCollision = true;
        } else {
            seenPositions.add(key);
        }

        if (!saved.layoutKey || saved.layoutKey !== newPosition.layoutKey || saved.left !== newPosition.left || saved.top !== newPosition.top) {
            MorrowindOS.desktopIconPositions[icon.appName] = newPosition;
            updated = true;
        }
    });

    if (hasCollision) {
        reflowDesktopIcons(container, currentLayoutKey);
        return;
    }

    if (updated) {
        saveDesktopIconPositions();
    }
}

function snapDesktopIconPosition(left, top) {
    const gridSize = 10;
    return {
        left: Math.round(left / gridSize) * gridSize,
        top: Math.round(top / gridSize) * gridSize
    };
}

function saveDesktopIconPositions() {
    try {
        localStorage.setItem(
            'morrowindows.desktopIconPositions',
            JSON.stringify(MorrowindOS.desktopIconPositions)
        );
    } catch (error) {
        console.warn('Failed to save desktop icon positions', error);
    }
}

function initializeContextMenu() {
    MorrowindOS.contextMenu = document.getElementById('context-menu');

    // Context menu items
    const refreshDesktopItem = document.getElementById('refresh-desktop');
    if (refreshDesktopItem) {
        refreshDesktopItem.addEventListener('click', () => {
            refreshDesktop();
            hideContextMenu();
        });
    }

    const changeWallpaper = document.getElementById('change-wallpaper');
    if (changeWallpaper) {
        changeWallpaper.addEventListener('click', () => {
            showNotification('Wallpaper Settings', 'This feature is coming soon in next arcane update!', 'warning');
            hideContextMenu();
        });
    }

    const openTerminal = document.getElementById('open-terminal');
    if (openTerminal) {
        openTerminal.addEventListener('click', () => {
            showNotification('Terminal', 'The mystical terminal is under construction. Check back later!', 'warning');
            hideContextMenu();
        });
    }

    const systemSettings = document.getElementById('system-settings');
    if (systemSettings) {
        systemSettings.addEventListener('click', () => {
            showNotification('System Settings', 'The ancient settings are being deciphered. Try again later!', 'warning');
            hideContextMenu();
        });
    }
}

function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }
}

function initializeParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);

    // Create particles
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random size
    const size = Math.random() * 4 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Random position
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;

    // Random animation
    const animationType = Math.random() > 0.5 ? 'animate-float-up' : 'animate-float-side';
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;

    particle.classList.add(animationType);
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    container.appendChild(particle);
    MorrowindOS.particles.push(particle);
}

function initializeMist() {
    const mistContainer = document.createElement('div');
    mistContainer.className = 'mist-container';
    document.body.appendChild(mistContainer);

    // Create mist layers
    for (let i = 0; i < 5; i++) {
        createMistLayer(mistContainer);
    }
}

function createMistLayer(container) {
    const mist = document.createElement('div');
    mist.className = 'mist';

    // Random size
    const width = Math.random() * 300 + 200;
    const height = Math.random() * 150 + 100;
    mist.style.width = `${width}px`;
    mist.style.height = `${height}px`;

    // Random position
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    mist.style.left = `${startX}px`;
    mist.style.top = `${startY}px`;

    // Random animation
    const duration = Math.random() * 30 + 20;
    const delay = Math.random() * 10;

    mist.classList.add('animate-mist-drift');
    mist.style.animationDuration = `${duration}s`;
    mist.style.animationDelay = `${delay}s`;

    container.appendChild(mist);
    MorrowindOS.mist.push(mist);
}

function openApp(appName) {
    if (!AppRegistry[appName]) {
        showNotification('Error', 'The ancient magic failed to summon this application.', 'error');
        return;
    }

    // Check if app is already open using windowManager
    if (window.windowManager) {
        const existingWindows = window.windowManager.getAllWindows();
        const existingWindow = existingWindows.find(w => w.appName === appName);
        if (existingWindow) {
            window.windowManager.focusWindow(existingWindow.id);
            return;
        }
    }

    // Create new window using windowManager
    const windowId = `window-${appName}-${Date.now()}`;
    const appConfig = AppRegistry[appName];

    // Get responsive dimensions
    const responsiveDimensions = getResponsiveAppDimensions(appConfig);

    // Create loading content
    const loadingContent = '<div class="spinner"></div>';

    const windowObj = window.windowManager.createWindow({
        id: windowId,
        title: appConfig.title,
        content: loadingContent,
        width: responsiveDimensions.width,
        height: responsiveDimensions.height,
        minWidth: responsiveDimensions.minWidth,
        minHeight: responsiveDimensions.minHeight,
        resizable: appConfig.resizable,
        logo: appConfig.logo,
        className: 'animate-window-open'
    });

    // Add custom property for app name
    windowObj.appName = appName;

    // Add to taskbar using taskbarManager
    if (window.taskbarManager) {
        window.taskbarManager.addTaskbarItem(windowId, appConfig);
    }

    // Add to windows list for backward compatibility
    MorrowindOS.windows.push({
        id: windowId,
        appName: appName,
        element: windowObj.element,
        isMinimized: false
    });

    // Initialize app
    bootAppWindow(appName, windowId);

    // Show notification
    showNotification(appConfig.name, `${appConfig.name} has been summoned from ethereal realm.`, 'success');
}

function showContextMenu(event, type, data = {}) {
    hideContextMenu();

    const contextMenu = MorrowindOS.contextMenu;
    if (contextMenu) {
        // Position context menu
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        // Show context menu
        contextMenu.classList.remove('hidden');

        // Prevent event propagation
        event.stopPropagation();
    }
}

function hideContextMenu() {
    const contextMenu = MorrowindOS.contextMenu;
    if (contextMenu) {
        contextMenu.classList.add('hidden');
    }
}

function showNotification(title, message, type = 'info', showConfirm = false, onConfirm = null) {
    // If confirmation is requested, show a modal instead
    if (showConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content animate-scale-in">
                <div class="modal-header">${title}</div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-notification">Cancel</button>
                    <button class="btn" id="confirm-notification">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('cancel-notification').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('confirm-notification').addEventListener('click', () => {
            modal.remove();
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return;
    }

    // Regular notification
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate-notification-slide-in`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('animate-notification-slide-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function showShutdownDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content animate-scale-in">
            <div class="modal-header">Shut Down Morrowind-OwS</div>
            <div class="modal-body">
                <p>Are you sure you want to shut down mystical operating system?</p>
                <p>All arcane processes will be terminated.</p>
            </div>
            <div class="modal-footer">
                <button class="btn" id="cancel-shutdown">Cancel</button>
                <button class="btn btn-danger" id="confirm-shutdown">Shut Down</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('cancel-shutdown').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('confirm-shutdown').addEventListener('click', () => {
        modal.remove();
        shutdownOS();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function shutdownOS() {
    showLoadingScreen();

    const loadingText = document.querySelector('.loading-text');
    const loadingSubtitle = document.querySelector('.loading-subtitle');

    if (loadingText) loadingText.textContent = 'Shutting Down';
    if (loadingSubtitle) loadingSubtitle.textContent = 'The ancient magic is fading...';

    // Close all windows
    if (window.windowManager) {
        window.windowManager.closeAllWindows();
    }

    // Simulate shutdown process
    setTimeout(() => {
        // In a real implementation, this would close browser tab or window
        showNotification('Shutdown Complete', 'The mystical operating system has been powered down. Farewell, traveler.', 'success');
    }, 2000);
}

function refreshDesktop() {
    // Refresh desktop icons
    MorrowindOS.desktopIcons.forEach(icon => {
        icon.element.classList.add('animate-pulse');
        setTimeout(() => {
            icon.element.classList.remove('animate-pulse');
        }, 1000);
    });

    showNotification('Desktop Refreshed', 'The mystical energies have been realigned.', 'success');
}

function loadSavedState() {
    try {
        const positions = localStorage.getItem('morrowindows.desktopIconPositions');
        if (positions) {
            MorrowindOS.desktopIconPositions = JSON.parse(positions) || {};
        }
    } catch (error) {
        console.warn('Failed to load desktop icon positions', error);
        MorrowindOS.desktopIconPositions = {};
    }
}

function saveState() {
    saveDesktopIconPositions();
}

// Initialize app-specific code
function bootAppWindow(appName, windowId) {
    console.log(`Initializing app: ${appName} in window: ${windowId}`);

    // Load app content
    const contentElement = document.getElementById(`${windowId}-content`);
    if (contentElement) {
        // Load app-specific content via registry
        setTimeout(() => {
            if (typeof MorrowindOS.loadAppContent === 'function') {
                MorrowindOS.loadAppContent(appName, windowId);
            } else {
                console.error(`No loadAppContent handler registered for app: ${appName}`);
            }
        }, 500);
    }
}

MorrowindOS.loadAppContent = function loadAppContent(appName, windowId) {
    if (window.MorrowindOS.apps && window.MorrowindOS.apps[appName]) {
        window.MorrowindOS.apps[appName](windowId);
        return;
    }

    // Allow optional registry object if you want class-based apps later
    if (window.AppInitializers && window.AppInitializers[appName]) {
        window.AppInitializers[appName](windowId);
        return;
    }

    console.error(`No initialization function found for app: ${appName}`);
};

function cleanupApp(appName, windowId) {
    // This will be implemented in individual app files
    console.log(`Cleaning up app: ${appName} in window: ${windowId}`);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Window resize is now handled by windowManager
    if (window.windowManager) {
        window.windowManager.handleWindowResize();
    }

    applyDesktopIconPositions();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + Tab to switch between windows
    if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        switchWindow();
    }

    // Escape to close context menu or start menu
    if (e.key === 'Escape') {
        hideContextMenu();
        if (window.taskbarManager) {
            window.taskbarManager.hideStartMenu();
        }
    }

    // Ctrl + Alt + Delete for system menu (placeholder)
    if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault();
        showNotification('System Menu', 'The ancient system menu is under construction.', 'warning');
    }
});

function switchWindow() {
    if (window.windowManager) {
        const visibleWindows = window.windowManager.getVisibleWindows();
        if (visibleWindows.length <= 1) return;

        const currentWindow = window.windowManager.getWindow(window.windowManager.activeWindow);
        let nextWindow;

        if (!currentWindow) {
            nextWindow = visibleWindows[0];
        } else {
            const currentIndex = visibleWindows.findIndex(w => w.id === currentWindow.id);
            const nextIndex = (currentIndex + 1) % visibleWindows.length;
            nextWindow = visibleWindows[nextIndex];
        }

        if (nextWindow) {
            if (nextWindow.isMinimized) {
                window.windowManager.restoreWindow(nextWindow.id);
            } else {
                window.windowManager.focusWindow(nextWindow.id);
            }
        }
    }
}

// Export for use in other files
window.MorrowindOS = MorrowindOS;
window.MorrowindOS.showNotification = showNotification;
window.AppRegistry = AppRegistry;

// Initialize session cleanup for API keys
function initializeSessionCleanup() {
    // Clear API keys when the browser tab or window is closed
    window.addEventListener('beforeunload', () => {
        // Clear API keys from sessionStorage
        sessionStorage.removeItem('openai-api-key');
        sessionStorage.removeItem('elevenlabs-api-key');
    });
}

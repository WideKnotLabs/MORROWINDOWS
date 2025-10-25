// Morrowind-OwS Window Manager

// Window Manager Class
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndexCounter = 100;
        this.minimizedWindows = new Set();
        this.maximizedWindows = new Set();
    }

    createWindow(options) {
        const {
            id,
            title,
            content,
            width = 800,
            height = 600,
            minWidth = 400,
            minHeight = 300,
            x = null,
            y = null,
            resizable = true,
            closable = true,
            minimizable = true,
            maximizable = true,
            className = '',
            logo = null
        } = options;

        // Check if window already exists
        if (this.windows.has(id)) {
            this.focusWindow(id);
            return this.windows.get(id);
        }

        // Create window element
        const windowElement = document.createElement('div');
        windowElement.className = `window ${className}`;
        windowElement.id = id;

        // Calculate position if not provided
        const posX = x !== null ? x : Math.random() * (window.innerWidth - width - 100) + 50;
        const posY = y !== null ? y : Math.random() * (window.innerHeight - height - 150) + 50;

        // Set styles
        windowElement.style.left = `${posX}px`;
        windowElement.style.top = `${posY}px`;
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
        windowElement.style.minWidth = `${minWidth}px`;
        windowElement.style.minHeight = `${minHeight}px`;
        windowElement.style.zIndex = this.zIndexCounter++;

        // Build window HTML
        let controlsHTML = '';
        if (minimizable) controlsHTML += '<div class="window-control minimize" data-action="minimize"></div>';
        if (maximizable) controlsHTML += '<div class="window-control maximize" data-action="maximize"></div>';
        if (closable) controlsHTML += '<div class="window-control close" data-action="close"></div>';

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-header-left">
                    ${logo ? `<div class="window-logo ${logo}"></div>` : ''}
                    <div class="window-title">${title}</div>
                </div>
                <div class="window-controls">
                    ${controlsHTML}
                </div>
            </div>
            <div class="window-content" id="${id}-content">
                ${content}
            </div>
            ${resizable ? '<div class="window-resize-handle"></div>' : ''}
        `;

        // Add to DOM
        const container = document.getElementById('windows-container');
        if (!container) {
            console.error('Missing #windows-container');
            return null;
        }
        container.appendChild(windowElement);

        // Create window object
        const windowObj = {
            id,
            element: windowElement,
            title,
            width,
            height,
            minWidth,
            minHeight,
            x: posX,
            y: posY,
            resizable,
            closable,
            minimizable,
            maximizable,
            logo,
            isMinimized: false,
            isMaximized: false,
            originalState: null
        };

        // Store window
        this.windows.set(id, windowObj);

        // Setup event listeners
        this.setupWindowEvents(windowObj);

        // Focus window
        this.focusWindow(id);

        // Add animation
        windowElement.classList.add('animate-window-open');

        return windowObj;
    }

    setupWindowEvents(windowObj) {
        const { element, id } = windowObj;

        // Window controls
        const controls = element.querySelectorAll('.window-control');
        controls.forEach(control => {
            // Mouse events
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = control.getAttribute('data-action');
                this.handleWindowControl(id, action);
            });
            
            // Touch events for mobile
            control.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = control.getAttribute('data-action');
                this.handleWindowControl(id, action);
            });
        });

        // Make draggable
        const header = element.querySelector('.window-header');
        this.makeDraggable(windowObj, header);

        // Make resizable if enabled
        if (windowObj.resizable) {
            const resizeHandle = element.querySelector('.window-resize-handle');
            this.makeResizable(windowObj, resizeHandle);
        }

        // Focus on click
        element.addEventListener('mousedown', () => {
            this.focusWindow(id);
        });

        // Handle window state changes
        element.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'width' || e.propertyName === 'height') {
                this.updateWindowState(windowObj);
            }
        });
    }

    makeDraggable(windowObj, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Mouse events
        handle.onmousedown = (e) => {
            if (windowObj.isMaximized) return;
            
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.updateWindowState(windowObj);
            };
            
            document.onmousemove = (e) => {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                
                const newTop = windowObj.element.offsetTop - pos2;
                const newLeft = windowObj.element.offsetLeft - pos1;
                
                // Keep window within viewport
                const maxTop = window.innerHeight - windowObj.element.offsetHeight;
                const maxLeft = window.innerWidth - windowObj.element.offsetWidth;
                
                windowObj.element.style.top = Math.min(Math.max(0, newTop), maxTop) + "px";
                windowObj.element.style.left = Math.min(Math.max(0, newLeft), maxLeft) + "px";
            };
        };
        
        // Touch events for mobile
        handle.ontouchstart = (e) => {
            if (windowObj.isMaximized) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            
            const handleTouchEnd = () => {
                document.ontouchend = null;
                document.ontouchmove = null;
                this.updateWindowState(windowObj);
            };
            
            const handleTouchMove = (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                pos1 = pos3 - touch.clientX;
                pos2 = pos4 - touch.clientY;
                pos3 = touch.clientX;
                pos4 = touch.clientY;
                
                const newTop = windowObj.element.offsetTop - pos2;
                const newLeft = windowObj.element.offsetLeft - pos1;
                
                // Keep window within viewport
                const maxTop = window.innerHeight - windowObj.element.offsetHeight;
                const maxLeft = window.innerWidth - windowObj.element.offsetWidth;
                
                windowObj.element.style.top = Math.min(Math.max(0, newTop), maxTop) + "px";
                windowObj.element.style.left = Math.min(Math.max(0, newLeft), maxLeft) + "px";
            };
            
            document.ontouchend = handleTouchEnd;
            document.ontouchmove = handleTouchMove;
        };
    }

    makeResizable(windowObj, handle) {
        let startX, startY, startWidth, startHeight;
        
        // Mouse events
        handle.onmousedown = (e) => {
            if (windowObj.isMaximized) return;
            
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowObj.element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowObj.element).height, 10);
            
            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.updateWindowState(windowObj);
            };
            
            document.onmousemove = (e) => {
                e.preventDefault();
                const newWidth = startWidth + e.clientX - startX;
                const newHeight = startHeight + e.clientY - startY;
                
                // Respect min dimensions
                if (newWidth >= windowObj.minWidth) {
                    windowObj.element.style.width = newWidth + 'px';
                }
                
                if (newHeight >= windowObj.minHeight) {
                    windowObj.element.style.height = newHeight + 'px';
                }
            };
        };
        
        // Touch events for mobile
        handle.ontouchstart = (e) => {
            if (windowObj.isMaximized) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowObj.element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowObj.element).height, 10);
            
            const handleTouchEnd = () => {
                document.ontouchend = null;
                document.ontouchmove = null;
                this.updateWindowState(windowObj);
            };
            
            const handleTouchMove = (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const newWidth = startWidth + touch.clientX - startX;
                const newHeight = startHeight + touch.clientY - startY;
                
                // Respect min dimensions
                if (newWidth >= windowObj.minWidth) {
                    windowObj.element.style.width = newWidth + 'px';
                }
                
                if (newHeight >= windowObj.minHeight) {
                    windowObj.element.style.height = newHeight + 'px';
                }
            };
            
            document.ontouchend = handleTouchEnd;
            document.ontouchmove = handleTouchMove;
        };
    }

    handleWindowControl(windowId, action) {
        switch (action) {
            case 'minimize':
                this.minimizeWindow(windowId);
                break;
            case 'maximize':
                this.maximizeWindow(windowId);
                break;
            case 'close':
                this.closeWindow(windowId);
                break;
        }
    }

    minimizeWindow(windowId) {
        const windowObj = this.windows.get(windowId);
        if (!windowObj || !windowObj.minimizable) return;

        // Save current state if not minimized
        if (!windowObj.isMinimized) {
            windowObj.originalState = {
                x: windowObj.element.style.left,
                y: windowObj.element.style.top,
                width: windowObj.element.style.width,
                height: windowObj.element.style.height
            };
        }

        windowObj.element.classList.add('hidden');
        windowObj.isMinimized = true;
        this.minimizedWindows.add(windowId);

        // Update taskbar
        this.updateTaskbarItem(windowId, 'minimize');

        // Focus next window if available
        if (this.activeWindow === windowId) {
            this.focusNextWindow();
        }
    }

    maximizeWindow(windowId) {
        const windowObj = this.windows.get(windowId);
        if (!windowObj || !windowObj.maximizable) return;

        if (windowObj.isMaximized) {
            // Restore to original size
            windowObj.element.classList.remove('maximized');
            windowObj.element.style.top = windowObj.originalState.y || '0px';
            windowObj.element.style.left = windowObj.originalState.x || '0px';
            windowObj.element.style.width = windowObj.originalState.width || '800px';
            windowObj.element.style.height = windowObj.originalState.height || '600px';
            windowObj.isMaximized = false;
            this.maximizedWindows.delete(windowId);
        } else {
            // Save current state
            windowObj.originalState = {
                x: windowObj.element.style.left,
                y: windowObj.element.style.top,
                width: windowObj.element.style.width,
                height: windowObj.element.style.height
            };

            // Maximize
            windowObj.element.classList.add('maximized');
            windowObj.element.style.top = '0px';
            windowObj.element.style.left = '0px';
            windowObj.element.style.width = '100%';
            windowObj.element.style.height = 'calc(100% - 50px)'; // Account for taskbar
            windowObj.isMaximized = true;
            this.maximizedWindows.add(windowId);
        }

        this.updateTaskbarItem(windowId, 'maximize');
    }

    restoreWindow(windowId) {
        const windowObj = this.windows.get(windowId);
        if (!windowObj) return;

        if (windowObj.isMinimized) {
            windowObj.element.classList.remove('hidden');
            windowObj.isMinimized = false;
            this.minimizedWindows.delete(windowId);
            this.updateTaskbarItem(windowId, 'restore');
        }

        this.focusWindow(windowId);
    }

    closeWindow(windowId) {
        const windowObj = this.windows.get(windowId);
        if (!windowObj || !windowObj.closable) return;

        // Add close animation
        windowObj.element.classList.add('animate-window-close');

        setTimeout(() => {
            // Remove from DOM
            windowObj.element.remove();

            // Remove from collections
            this.windows.delete(windowId);
            this.minimizedWindows.delete(windowId);
            this.maximizedWindows.delete(windowId);

            // Remove from taskbar
            this.removeTaskbarItem(windowId);

            // Focus next window if this was active
            if (this.activeWindow === windowId) {
                this.focusNextWindow();
            }

            // Trigger close event
            this.onWindowClose(windowId);
        }, 300);
    }

    focusWindow(windowId) {
        const windowObj = this.windows.get(windowId);
        if (!windowObj) return;

        // Update active window
        this.activeWindow = windowId;

        // Update z-index
        this.zIndexCounter++;
        windowObj.element.style.zIndex = this.zIndexCounter;
        windowObj.element.classList.add('active');

        // Remove active class from other windows
        this.windows.forEach((w, id) => {
            if (id !== windowId) {
                w.element.classList.remove('active');
            }
        });

        // Update taskbar
        this.updateTaskbarActive(windowId);

        // Trigger focus event
        this.onWindowFocus(windowId);
    }

    focusNextWindow() {
        if (this.windows.size === 0) return;

        const visibleWindows = Array.from(this.windows.values()).filter(w => !w.isMinimized);
        if (visibleWindows.length === 0) return;

        // Find next window to focus
        let nextWindow;
        if (!this.activeWindow) {
            nextWindow = visibleWindows[0];
        } else {
            const currentIndex = visibleWindows.findIndex(w => w.id === this.activeWindow);
            const nextIndex = (currentIndex + 1) % visibleWindows.length;
            nextWindow = visibleWindows[nextIndex];
        }

        if (nextWindow) {
            this.focusWindow(nextWindow.id);
        }
    }

    updateWindowState(windowObj) {
        const rect = windowObj.element.getBoundingClientRect();
        windowObj.x = rect.left;
        windowObj.y = rect.top;
        windowObj.width = rect.width;
        windowObj.height = rect.height;
    }

    updateTaskbarItem(windowId, action) {
        const taskbarItem = document.querySelector(`[data-window-id="${windowId}"]`);
        if (!taskbarItem) return;

        switch (action) {
            case 'minimize':
                taskbarItem.classList.add('minimized');
                break;
            case 'restore':
                taskbarItem.classList.remove('minimized');
                break;
            case 'maximize':
                taskbarItem.classList.toggle('maximized');
                break;
        }
    }

    updateTaskbarActive(windowId) {
        // Remove active class from all taskbar items
        document.querySelectorAll('.taskbar-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current window's taskbar item
        const taskbarItem = document.querySelector(`[data-window-id="${windowId}"]`);
        if (taskbarItem) {
            taskbarItem.classList.add('active');
        }
    }

    removeTaskbarItem(windowId) {
        const taskbarItem = document.querySelector(`[data-window-id="${windowId}"]`);
        if (taskbarItem) {
            taskbarItem.remove();
        }
    }

    addTaskbarItem(windowId, config) {
        const taskbarCenter = document.getElementById('taskbar-center');
        if (!taskbarCenter) return;

        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.setAttribute('data-window-id', windowId);
        taskbarItem.innerHTML = `
            <div class="${config.icon}"></div>
            <div class="taskbar-item-label">${config.name}</div>
        `;

        taskbarItem.addEventListener('click', () => {
            const windowObj = this.windows.get(windowId);
            if (windowObj) {
                if (windowObj.isMinimized) {
                    this.restoreWindow(windowId);
                } else {
                    this.focusWindow(windowId);
                }
            }
        });

        taskbarCenter.appendChild(taskbarItem);
    }

    // Event handlers (can be overridden)
    onWindowClose(windowId) {
        console.log(`Window ${windowId} closed`);
    }

    onWindowFocus(windowId) {
        console.log(`Window ${windowId} focused`);
    }

    // Utility methods
    getWindow(windowId) {
        return this.windows.get(windowId);
    }

    getAllWindows() {
        return Array.from(this.windows.values());
    }

    getVisibleWindows() {
        return Array.from(this.windows.values()).filter(w => !w.isMinimized);
    }

    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => {
            this.closeWindow(id);
        });
    }

    minimizeAllWindows() {
        this.windows.forEach((windowObj, id) => {
            if (windowObj.minimizable && !windowObj.isMinimized) {
                this.minimizeWindow(id);
            }
        });
    }

    // Handle window resize
    handleWindowResize() {
        this.windows.forEach(windowObj => {
            const rect = windowObj.element.getBoundingClientRect();
            
            // Ensure window stays within viewport
            if (rect.right > window.innerWidth) {
                windowObj.element.style.left = `${window.innerWidth - rect.width - 10}px`;
            }
            
            if (rect.bottom > window.innerHeight - 50) { // Account for taskbar
                windowObj.element.style.top = `${window.innerHeight - rect.height - 60}px`;
            }
            
            this.updateWindowState(windowObj);
        });
    }
}

// Create global window manager instance
const windowManager = new WindowManager();

// Handle window resize
window.addEventListener('resize', () => {
    windowManager.handleWindowResize();
});

// Export for use in other files
window.WindowManager = WindowManager;
window.windowManager = windowManager;
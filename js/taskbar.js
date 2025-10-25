// Morrowind-OwS Taskbar Manager

// Taskbar Manager Class
class TaskbarManager {
    constructor() {
        this.taskbarItems = new Map();
        this.quickLaunchItems = new Map();
        this.systemTrayItems = new Map();
        this.clockInterval = null;
        this.startMenuOpen = false;
        this.notificationPanelOpen = false;
        this.wifiPanelOpen = false;
    }

    initialize() {
        this.setupStartMenu();
        this.setupQuickLaunch();
        this.setupSystemTray();
        this.setupClock();
        this.setupTaskbarEvents();
    }

    setupStartMenu() {
        const startMenuBtn = document.getElementById('start-menu');
        if (startMenuBtn) {
            // Remove any existing event listeners to prevent duplicates
            startMenuBtn.removeEventListener('click', this.toggleStartMenuHandler);
            
            // Create a bound handler to maintain context
            this.toggleStartMenuHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleStartMenu();
            };
            
            // Add the new event listener
            startMenuBtn.addEventListener('click', this.toggleStartMenuHandler);
        }

        // Start menu apps
        const startMenuApps = document.querySelectorAll('.start-menu-app');
        startMenuApps.forEach(app => {
            const appName = app.getAttribute('data-app');
            if (appName && window.AppRegistry && window.AppRegistry[appName]) {
                app.addEventListener('click', () => {
                    this.openApp(appName);
                    this.hideStartMenu();
                });
            }
        });

        // Start menu footer items
        const systemSettingsBtn = document.getElementById('system-settings-btn');
        if (systemSettingsBtn) {
            systemSettingsBtn.addEventListener('click', () => {
                this.showSystemSettings();
                this.hideStartMenu();
            });
        }

        const shutdownBtn = document.getElementById('shutdown-btn');
        if (shutdownBtn) {
            shutdownBtn.addEventListener('click', () => {
                this.showShutdownDialog();
            });
        }
    }

    setupQuickLaunch() {
        const quickLaunch = document.getElementById('quick-launch');
        if (!quickLaunch) return;

        // Add default quick launch items
        const defaultApps = ['scrolldit', 'oracle'];
        defaultApps.forEach(appName => {
            if (window.AppRegistry && window.AppRegistry[appName]) {
                this.addQuickLaunchItem(appName);
            }
        });
    }

    setupSystemTray() {
        const systemTrayIcons = document.querySelectorAll('.system-tray-icon');
        systemTrayIcons.forEach(icon => {
            const iconId = icon.getAttribute('id');
            if (iconId) {
                icon.addEventListener('click', () => {
                    this.handleSystemTrayClick(iconId);
                });
            }
        });
    }

    setupClock() {
        this.updateClock();
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    setupTaskbarEvents() {
        // Hide panels when clicking outside
        document.addEventListener('click', (e) => {
            const startMenuPanel = document.getElementById('start-menu-panel');
            const startMenuBtn = document.getElementById('start-menu');
            const notificationPanel = document.getElementById('notification-panel');
            const notificationIcon = document.getElementById('notification-icon');
            const wifiPanel = document.getElementById('wifi-panel');
            const networkIcon = document.getElementById('network-icon');
            
            // Use setTimeout to ensure start menu toggle completes before checking for outside clicks
            setTimeout(() => {
                if (this.startMenuOpen &&
                    startMenuPanel &&
                    !startMenuPanel.contains(e.target) &&
                    !startMenuBtn.contains(e.target)) {
                    this.hideStartMenu();
                }
                
                if (this.notificationPanelOpen &&
                    notificationPanel &&
                    !notificationPanel.contains(e.target) &&
                    !notificationIcon.contains(e.target)) {
                    this.hideNotificationPanel();
                }
                
                if (this.wifiPanelOpen &&
                    wifiPanel &&
                    !wifiPanel.contains(e.target) &&
                    !networkIcon.contains(e.target)) {
                    this.hideWifiPanel();
                }
            }, 10); // Small delay to ensure toggle completes first
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Windows key or Ctrl+Esc to toggle start menu
            if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
                e.preventDefault();
                this.toggleStartMenu();
            }
        });
    }

    toggleStartMenu() {
        console.log('toggleStartMenu called, current state:', this.startMenuOpen);
        if (this.startMenuOpen) {
            this.hideStartMenu();
        } else {
            this.showStartMenu();
        }
    }

    showStartMenu() {
        console.log('showStartMenu called');
        const startMenuPanel = document.getElementById('start-menu-panel');
        if (startMenuPanel) {
            startMenuPanel.classList.remove('hidden');
            startMenuPanel.classList.add('animate-slide-in-up');
            this.startMenuOpen = true;
            console.log('Start menu opened');
        } else {
            console.error('Start menu panel not found');
        }
    }

    hideStartMenu() {
        console.log('hideStartMenu called');
        const startMenuPanel = document.getElementById('start-menu-panel');
        if (startMenuPanel) {
            startMenuPanel.classList.add('hidden');
            startMenuPanel.classList.remove('animate-slide-in-up');
            this.startMenuOpen = false;
            console.log('Start menu hidden');
        } else {
            console.error('Start menu panel not found');
        }
    }

    toggleNotificationPanel() {
        if (this.notificationPanelOpen) {
            this.hideNotificationPanel();
        } else {
            this.showNotificationPanel();
        }
    }

    showNotificationPanel() {
        const notificationPanel = document.getElementById('notification-panel');
        if (notificationPanel) {
            notificationPanel.classList.remove('hidden');
            notificationPanel.classList.add('animate-slide-in-up');
            this.notificationPanelOpen = true;
            
            // Setup notification option listeners
            this.setupNotificationOptions();
        }
    }

    hideNotificationPanel() {
        const notificationPanel = document.getElementById('notification-panel');
        if (notificationPanel) {
            notificationPanel.classList.add('hidden');
            notificationPanel.classList.remove('animate-slide-in-up');
            this.notificationPanelOpen = false;
        }
    }

    setupNotificationOptions() {
        const notificationsActive = document.getElementById('notifications-active');
        const notificationsDisabled = document.getElementById('notifications-disabled');
        
        if (notificationsActive) {
            notificationsActive.addEventListener('click', () => {
                this.enableNotifications();
                this.hideNotificationPanel();
            });
        }
        
        if (notificationsDisabled) {
            notificationsDisabled.addEventListener('click', () => {
                this.disableNotifications();
                this.hideNotificationPanel();
            });
        }
    }

    enableNotifications() {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Notifications',
                'Notifications have been enabled. You will receive alerts from the ethereal realm.',
                'success'
            );
        }
    }

    disableNotifications() {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Notifications',
                'Notifications shall not pass. You will no longer receive alerts from the ethereal realm.',
                'warning'
            );
        }
    }

    addTaskbarItem(windowId, config) {
        const taskbarCenter = document.getElementById('taskbar-center');
        if (!taskbarCenter) return;

        // Remove existing item if it exists
        this.removeTaskbarItem(windowId);

        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.setAttribute('data-window-id', windowId);
        
        // Create icon element
        const iconElement = document.createElement('div');
        iconElement.className = `taskbar-item-icon ${config.icon}`;
        
        // Create label element
        const labelElement = document.createElement('div');
        labelElement.className = 'taskbar-item-label';
        labelElement.textContent = config.name;
        
        // Append elements
        taskbarItem.appendChild(iconElement);
        taskbarItem.appendChild(labelElement);

        taskbarItem.addEventListener('click', () => {
            this.handleTaskbarItemClick(windowId);
        });

        taskbarItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTaskItemContextMenu(e, windowId);
        });

        taskbarCenter.appendChild(taskbarItem);
        this.taskbarItems.set(windowId, taskbarItem);

        // Add animation
        taskbarItem.classList.add('animate-slide-in-up');
    }

    removeTaskbarItem(windowId) {
        const taskbarItem = this.taskbarItems.get(windowId);
        if (taskbarItem) {
            taskbarItem.remove();
            this.taskbarItems.delete(windowId);
        }
    }

    updateTaskbarItem(windowId, state) {
        const taskbarItem = this.taskbarItems.get(windowId);
        if (!taskbarItem) return;

        // Remove all state classes
        taskbarItem.classList.remove('active', 'minimized', 'maximized');

        // Add appropriate state class
        if (state === 'active') {
            taskbarItem.classList.add('active');
        } else if (state === 'minimized') {
            taskbarItem.classList.add('minimized');
        } else if (state === 'maximized') {
            taskbarItem.classList.add('maximized');
        }
    }

    handleTaskbarItemClick(windowId) {
        if (window.windowManager) {
            const windowObj = window.windowManager.getWindow(windowId);
            if (windowObj) {
                if (windowObj.isMinimized) {
                    window.windowManager.restoreWindow(windowId);
                } else {
                    window.windowManager.focusWindow(windowId);
                }
            }
        }
    }

    addQuickLaunchItem(appName) {
        const quickLaunch = document.getElementById('quick-launch');
        if (!quickLaunch || !window.AppRegistry || !window.AppRegistry[appName]) return;

        const appConfig = window.AppRegistry[appName];
        const quickLaunchItem = document.createElement('div');
        quickLaunchItem.className = 'taskbar-button quick-launch-item';
        quickLaunchItem.setAttribute('data-app', appName);
        quickLaunchItem.innerHTML = `<div class="${appConfig.icon}"></div>`;

        quickLaunchItem.addEventListener('click', () => {
            this.openApp(appName);
        });

        quickLaunchItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showQuickLaunchContextMenu(e, appName);
        });

        quickLaunch.appendChild(quickLaunchItem);
        this.quickLaunchItems.set(appName, quickLaunchItem);
    }

    removeQuickLaunchItem(appName) {
        const quickLaunchItem = this.quickLaunchItems.get(appName);
        if (quickLaunchItem) {
            quickLaunchItem.remove();
            this.quickLaunchItems.delete(appName);
        }
    }

    addSystemTrayItem(id, config) {
        const systemTray = document.getElementById('system-tray');
        if (!systemTray) return;

        // Remove existing item if it exists
        this.removeSystemTrayItem(id);

        const trayItem = document.createElement('div');
        trayItem.className = 'system-tray-icon';
        trayItem.setAttribute('id', id);
        trayItem.setAttribute('title', config.tooltip || '');
        
        if (config.icon) {
            trayItem.style.backgroundImage = `url(${config.icon})`;
        } else if (config.iconClass) {
            trayItem.classList.add(config.iconClass);
        }

        trayItem.addEventListener('click', () => {
            if (config.onClick) {
                config.onClick();
            } else {
                this.handleSystemTrayClick(id);
            }
        });

        trayItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (config.onContextMenu) {
                config.onContextMenu(e);
            }
        });

        systemTray.appendChild(trayItem);
        this.systemTrayItems.set(id, trayItem);
    }

    removeSystemTrayItem(id) {
        const trayItem = this.systemTrayItems.get(id);
        if (trayItem) {
            trayItem.remove();
            this.systemTrayItems.delete(id);
        }
    }

    handleSystemTrayClick(iconId) {
        switch (iconId) {
            case 'notification-icon':
                this.toggleNotificationPanel();
                break;
            case 'network-icon':
                this.toggleWifiPanel();
                break;
            case 'volume-icon':
                this.showVolumeControl();
                break;
            default:
                console.log(`System tray item ${iconId} clicked`);
        }
    }

    updateClock() {
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}`;
            
            // Add date as tooltip
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            clockElement.setAttribute('title', now.toLocaleDateString('en-US', options));
        }
    }

    openApp(appName) {
        if (window.MorrowindOS && window.MorrowindOS.openApp) {
            window.MorrowindOS.openApp(appName);
        }
    }

    showTaskItemContextMenu(event, windowId) {
        // Create context menu for taskbar item
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        const windowObj = window.windowManager ? window.windowManager.getWindow(windowId) : null;
        
        let menuHTML = '';
        
        if (windowObj) {
            if (windowObj.isMinimized) {
                menuHTML += '<div class="context-menu-item" id="restore-window">Restore</div>';
            } else {
                menuHTML += '<div class="context-menu-item" id="minimize-window">Minimize</div>';
            }
            
            if (windowObj.maximizable) {
                if (windowObj.isMaximized) {
                    menuHTML += '<div class="context-menu-item" id="restore-maximize">Restore Down</div>';
                } else {
                    menuHTML += '<div class="context-menu-item" id="maximize-window">Maximize</div>';
                }
            }
            
            menuHTML += '<div class="context-menu-separator"></div>';
        }
        
        menuHTML += '<div class="context-menu-item" id="close-window">Close</div>';

        contextMenu.innerHTML = menuHTML;
        document.body.appendChild(contextMenu);

        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.getAttribute('id');
            this.handleTaskItemContextMenuAction(action, windowId);
            contextMenu.remove();
        });

        // Remove on click outside
        document.addEventListener('click', function removeContextMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeContextMenu);
        });
    }

    handleTaskItemContextMenuAction(action, windowId) {
        if (!window.windowManager) return;

        switch (action) {
            case 'restore-window':
                window.windowManager.restoreWindow(windowId);
                break;
            case 'minimize-window':
                window.windowManager.minimizeWindow(windowId);
                break;
            case 'maximize-window':
                window.windowManager.maximizeWindow(windowId);
                break;
            case 'restore-maximize':
                window.windowManager.maximizeWindow(windowId);
                break;
            case 'close-window':
                window.windowManager.closeWindow(windowId);
                break;
        }
    }

    showQuickLaunchContextMenu(event, appName) {
        // Create context menu for quick launch item
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        contextMenu.innerHTML = `
            <div class="context-menu-item" id="open-app">Open ${window.AppRegistry[appName].name}</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" id="remove-quick-launch">Remove from Quick Launch</div>
        `;

        document.body.appendChild(contextMenu);

        // Add event listeners
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.getAttribute('id');
            this.handleQuickLaunchContextMenuAction(action, appName);
            contextMenu.remove();
        });

        // Remove on click outside
        document.addEventListener('click', function removeContextMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeContextMenu);
        });
    }

    handleQuickLaunchContextMenuAction(action, appName) {
        switch (action) {
            case 'open-app':
                this.openApp(appName);
                break;
            case 'remove-quick-launch':
                this.removeQuickLaunchItem(appName);
                break;
        }
    }

    showNotificationPanel() {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Notifications', 
                'You have no new messages from the ethereal realm.', 
                'success'
            );
        }
    }

    showNetworkStatus() {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Network', 
                'Connected to the mystical network of ancient knowledge.', 
                'success'
            );
        }
    }

    showVolumeControl() {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'Volume',
                'The mystical sounds are at a comfortable level.',
                'success'
            );
        }
    }

    toggleWifiPanel() {
        if (this.wifiPanelOpen) {
            this.hideWifiPanel();
        } else {
            this.showWifiPanel();
        }
    }

    showWifiPanel() {
        const wifiPanel = document.getElementById('wifi-panel');
        if (wifiPanel) {
            wifiPanel.classList.remove('hidden');
            wifiPanel.classList.add('animate-slide-in-up');
            this.wifiPanelOpen = true;
            
            // Setup WiFi network listeners
            this.setupWifiNetworks();
        }
    }

    hideWifiPanel() {
        const wifiPanel = document.getElementById('wifi-panel');
        if (wifiPanel) {
            wifiPanel.classList.add('hidden');
            wifiPanel.classList.remove('animate-slide-in-up');
            this.wifiPanelOpen = false;
        }
    }

    setupWifiNetworks() {
        const wifiNetworks = document.querySelectorAll('.wifi-network');
        wifiNetworks.forEach(network => {
            const ssid = network.getAttribute('data-ssid');
            if (ssid) {
                network.addEventListener('click', () => {
                    this.connectToWifi(ssid);
                    this.hideWifiPanel();
                });
            }
        });
    }

    connectToWifi(ssid) {
        if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            if (ssid === 'Brawl Tavern') {
                window.MorrowindOS.showNotification(
                    'Network',
                    'Already connected to Brawl Tavern. This is your current network.',
                    'success'
                );
            } else {
                window.MorrowindOS.showNotification(
                    'Network',
                    `Connecting to ${ssid}... The mystical connection is being established.`,
                    'info'
                );
                
                // Simulate connection after a delay
                setTimeout(() => {
                    this.updateWifiConnection(ssid);
                }, 2000);
            }
        }
    }

    updateWifiConnection(newSsid) {
        // Remove current class from all networks
        const allNetworks = document.querySelectorAll('.wifi-network');
        allNetworks.forEach(network => {
            network.classList.remove('current');
            const statusElement = network.querySelector('.wifi-network-status');
            if (statusElement) {
                statusElement.textContent = 'Available';
            }
        });
        
        // Add current class to selected network
        const selectedNetwork = document.querySelector(`[data-ssid="${newSsid}"]`);
        if (selectedNetwork) {
            selectedNetwork.classList.add('current');
            const statusElement = selectedNetwork.querySelector('.wifi-network-status');
            if (statusElement) {
                statusElement.textContent = 'Connected';
            }
            
            if (window.MorrowindOS && window.MorrowindOS.showNotification) {
                window.MorrowindOS.showNotification(
                    'Network',
                    `Successfully connected to ${newSsid}. The mystical connection is complete.`,
                    'success'
                );
            }
        }
    }

    showSystemSettings() {
        if (window.systemSettingsApp && window.systemSettingsApp.open) {
            window.systemSettingsApp.open();
        } else if (window.MorrowindOS && window.MorrowindOS.showNotification) {
            window.MorrowindOS.showNotification(
                'System Settings',
                'The system settings app is not available.',
                'error'
            );
        }
    }

    showShutdownDialog() {
        if (window.MorrowindOS && window.MorrowindOS.showShutdownDialog) {
            window.MorrowindOS.showShutdownDialog();
        }
    }

    // Cleanup
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        
        this.taskbarItems.clear();
        this.quickLaunchItems.clear();
        this.systemTrayItems.clear();
    }
}

// Create global taskbar manager instance
const taskbarManager = new TaskbarManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    taskbarManager.initialize();
});

// Export for use in other files
window.TaskbarManager = TaskbarManager;
window.taskbarManager = taskbarManager;
(function($) {
    'use strict';


    // Model Actions Menu Implementation
    class ModelActionsMenu {
        constructor() {
            this.isOpen = false;
            this.currentModel = null;
            this.currentObjectId = null;
            this.actions = [];
            this.init();
        }

        init() {
            this.createMenuHTML();
            this.bindEvents();
            this.detectCurrentPage();
        }

        createMenuHTML() {
            // Create the sliding menu HTML
            const menuHTML = `
                <div id="model-actions-overlay" class="model-actions-overlay">
                    <div id="model-actions-menu" class="model-actions-menu">
                        <div class="model-actions-header">
                            <h3>Действия</h3>
                            <button id="close-actions-menu" class="close-btn">&times;</button>
                        </div>
                        <div class="model-actions-content">
                            <div id="actions-loading" class="actions-loading">
                                <div class="spinner"></div>
                                <span>Загрузка действий...</span>
                            </div>
                            <div id="actions-list" class="actions-list"></div>
                        </div>
                    </div>
                </div>

                <!-- Custom Confirmation Modal -->
                <div id="action-confirm-modal" class="action-confirm-modal">
                    <div class="action-confirm-overlay"></div>
                    <div class="action-confirm-dialog">
                        <div class="action-confirm-header">
                            <h3>Подтверждение действия</h3>
                            <button id="action-confirm-close" class="action-confirm-close">&times;</button>
                        </div>
                        <div class="action-confirm-content">
                            <div class="action-confirm-message">
                                <p id="action-confirm-text">Вы уверены, что хотите выполнить это действие?</p>
                            </div>
                            <div id="action-confirm-caution" class="action-confirm-caution" style="display: none;">
                                <div class="caution-icon"><img src="${$staticURLs.warningIcon}" width="32" alt=""></div>
                                <div class="caution-text"></div>
                            </div>
                            <div id="action-confirm-info" class="action-confirm-info" style="display: none;">
                                <div class="caution-icon"><img src="${$staticURLs.infoIcon}" width="32" alt=""></div>
                                <div class="caution-text"></div>
                            </div>
                            <div id="action-confirm-form" class="action-confirm-form" style="display: none;">
                                <div class="form-content"></div>
                            </div>
                        </div>
                        <div class="action-confirm-buttons">
                            <button id="action-confirm-cancel" class="action-confirm-btn action-confirm-btn-cancel">Отмена</button>
                            <button id="action-confirm-ok" class="action-confirm-btn action-confirm-btn-ok">Выполнить</button>
                        </div>
                    </div>
                </div>
            `;

            // Add CSS styles
            const styles = `
                <style>
                .model-actions-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }

                .model-actions-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                .model-actions-menu {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100%;
                    background-color: var(--body-bg);
                    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
                    transition: right 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    border-left: 1px solid var(--primary);
                }

                .model-actions-overlay.active .model-actions-menu {
                    right: 0;
                }

                .model-actions-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--hairline-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: var(--primary);
                    color: var(--text-color);
                }

                .model-actions-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--object-tools-fg);
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--object-tools-fg);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s ease;
                }

                .close-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .model-actions-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .actions-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    color: var(--body-quiet-color);
                }

                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid var(--hairline-color);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .actions-list {
                    display: none;
                }

                .action-item {
                    background-color: var(--darkened-bg);
                    border: 1px solid var(--hairline-color);
                    border-radius: 6px;
                    margin-bottom: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-item:hover {
                    background-color: var(--selected-bg);
                    border-color: var(--primary);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .action-item.confirm-required {
                    border-left: 4px solid var(--accent);
                }

                .action-item.is-page {
                    border-left: 4px solid var(--info);
                }

                .action-title {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--body-fg);
                    margin-bottom: 4px;
                }

                .action-description {
                    font-size: 12px;
                    color: var(--body-quiet-color);
                    line-height: 1.4;
                }

                .action-type-badge {
                    display: inline-block;
                    background-color: var(--primary);
                    color: var(--text-color);
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-top: 8px;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .action-type-badge.page {
                    background-color: var(--success);
                }

                .no-actions {
                    text-align: center;
                    color: var(--body-quiet-color);
                    padding: 40px 20px;
                    font-style: italic;
                }

                .action-category-header {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--primary);
                    margin: 20px 0 12px 0;
                    padding: 8px 12px;
                    background-color: var(--selected-bg);
                    /*border-left: 3px solid  var(--primary);*/
                    border-radius: 4px;
                    text-transform: uppercase;
                    cursor: move;
                    letter-spacing: 0.5px;
                    -webkit-touch-callout: none; /* iOS Safari */
                    -webkit-user-select: none; /* Safari */
                    -khtml-user-select: none; /* Konqueror HTML */
                    -moz-user-select: none; /* Old versions of Firefox */
                    -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none;
                    /* Non-prefixed version, currently
                                                     supported by Chrome, Edge, Opera and Firefox */
                    transition: all 0.2s ease;
                    position: relative;
                }

                .action-category-header:hover {
                    background-color: var(--primary);
                    color: var(--object-tools-fg);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }

                .action-category-header.dragging {
                    opacity: 0.7;
                    transform: rotate(2deg);
                    z-index: 1000;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                    cursor: grabbing;
                }

                .action-category-header.drag-over {
                    border-top: 3px solid var(--accent);
                    margin-top: 23px;
                }

                .action-category-section {
                    transition: all 0.2s ease;
                }

                .action-category-header:first-child {
                    margin-top: 0;
                }

                /* Actions button */
                .model-actions-trigger {
                    position: fixed;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: var(--primary);
                    color: var(--object-tools-fg);
                    border: none;
                    border-radius: 8px 0 0 8px;
                    padding: 20px 8px;
                    cursor: move;
                    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    z-index: 1000;
                    font-size: 12px;
                    font-weight: 500;
                    display: none;
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    min-height: 100px;
                    width: 40px;
                    text-align: center;
                    user-select: none;
                    border-right: none;
                }

                .model-actions-trigger:hover {
                    background-color: var(--accent);
                    transform: translateY(-50%) translateX(-5px);
                    box-shadow: -6px 0 16px rgba(0, 0, 0, 0.2);
                }

                .model-actions-trigger.dragging {
                    transition: none;
                    cursor: grabbing;
                }

                .model-actions-trigger.visible {
                    display: block !important;
                }

                /* Force show button for debugging */
                .model-actions-trigger.debug-visible {
                    display: block !important;
                    background-color: #ff6b6b !important;
                }

                /* Dark theme adjustments */
                [data-theme="dark"] .model-actions-menu {
                    background-color: var(--body-bg);
                    border-left-color: var(--hairline-color);
                }

                [data-theme="dark"] .action-item {
                    background-color: var(--darkened-bg);
                    border-color: var(--hairline-color);
                }

                [data-theme="dark"] .action-item:hover {
                    background-color: var(--selected-bg);
                }

                [data-theme="dark"] .action-category-header {
                    background-color: var(--darkened-bg);
                    color: var(--primary);
                    border-left-color: var(--primary);
                }

                /* Custom Confirmation Modal */
                .action-confirm-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: none;
                }

                .action-confirm-modal.active {
                    display: block;
                }

                .action-confirm-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.6);
                    animation: fadeIn 0.3s ease;
                }

                .action-confirm-dialog {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: var(--body-bg, #ffffff);
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    min-width: 400px;
                    max-width: 500px;
                    animation: slideIn 0.3s ease;
                }

                .action-confirm-header {
                    padding: 20px 20px 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    /*border-bottom: 1px solid var(--hairline-color, #e0e0e0);*/
                    margin-bottom: 20px;
                }

                .action-confirm-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--body-fg, #333333);
                }

                .action-confirm-close {
                    background: none;
                    border: none;
                    color: var(--body-quiet-color, #666666);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s ease;
                }

                .action-confirm-close:hover {
                    background-color: var(--hairline-color, #e0e0e0);
                }

                .action-confirm-content {
                    padding: 0 20px 20px 20px;
                }

                .action-confirm-message {
                    margin-bottom: 15px;
                }

                .action-confirm-message p {
                    margin: 0;
                    font-size: 16px;
                    color: var(--body-fg, #333333);
                    line-height: 1.5;
                }

                .action-confirm-caution {
                    background-color: var(--danger);
                    border: 1px solid var(--danger-light);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .action-confirm-info {
                    background-color: var(--info);
                    border: 1px solid var(--info);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .action-confirm-form {
                    margin-top: 16px;
                    padding: 16px;
                    background-color: var(--darkened-bg);
                    border: 1px solid var(--hairline-color);
                    border-radius: 6px;
                }

                .action-confirm-form .form-content {
                    font-size: 14px;
                }

                .action-confirm-form .form-content p {
                    margin: 0 0 12px 0;
                }

                .action-confirm-form .form-content label {
                    display: block;
                    margin-bottom: 4px;
                    font-weight: 600;
                    color: var(--body-fg);
                }

                .action-confirm-form .form-content input,
                .action-confirm-form .form-content select,
                .action-confirm-form .form-content textarea {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--hairline-color);
                    border-radius: 4px;
                    background-color: var(--body-bg);
                    color: var(--body-fg);
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .action-confirm-form .form-content input:focus,
                .action-confirm-form .form-content select:focus,
                .action-confirm-form .form-content textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
                }

                .action-confirm-form .form-content textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                /* Calendar widget styles */
                .calendar-date-widget,
                .calendar-datetime-widget,
                .calendar-time-widget {
                    position: relative;
                }

                .calendar-date-widget::-webkit-calendar-picker-indicator,
                .calendar-datetime-widget::-webkit-calendar-picker-indicator,
                .calendar-time-widget::-webkit-calendar-picker-indicator {
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
                    background-size: 16px 16px;
                    background-repeat: no-repeat;
                    background-position: center;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                }

                .calendar-date-widget::-webkit-calendar-picker-indicator:hover,
                .calendar-datetime-widget::-webkit-calendar-picker-indicator:hover,
                .calendar-time-widget::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }

                /* Dark theme adjustments for calendar widgets */
                [data-theme="dark"] .calendar-date-widget::-webkit-calendar-picker-indicator,
                [data-theme="dark"] .calendar-datetime-widget::-webkit-calendar-picker-indicator,
                [data-theme="dark"] .calendar-time-widget::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                }

                /* Admin-specific calendar widget styles */
                .vDateField.calendar-date-widget,
                .vDateTimeField.calendar-datetime-widget,
                .vTimeField.calendar-time-widget {
                    background-color: var(--body-bg, #ffffff);
                    border: 1px solid var(--border-color, #cccccc);
                    border-radius: 4px;
                    padding: 8px 12px;
                    font-size: 14px;
                    color: var(--body-fg, #333333);
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .vDateField.calendar-date-widget:focus,
                .vDateTimeField.calendar-datetime-widget:focus,
                .vTimeField.calendar-time-widget:focus {
                    outline: none;
                    border-color: var(--primary, #417690);
                    box-shadow: 0 0 0 2px rgba(65, 118, 144, 0.2);
                }

                /* Responsive calendar widgets */
                @media (max-width: 768px) {
                    .calendar-date-widget,
                    .calendar-datetime-widget,
                    .calendar-time-widget {
                        font-size: 16px; /* Prevents zoom on iOS */
                    }
                }

                .caution-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .caution-text {
                    color: white;
                    font-size: 14px;
                    line-height: 1.4;
                    font-weight: 500;
                }

                .action-confirm-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 0 20px 20px 20px;
                }

                .action-confirm-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .action-confirm-btn-cancel {
                    background-color: var(--secondary);
                    color: white;
                    border: 1px solid var(--hairline-color);
                }

                .action-confirm-btn-cancel:hover {
                    background-color: var(--link-hover-color);
                }

                .action-confirm-btn-ok {
                    background-color: var(--primary, #417690);
                    color: white;
                }

                .action-confirm-btn-ok:hover {
                    background-color: var(--accent, #205067);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                /* Dark theme adjustments */
                [data-theme="dark"] .action-confirm-dialog {
                    background-color: var(--body-bg);
                    border: 1px solid var(--hairline-color);
                }


                </style>
            `;

            // Add styles and menu to the page
            $('head').append(styles);
            $('body').append(menuHTML);

            // Create trigger button
            const triggerButton = `
                <button id="model-actions-trigger" class="model-actions-trigger">
                    <i class="fas fa-cog"></i> Действия
                </button>
            `;
            $('body').append(triggerButton);
        }

        bindEvents() {
            const self = this;
            let isDragging = false;
            let dragStartY = 0;
            let buttonStartY = 0;

            // Trigger button click (only if not dragging)
            $(document).on('click', '#model-actions-trigger', function(e) {
                if (!isDragging) {
                    self.openMenu();
                }
            });

            // Close button click
            $(document).on('click', '#close-actions-menu', function() {
                self.closeMenu();
            });

            // Overlay click to close
            $(document).on('click', '#model-actions-overlay', function(e) {
                if (e.target === this) {
                    self.closeMenu();
                }
            });

            // Action item click
            $(document).on('click', '.action-item', function() {
                const actionId = $(this).data('action-id');
                const requiresConfirm = $(this).data('requires-confirm');
                const caution = $(this).data('caution');
                const helpText = $(this).data('help-text');
                const formHtml = $(this).data('form');

                if (requiresConfirm) {
                    self.showConfirmationModal(actionId, caution, helpText, formHtml);
                } else {
                    self.executeAction(actionId);
                }
            });

            // ESC key to close
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    if ($('#action-confirm-modal').hasClass('active')) {
                        self.hideConfirmationModal();
                    } else if (self.isOpen) {
                        self.closeMenu();
                    }
                }
            });

            // Confirmation modal event handlers
            $(document).on('click', '#action-confirm-close, #action-confirm-cancel', function() {
                self.hideConfirmationModal();
            });

            $(document).on('click', '#action-confirm-ok', function() {
                const actionId = $('#action-confirm-modal').data('action-id');

                // Collect form data before hiding the modal
                let formData = {};
                const formSection = $('#action-confirm-form');
                if (formSection.is(':visible')) {
                    formSection.find('input, select, textarea').each(function() {
                        const field = $(this);
                        const name = field.attr('name');
                        if (name) {
                            if (field.attr('type') === 'checkbox') {
                                formData[name] = field.is(':checked');
                            } else if (field.attr('type') === 'radio') {
                                if (field.is(':checked')) {
                                    formData[name] = field.val();
                                }
                            } else {
                                formData[name] = field.val();
                            }
                        }
                    });
                }

                self.hideConfirmationModal();
                self.executeAction(actionId, formData);
            });

            $(document).on('click', '.action-confirm-overlay', function() {
                self.hideConfirmationModal();
            });

            // Drag functionality
            $(document).on('mousedown', '#model-actions-trigger', function(e) {
                e.preventDefault();
                isDragging = false;
                dragStartY = e.clientY;
                const button = $(this);
                const buttonRect = button[0].getBoundingClientRect();
                buttonStartY = buttonRect.top + buttonRect.height / 2;

                button.addClass('dragging');

                $(document).on('mousemove.drag', function(e) {
                    if (!isDragging && Math.abs(e.clientY - dragStartY) > 5) {
                        isDragging = true;
                    }

                    if (isDragging) {
                        const deltaY = e.clientY - dragStartY;
                        const newY = buttonStartY + deltaY;
                        const windowHeight = $(window).height();
                        const buttonHeight = button.outerHeight();

                        // Constrain to screen bounds
                        const minY = buttonHeight / 2;
                        const maxY = windowHeight - buttonHeight / 2;
                        const constrainedY = Math.max(minY, Math.min(maxY, newY));

                        button.css({
                            'top': constrainedY + 'px',
                            'transform': 'translateY(-50%)'
                        });
                    }
                });

                $(document).on('mouseup.drag', function() {
                    $(document).off('mousemove.drag mouseup.drag');
                    button.removeClass('dragging');

                    if (isDragging) {
                        // Save position to localStorage
                        self.saveButtonPosition();
                        // Prevent click event after drag
                        setTimeout(() => { isDragging = false; }, 100);
                    } else {
                        isDragging = false;
                    }
                });
            });

            // Touch events for mobile
            $(document).on('touchstart', '#model-actions-trigger', function(e) {
                e.preventDefault();
                const touch = e.originalEvent.touches[0];
                isDragging = false;
                dragStartY = touch.clientY;
                const button = $(this);
                const buttonRect = button[0].getBoundingClientRect();
                buttonStartY = buttonRect.top + buttonRect.height / 2;

                button.addClass('dragging');

                $(document).on('touchmove.drag', function(e) {
                    e.preventDefault();
                    const touch = e.originalEvent.touches[0];

                    if (!isDragging && Math.abs(touch.clientY - dragStartY) > 5) {
                        isDragging = true;
                    }

                    if (isDragging) {
                        const deltaY = touch.clientY - dragStartY;
                        const newY = buttonStartY + deltaY;
                        const windowHeight = $(window).height();
                        const buttonHeight = button.outerHeight();

                        // Constrain to screen bounds
                        const minY = buttonHeight / 2;
                        const maxY = windowHeight - buttonHeight / 2;
                        const constrainedY = Math.max(minY, Math.min(maxY, newY));

                        button.css({
                            'top': constrainedY + 'px',
                            'transform': 'translateY(-50%)'
                        });
                    }
                });

                $(document).on('touchend.drag', function() {
                    $(document).off('touchmove.drag touchend.drag');
                    button.removeClass('dragging');

                    if (isDragging) {
                        // Save position to localStorage
                        self.saveButtonPosition();
                        // Prevent click event after drag
                        setTimeout(() => { isDragging = false; }, 100);
                    } else {
                        isDragging = false;
                    }
                });
            });

            // Window resize handler to keep button within bounds
            $(window).on('resize', function() {
                self.constrainButtonPosition();
            });

            // Category drag functionality
            let categoryDragData = {
                isDragging: false,
                draggedElement: null,
                draggedCategory: null,
                startY: 0,
                placeholder: null
            };

            // Category drag start
            $(document).on('mousedown', '.action-category-header', function(e) {
                e.preventDefault();
                categoryDragData.isDragging = false;
                categoryDragData.draggedElement = $(this);
                categoryDragData.draggedCategory = $(this).text().trim();
                categoryDragData.startY = e.clientY;

                $(this).addClass('dragging');

                $(document).on('mousemove.categoryDrag', function(e) {
                    if (!categoryDragData.isDragging && Math.abs(e.clientY - categoryDragData.startY) > 5) {
                        categoryDragData.isDragging = true;
                        self.startCategoryDrag(categoryDragData.draggedElement);
                    }

                    if (categoryDragData.isDragging) {
                        self.handleCategoryDrag(e);
                    }
                });

                $(document).on('mouseup.categoryDrag', function() {
                    $(document).off('mousemove.categoryDrag mouseup.categoryDrag');

                    if (categoryDragData.isDragging) {
                        self.endCategoryDrag();
                    }

                    categoryDragData.draggedElement.removeClass('dragging');
                    categoryDragData = {
                        isDragging: false,
                        draggedElement: null,
                        draggedCategory: null,
                        startY: 0,
                        placeholder: null
                    };
                });
            });

            // Touch events for category dragging on mobile
            $(document).on('touchstart', '.action-category-header', function(e) {
                e.preventDefault();
                const touch = e.originalEvent.touches[0];
                categoryDragData.isDragging = false;
                categoryDragData.draggedElement = $(this);
                categoryDragData.draggedCategory = $(this).text().trim();
                categoryDragData.startY = touch.clientY;

                $(this).addClass('dragging');

                $(document).on('touchmove.categoryDrag', function(e) {
                    e.preventDefault();
                    const touch = e.originalEvent.touches[0];

                    if (!categoryDragData.isDragging && Math.abs(touch.clientY - categoryDragData.startY) > 5) {
                        categoryDragData.isDragging = true;
                        self.startCategoryDrag(categoryDragData.draggedElement);
                    }

                    if (categoryDragData.isDragging) {
                        self.handleCategoryDrag({clientY: touch.clientY});
                    }
                });

                $(document).on('touchend.categoryDrag', function() {
                    $(document).off('touchmove.categoryDrag touchend.categoryDrag');

                    if (categoryDragData.isDragging) {
                        self.endCategoryDrag();
                    }

                    categoryDragData.draggedElement.removeClass('dragging');
                    categoryDragData = {
                        isDragging: false,
                        draggedElement: null,
                        draggedCategory: null,
                        startY: 0,
                        placeholder: null
                    };
                });
            });
        }

        constrainButtonPosition() {
            const button = $('#model-actions-trigger');
            if (button.length && button.hasClass('visible')) {
                const windowHeight = $(window).height();
                const buttonHeight = button.outerHeight();
                const currentTop = parseFloat(button.css('top'));

                if (!isNaN(currentTop)) {
                    const minY = buttonHeight / 2;
                    const maxY = windowHeight - buttonHeight / 2;
                    const constrainedY = Math.max(minY, Math.min(maxY, currentTop));

                    if (constrainedY !== currentTop) {
                        button.css({
                            'top': constrainedY + 'px',
                            'transform': 'translateY(-50%)'
                        });
                        // Save the new constrained position
                        this.saveButtonPosition();
                    }
                }
            }
        }

        detectCurrentPage() {
            // Use Django template variables instead of URL parsing
            console.log('ModelActionsMenu: Checking Django current object:', $djangoCurrentObject);

            // Check if we have both model_name and object_id from Django template
            if ($djangoCurrentObject && $djangoCurrentObject.model_name && $djangoCurrentObject.object_id) {
                this.currentModel = $djangoCurrentObject.model_name;
                this.currentObjectId = $djangoCurrentObject.object_id;

                console.log('ModelActionsMenu: Detected admin change page from Django context:', {
                    model: this.currentModel,
                    objectId: this.currentObjectId
                });

                // Show trigger button
                $('#model-actions-trigger').addClass('visible');

                // Load saved position
                this.loadButtonPosition();

                console.log('ModelActionsMenu: Button should be visible now');
            } else {
                console.log('ModelActionsMenu: No Django current object or missing required fields, hiding button');
                // Hide trigger button
                $('#model-actions-trigger').removeClass('visible');
            }
        }

        saveButtonPosition() {
            const button = $('#model-actions-trigger');
            if (button.length) {
                const position = {
                    top: button.css('top'),
                    timestamp: Date.now()
                };

                try {
                    localStorage.setItem('modelActionsButtonPosition', JSON.stringify(position));
                    console.log('ModelActionsMenu: Button position saved:', position);
                } catch (e) {
                    console.warn('ModelActionsMenu: Failed to save button position to localStorage:', e);
                }
            }
        }

        loadButtonPosition() {
            try {
                const savedPosition = localStorage.getItem('modelActionsButtonPosition');
                if (savedPosition) {
                    const position = JSON.parse(savedPosition);
                    const button = $('#model-actions-trigger');

                    if (button.length && position.top) {
                        // Validate the position is still within screen bounds
                        const windowHeight = $(window).height();
                        const buttonHeight = button.outerHeight();
                        const topValue = parseFloat(position.top);

                        if (!isNaN(topValue)) {
                            const minY = buttonHeight / 2;
                            const maxY = windowHeight - buttonHeight / 2;
                            const constrainedY = Math.max(minY, Math.min(maxY, topValue));

                            button.css({
                                'top': constrainedY + 'px',
                                'transform': 'translateY(-50%)'
                            });

                            console.log('ModelActionsMenu: Button position restored:', constrainedY + 'px');
                        }
                    }
                }
            } catch (e) {
                console.warn('ModelActionsMenu: Failed to load button position from localStorage:', e);
            }
        }

        startCategoryDrag(draggedElement) {
            // Create a placeholder element
            const placeholder = $('<div class="action-category-header" style="opacity: 0.3; border: 2px dashed var(--primary);">Перетащите сюда</div>');
            draggedElement.after(placeholder);

            // Store reference to placeholder
            this.categoryDragPlaceholder = placeholder;

            console.log('ModelActionsMenu: Started dragging category:', draggedElement.text().trim());
        }

        handleCategoryDrag(e) {
            const mouseY = e.clientY;
            const menuContent = $('#actions-list');
            const menuRect = menuContent[0].getBoundingClientRect();

            // Find the category header that should be the drop target
            let targetElement = null;
            let insertBefore = true;

            $('.action-category-header').not('.dragging').each(function() {
                const rect = this.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;

                if (mouseY < centerY && mouseY > rect.top - 10) {
                    targetElement = $(this);
                    insertBefore = true;
                    return false; // break
                } else if (mouseY > centerY && mouseY < rect.bottom + 10) {
                    targetElement = $(this);
                    insertBefore = false;
                    return false; // break
                }
            });

            // Remove existing drag-over classes
            $('.action-category-header').removeClass('drag-over');

            // Add drag-over class to target
            if (targetElement) {
                targetElement.addClass('drag-over');

                // Move placeholder
                if (this.categoryDragPlaceholder) {
                    if (insertBefore) {
                        targetElement.before(this.categoryDragPlaceholder);
                    } else {
                        targetElement.after(this.categoryDragPlaceholder);
                    }
                }
            }
        }

        endCategoryDrag() {
            const draggedElement = $('.action-category-header.dragging');
            const placeholder = this.categoryDragPlaceholder;

            if (draggedElement.length && placeholder && placeholder.length) {
                // Get the new order by finding where the placeholder is
                const newOrder = [];
                let draggedCategory = draggedElement.data('category') || draggedElement.text().trim();

                // Find all category headers and their order, including the placeholder position
                $('#actions-list .action-category-header').each(function() {
                    if (this === placeholder[0]) {
                        // This is where we should insert the dragged category
                        newOrder.push(draggedCategory);
                    } else if (!$(this).hasClass('dragging')) {
                        // This is a regular category header
                        const category = $(this).data('category') || $(this).text().trim();
                        newOrder.push(category);
                    }
                });

                // If placeholder wasn't found in the loop, add dragged category at the end
                if (!newOrder.includes(draggedCategory)) {
                    newOrder.push(draggedCategory);
                }

                // Save the new order
                this.saveCategoryOrder(newOrder);

                // Re-render actions with new order
                this.renderActions();

                console.log('ModelActionsMenu: Category order updated:', newOrder);
            }

            // Clean up
            $('.action-category-header').removeClass('drag-over');
            if (this.categoryDragPlaceholder) {
                this.categoryDragPlaceholder.remove();
                this.categoryDragPlaceholder = null;
            }
        }

        saveCategoryOrder(categoryOrder) {
            try {
                const orderData = {
                    order: categoryOrder,
                    timestamp: Date.now()
                };
                localStorage.setItem('modelActionsCategoryOrder', JSON.stringify(orderData));
                console.log('ModelActionsMenu: Category order saved:', categoryOrder);
            } catch (e) {
                console.warn('ModelActionsMenu: Failed to save category order to localStorage:', e);
            }
        }

        loadCategoryOrder() {
            try {
                const savedOrder = localStorage.getItem('modelActionsCategoryOrder');
                if (savedOrder) {
                    const orderData = JSON.parse(savedOrder);
                    return orderData.order || [];
                }
            } catch (e) {
                console.warn('ModelActionsMenu: Failed to load category order from localStorage:', e);
            }
            return [];
        }

        openMenu() {
            if (this.isOpen) return;

            this.isOpen = true;
            $('#model-actions-overlay').addClass('active');

            // Load actions
            this.loadActions();
        }

        closeMenu() {
            if (!this.isOpen) return;

            this.isOpen = false;
            $('#model-actions-overlay').removeClass('active');
        }

        loadActions() {
            if (!this.currentModel) {
                this.showNoActions();
                return;
            }

            // Show loading
            $('#actions-loading').show();
            $('#actions-list').hide();

            // Build URL
            const url = $djangoURLs.getModelActions.replace('MODEL_NAME', this.currentModel);

            // Make AJAX request
            $.ajax({
                url: url,
                method: 'GET',
                success: (data) => {
                    this.actions = data.results || [];
                    this.renderActions();
                },
                error: (xhr, status, error) => {
                    console.error('Error loading actions:', error);
                    this.showError('Ошибка загрузки действий');
                }
            });
        }

        renderActions() {
            $('#actions-loading').hide();

            if (this.actions.length === 0) {
                this.showNoActions();
                return;
            }

            // Group actions by category
            const groupedActions = {};
            this.actions.forEach(action => {
                const category = action.category || 'Общие';
                if (!groupedActions[category]) {
                    groupedActions[category] = [];
                }
                groupedActions[category].push(action);
            });

            let html = '';

            // Get saved category order from localStorage
            const savedOrder = this.loadCategoryOrder();
            let sortedCategories;

            if (savedOrder.length > 0) {
                // Use saved order, but include any new categories that weren't saved
                const availableCategories = Object.keys(groupedActions);
                sortedCategories = [];

                // First, add categories in saved order
                savedOrder.forEach(category => {
                    if (availableCategories.includes(category)) {
                        sortedCategories.push(category);
                    }
                });

                // Then add any new categories that weren't in saved order
                availableCategories.forEach(category => {
                    if (!sortedCategories.includes(category)) {
                        sortedCategories.push(category);
                    }
                });

                console.log('ModelActionsMenu: Using saved category order:', sortedCategories);
            } else {
                // Use default sorting: alphabetically, but put 'Общие' first
                sortedCategories = Object.keys(groupedActions).sort((a, b) => {
                    if (a === 'Общие') return -1;
                    if (b === 'Общие') return 1;
                    return a.localeCompare(b);
                });

                console.log('ModelActionsMenu: Using default category order:', sortedCategories);
            }

            sortedCategories.forEach(category => {
                // Add category header with section wrapper
                html += `<div class="action-category-section">`;
                html += `<div class="action-category-header" data-category="${category}">${category}</div>`;

                // Add actions in this category
                groupedActions[category].forEach(action => {
                    const confirmClass = action.required_confirm ? 'confirm-required' : '';
                    const pageClass = action.type === 'page' ? 'is-page' : '';

                    const formHtml = action.form ? action.form.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';

                    html += `
                        <div class="action-item ${confirmClass} ${pageClass}" 
                             data-action-id="${action.id}" 
                             data-requires-confirm="${action.required_confirm}"
                             data-caution="${(action.caution || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}"
                             data-help-text="${(action.help_text || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}"
                             data-form="${formHtml}"
                             >

                            <div class="action-title">${action.title}</div>
                            <div class="action-description">${action.description || ''}</div>
                        </div>
                    `;
                });

                html += `</div>`; // Close action-category-section
            });

            $('#actions-list').html(html).show();
        }

        showNoActions() {
            $('#actions-loading').hide();
            $('#actions-list').html('<div class="no-actions">Нет доступных действий</div>').show();
        }

        showError(message) {
            $('#actions-loading').hide();
            $('#actions-list').html(`<div class="no-actions">${message}</div>`).show();
        }

        executeAction(actionId, formData = {}) {
            if (!this.currentModel || !this.currentObjectId) {
                console.error('Missing model or object ID');
                return;
            }

            // Build URL
            let url = $djangoURLs.executeModelAction
                .replace('MODEL_NAME', this.currentModel)
                .replace('OBJECT_ID', this.currentObjectId)
                .replace('ACTION_ID', actionId);

            // Use provided formData or collect from modal if not provided (for backward compatibility)
            if (!formData || Object.keys(formData).length === 0) {
                const formSection = $('#action-confirm-form');
                if (formSection.is(':visible')) {
                    formSection.find('input, select, textarea').each(function() {
                        const field = $(this);
                        const name = field.attr('name');
                        if (name) {
                            if (field.attr('type') === 'checkbox') {
                                formData[name] = field.is(':checked');
                            } else if (field.attr('type') === 'radio') {
                                if (field.is(':checked')) {
                                    formData[name] = field.val();
                                }
                            } else {
                                formData[name] = field.val();
                            }
                        }
                    });
                }
            }

            // Show loading state
            const actionElement = $(`.action-item[data-action-id="${actionId}"]`);
            const originalText = actionElement.find('.action-title').text();
            actionElement.find('.action-title').text('Выполняется...');
            actionElement.css('opacity', '0.6');

            // Prepare request data
            const requestData = {
                'csrfmiddlewaretoken': $('[name=csrfmiddlewaretoken]').val()
            };

            // Add form data if present
            if (Object.keys(formData).length > 0) {
                requestData['form_data'] = JSON.stringify(formData);
            }

            // Make AJAX request
            $.ajax({
                url: url,
                method: 'POST',
                data: requestData,
                headers: {
                    'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val()
                },
                success: (data) => {
                    if (data.status && !data.redirect_url) {
                        // Show success notification
                        if (typeof Toastify !== 'undefined') {
                            const message = data.message || "Действие выполнено успешно";
                            Toastify({
                                text: message,
                                duration: 3000,
                                gravity: "bottom",
                                position: "right",
                                style: {
                                    background: "var(--success)",
                                }
                            }).showToast();
                        }

                        // Check if file_pk is present and trigger download
                        if (data.file_pk) {
                            this.downloadFile(data.file_pk);
                        }

                        // Close menu
                        this.closeMenu();
                    } else if (data.status && data.redirect_url) {
                        window.location.href = data.redirect_url;
                    } else {
                        const errorMessage = data.message || 'Ошибка выполнения действия';
                        this.showActionError(actionElement, originalText, errorMessage);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('Error executing action:', error);
                    let errorMessage = 'Ошибка выполнения действия';

                    // Try to get message from response if available
                    try {
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        }
                    } catch (e) {
                        // Use default message if parsing fails
                    }

                    this.showActionError(actionElement, originalText, errorMessage);
                }
            });
        }

        showActionError(actionElement, originalText, message) {
            actionElement.find('.action-title').text(originalText);
            actionElement.css('opacity', '1');

            if (typeof Toastify !== 'undefined') {
                Toastify({
                    text: message,
                    duration: 5000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "var(--error-fg)",
                }).showToast();
            }
        }

        showConfirmationModal(actionId, caution, helpText, formHtml) {
            const modal = $('#action-confirm-modal');

            // Store action ID for later use
            modal.data('action-id', actionId);

            // Set default confirmation text
            $('#action-confirm-text').text('Вы уверены, что хотите выполнить это действие?');

            // Show or hide caution section
            const cautionSection = $('#action-confirm-caution');
            if (caution && caution.trim()) {
                cautionSection.find('.caution-text').text(caution);
                cautionSection.show();
            } else {
                cautionSection.hide();
            }

            const infoSection = $('#action-confirm-info');
            if (helpText && helpText.trim()) {
                infoSection.find('.caution-text').text(helpText);
                infoSection.show();
            } else {
                infoSection.hide();
            }

            // Show or hide form section
            const formSection = $('#action-confirm-form');
            if (formHtml && formHtml.trim()) {
                // Decode HTML entities
                const decodedFormHtml = formHtml.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                formSection.find('.form-content').html(decodedFormHtml);
                formSection.show();
            } else {
                formSection.hide();
            }

            // Show modal
            modal.addClass('active');

            // Focus on first form field if available, otherwise OK button
            setTimeout(() => {
                const firstInput = formSection.find('input, select, textarea').first();
                if (firstInput.length > 0) {
                    firstInput.focus();
                } else {
                    $('#action-confirm-ok').focus();
                }
            }, 100);
        }

        hideConfirmationModal() {
            const modal = $('#action-confirm-modal');
            modal.removeClass('active');
            modal.removeData('action-id');
        }

        downloadFile(filePk) {
            // Build download URL using the file_pk
            const downloadUrl = $djangoURLs.downloadTmpFile.replace('FILE_ID', filePk);

            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = ''; // Let the server determine the filename
            link.style.display = 'none';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('ModelActionsMenu: File download triggered for file_pk:', filePk);
        }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        console.log('ModelActionsMenu: Initializing...');

        // Check if required dependencies are available
        if (typeof $ === 'undefined') {
            console.error('ModelActionsMenu: jQuery is not available');
            return;
        }

        if (typeof $djangoURLs === 'undefined') {
            console.error('ModelActionsMenu: $djangoURLs is not defined');
            return;
        }

        console.log('ModelActionsMenu: Dependencies OK, creating instance');
        const menu = new ModelActionsMenu();

        // Store reference globally for debugging
        window.modelActionsMenu = menu;

        // Add debug helper
        window.debugModelActions = function() {
            console.log('=== Model Actions Debug Info ===');
            console.log('Current path:', window.location.pathname);
            console.log('Current model:', menu.currentModel);
            console.log('Current object ID:', menu.currentObjectId);
            console.log('Button element:', $('#model-actions-trigger')[0]);
            console.log('Button visible class:', $('#model-actions-trigger').hasClass('visible'));
            console.log('Menu open:', menu.isOpen);

            // Force show button for testing
            $('#model-actions-trigger').addClass('debug-visible');
            console.log('Button forced visible for testing');
        };

        console.log('ModelActionsMenu: Initialization complete. Use debugModelActions() for debugging.');
    });

})(typeof django !== 'undefined' && django.jQuery ? django.jQuery : (typeof jQuery !== 'undefined' ? jQuery : $));

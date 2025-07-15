// Global Search - Spotlight-like search for Django Admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired - version with debug logs');
    // Create the search modal elements
    const searchModal = document.createElement('div');
    searchModal.id = 'global-search-modal';
    searchModal.className = 'global-search-modal';
    searchModal.style.display = 'none';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'global-search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'global-search-input';
    searchInput.className = 'global-search-input';
    searchInput.placeholder = 'Поиск...';

    // Create Tab hint element
    const tabHint = document.createElement('div');
    tabHint.className = 'tab-hint';
    tabHint.innerHTML = '<kbd>Tab</kbd> для выбора модели';

    // Create Shift hint element
    const ctrlHint = document.createElement('div');
    ctrlHint.className = 'ctrl-hint';
    ctrlHint.innerHTML = '<kbd><i class="fa-solid fa-computer-mouse"></i> Правый клик</kbd> для открытия в новой вкладке';

    const searchResults = document.createElement('div');
    searchResults.id = 'global-search-results';
    searchResults.className = 'global-search-results';

    // Assemble the modal
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    inputContainer.appendChild(searchInput);
    inputContainer.appendChild(tabHint);
    inputContainer.appendChild(ctrlHint);

    searchContainer.appendChild(inputContainer);
    searchContainer.appendChild(searchResults);
    searchModal.appendChild(searchContainer);
    document.body.appendChild(searchModal);

    // Add CSS styles for the search modal
    const style = document.createElement('style');
    style.textContent = `
        .global-search-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: flex-start;
            z-index: 9999;
            padding-top: 80px;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        }

        .global-search-modal.visible {
            opacity: 1;
        }

        @keyframes containerAppear {
            0% {
                transform: translateY(-30px);
                opacity: 0;
            }
            70% {
                transform: translateY(5px);
                opacity: 1;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .global-search-container {
            width: 650px;
            max-width: 90%;
            background-color: var(--body-bg);
            border-radius: 12px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }

        .global-search-modal.visible .global-search-container {
            animation: containerAppear 0.4s ease-out forwards;
        }

        .input-container {
            position: relative;
            width: 100%;
        }

        .global-search-input {
            width: 100%;
            padding: 16px 20px !important;
            border: none !important;
            outline: none;
            font-size: 16px;
            background-color: var(--body-bg);
            color: var(--body-fg);
            border-bottom: 2px solid var(--border-color);
            transition: all 0.3s ease;
            border-radius: 8px 8px 0 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) inset;
        }

        .global-search-input:focus {
            border-bottom: 2px solid var(--primary);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) inset;
            background-color: var(--primary-light, rgba(0, 0, 0, 0.02));
        }

        .tab-hint {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: var(--body-quiet-color);
            opacity: 0.8;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .tab-hint kbd {
            display: inline-block;
            padding: 2px 5px;
            background-color: var(--body-quiet-color);
            color: var(--body-bg);
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-right: 4px;
            font-family: monospace;
            font-weight: bold;
        }

        .tab-hint.hidden {
            opacity: 0;
        }

        .ctrl-hint {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(10px);
            font-size: 12px;
            color: var(--body-quiet-color);
            opacity: 0.8;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .ctrl-hint kbd {
            display: inline-block;
            padding: 2px 5px;
            background-color: var(--body-quiet-color);
            color: var(--body-bg);
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-right: 4px;
            font-family: monospace;
            font-weight: bold;
        }

        .ctrl-hint.hidden {
            opacity: 0;
        }

        /* Selected model indicator */
        @keyframes indicatorAppear {
            from {
                transform: translateY(-10px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .selected-model-indicator {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background-color: var(--primary);
            color: white;
            border-radius: 8px 8px 0 0;
            font-size: 14px;
            font-weight: 500;
            animation: indicatorAppear 0.3s ease-out forwards;
        }

        .selected-model-indicator .model-icon {
            margin-right: 10px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }

        .selected-model-indicator .model-name {
            flex: 1;
        }

        .selected-model-indicator .model-clear {
            cursor: pointer;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            transition: all 0.2s ease;
        }

        .selected-model-indicator .model-clear:hover {
            background-color: rgba(255, 255, 255, 0.4);
        }

        .global-search-results {
            max-height: 450px;
            overflow-y: auto;
            scrollbar-width: thin;
            scroll-behavior: smooth;
        }

        .global-search-results::-webkit-scrollbar {
            width: 6px;
        }

        .global-search-results::-webkit-scrollbar-thumb {
            background-color: var(--border-color);
            border-radius: 3px;
        }

        .search-result-item {
            padding: 12px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.3s ease, border-left-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            border-left: 3px solid transparent;
            animation: fadeInUp 0.3s ease forwards;
            animation-delay: calc(var(--animation-order, 0) * 0.05s);
            opacity: 0;
        }

        .search-result-item:hover {
            background-color: var(--primary-light);
            border-left-color: var(--primary);
        }

        .search-result-item.selected {
            background-color: var(--primary-light);
            border-left-color: var(--primary);
            transform: translateX(2px) scale(1.01);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .search-result-icon {
            margin-right: 15px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-light);
            border-radius: 6px;
            color: var(--primary);
        }

        .search-result-content {
            flex: 1;
        }

        .search-result-badge {
            margin-right: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .search-result-color-badge {
            margin-right: 0px;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-light);
            border-radius: 15px;
            color: var(--primary);
        }

        .search-result-title {
            font-weight: bold;
            margin-bottom: 3px;
        }

        .search-result-description {
            font-size: 12px;
            color: var(--body-quiet-color);
        }

        .search-result-model-header {
            padding: 8px 20px;
            font-weight: bold;
            background-color: var(--body-bg);
            color: var(--body-quiet-color);
            border-bottom: 1px solid var(--border-color);
            font-size: 14px;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        /* Loading animation */
        .search-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: var(--body-quiet-color);
        }

        .search-loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-left-color: var(--primary);
            border-radius: 50%;
            animation: search-spinner 1s linear infinite;
        }

        @keyframes search-spinner {
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

    `;
    document.head.appendChild(style);

    const searchUrl = $searchURLs.searchUrl;
    const getModelsUrl = $searchURLs.getModelsUrl;
    console.debug('Search URL:', searchUrl);

    // Toggle search modal with keyboard shortcut (Cmd+K or Ctrl+K)
    document.addEventListener('keydown', function(e) {
        console.log('Document keydown event:', e.key, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey, 'keyCode:', e.keyCode);
        // Check for Ctrl+K in any keyboard layout (keyCode 75 is 'K')
        if ((e.metaKey || e.ctrlKey) && (e.keyCode === 75 || e.key === 'k' || e.key === 'к')) {
            console.log('Ctrl+K or Cmd+K pressed');
            e.preventDefault();
            toggleSearchModal();
        }

        // Close with Escape key
        if ((e.key === 'Escape' || e.keyCode === 27) && searchModal.style.display === 'flex') {
            console.log('Escape key pressed while modal is open');
            closeSearchModal();
        }
    });

    // Handle clicks outside the search container to close the modal
    searchModal.addEventListener('click', function(e) {
        console.log('Search modal clicked, e.target:', e.target, 'searchModal:', searchModal);
        if (e.target === searchModal) {
            console.log('Background clicked, closing modal');
            closeSearchModal();
        }
    });

    // Search input handler
    let selectedIndex = -1;
    let searchResultItems = [];
    let modelsLoaded = false;
    let selectedModel = null;

    // Functions to save/load selected model from localStorage
    function saveSelectedModel(model) {
        try {
            if (model) {
                localStorage.setItem('globalSearchSelectedModel', JSON.stringify(model));
                console.log('Selected model saved to localStorage:', model);
            } else {
                localStorage.removeItem('globalSearchSelectedModel');
                console.log('Selected model removed from localStorage');
            }
        } catch (error) {
            console.error('Error saving selected model to localStorage:', error);
        }
    }

    function loadSelectedModel() {
        try {
            const savedModel = localStorage.getItem('globalSearchSelectedModel');
            if (savedModel) {
                const model = JSON.parse(savedModel);
                console.log('Selected model loaded from localStorage:', model);
                return model;
            }
        } catch (error) {
            console.error('Error loading selected model from localStorage:', error);
        }
        return null;
    }

    // Load saved model on initialization
    selectedModel = loadSelectedModel();

    searchInput.addEventListener('input', function() {
        // Hide or show the Tab hint based on whether the input has a value
        if (this.value.trim()) {
            tabHint.classList.add('hidden');
        } else {
            tabHint.classList.remove('hidden');
            // Hide Shift hint when no input
            ctrlHint.classList.add('hidden');
        }

        performSearch(this.value);
    });

    // Keyboard navigation in search results
    searchInput.addEventListener('keydown', function(e) {
        console.log('Keydown event:', e.key);
        if (e.key === 'Tab' && !e.shiftKey) {
            console.log('Tab key pressed, input value:', this.value.trim());
            // If Tab key is pressed and the search input is empty, show available models
            if (!this.value.trim()) {
                e.preventDefault();
                console.log('Calling showAvailableModels()');
                showAvailableModels();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateResults(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateResults(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectResult(e);
        } else if (e.key === 'Escape') {
            console.log('Escape key pressed, selectedModel:', selectedModel);
            // If Escape is pressed and a model is selected, clear the model selection
            if (selectedModel) {
                selectedModel = null;
                saveSelectedModel(null);
                updateSelectedModelIndicator();
                console.log('Selected model cleared by Escape key');

                // Show the Tab hint again since no model is selected
                if (!this.value.trim()) {
                    tabHint.classList.remove('hidden');
                    // Hide Shift hint when no input
                    ctrlHint.classList.add('hidden');
                }

                e.preventDefault();
                e.stopPropagation();
            }
        }
    });

    // Functions
    function showAvailableModels() {
        console.log('showAvailableModels called, modelsLoaded:', modelsLoaded, 'searchResultItems.length:', searchResultItems.length);
        // Hide Shift hint when showing models
        ctrlHint.classList.add('hidden');
        if (modelsLoaded && searchResultItems.length > 0) {
            // If models are already loaded, just make sure they're visible and navigate to the first item
            selectedIndex = 0;
            searchResultItems.forEach(item => item.classList.remove('selected'));
            searchResultItems[selectedIndex].classList.add('selected');
            searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            console.log('Models already loaded, navigating to first item');
            return;
        }

        // Show loading indicator
        searchResults.innerHTML = '<div class="search-loading"><div class="search-loading-spinner"></div>Загрузка моделей...</div>';

        // Get the URL for the get-search-models endpoint
        console.log('Fetching models from URL:', getModelsUrl);

        // Fetch available models
        fetch(getModelsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Models received:', data);
                const models = data.results || [];

                // Display models
                searchResults.innerHTML = '';
                if (models.length === 0) {
                    searchResults.innerHTML = '<div class="search-result-item">Нет доступных моделей</div>';
                    searchResultItems = document.querySelectorAll('.search-result-item');
                    if (searchResultItems.length > 0) {
                        selectedIndex = 0;
                        searchResultItems[selectedIndex].classList.add('selected');
                        searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                    return;
                }

                // Add header
                const modelHeader = document.createElement('div');
                modelHeader.className = 'search-result-model-header';
                modelHeader.textContent = 'Доступные модели для поиска';
                searchResults.appendChild(modelHeader);

                // Add models to the results
                let globalIndex = 0;
                models.forEach(model => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.dataset.modelId = model.id;
                    resultItem.dataset.index = globalIndex;
                    resultItem.style.setProperty('--animation-order', globalIndex++);

                    resultItem.innerHTML = `
                        <div class="search-result-icon"><i class="${model.icon}"></i></div>
                        <div class="search-result-content">
                            <div class="search-result-title">${model.name}</div>
                            <div class="search-result-description">${model.description}</div>
                        </div>
                    `;

                    resultItem.addEventListener('click', function() {
                        console.log('Model clicked:', model);
                        // Store the selected model
                        selectedModel = {
                            id: model.id,
                            name: model.name,
                            icon: model.icon,
                            description: model.description,
                        };
                        console.log('Selected model set to:', selectedModel);

                        // Save to localStorage
                        saveSelectedModel(selectedModel);

                        // Set the search input to empty to allow user to type their query
                        searchInput.value = '';
                        searchInput.focus();

                        // Clear the results and reset the models loaded flag
                        searchResults.innerHTML = '';
                        modelsLoaded = false;

                        // Show the selected model indicator
                        updateSelectedModelIndicator();

                        // Hide the Tab hint since a model is selected and user will be typing a query
                        tabHint.classList.add('hidden');
                        // Hide Shift hint when model is selected
                        ctrlHint.classList.add('hidden');
                    });

                    searchResults.appendChild(resultItem);
                });

                searchResultItems = document.querySelectorAll('.search-result-item');
                modelsLoaded = true;

                // Select the first item
                if (searchResultItems.length > 0) {
                    selectedIndex = 0;
                    searchResultItems[selectedIndex].classList.add('selected');
                    searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            })
            .catch(error => {
                console.error('Error fetching models:', error);
                searchResults.innerHTML = '<div class="search-result-item">Ошибка при загрузке моделей</div>';
                searchResultItems = document.querySelectorAll('.search-result-item');
                if (searchResultItems.length > 0) {
                    selectedIndex = 0;
                    searchResultItems[selectedIndex].classList.add('selected');
                    searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            });
    }

    function toggleSearchModal() {
        console.log('toggleSearchModal called, searchModal.style.display:', searchModal.style.display);
        if (searchModal.style.display === 'none' || searchModal.style.display === '') {
            console.log('Opening search modal');
            openSearchModal();
        } else {
            console.log('Closing search modal');
            closeSearchModal();
        }
    }

    function openSearchModal() {
        console.log('openSearchModal called, searchModal:', searchModal);
        searchModal.style.display = 'flex';

        // Trigger reflow to ensure the transition works
        searchModal.offsetWidth;

        // Add visible class to trigger animations
        searchModal.classList.add('visible');

        // Clear previous search
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedIndex = -1;
        modelsLoaded = false;

        // Show selected model indicator if a model is selected
        updateSelectedModelIndicator();

        // Show the Tab hint only if no model is selected and the input is empty
        if (selectedModel) {
            tabHint.classList.add('hidden');
        } else {
            tabHint.classList.remove('hidden');
        }

        // Hide Shift hint initially
        ctrlHint.classList.add('hidden');

        searchInput.focus();
    }

    function closeSearchModal() {
        console.log('closeSearchModal called');
        // Remove visible class to trigger animations
        searchModal.classList.remove('visible');

        // Wait for the animation to complete before hiding
        setTimeout(() => {
            console.log('Hiding search modal after animation');
            searchModal.style.display = 'none';
        }, 200); // Match the transition duration
    }

    function performSearch(query) {
        // Reset selection
        selectedIndex = -1;

        if (!query.trim() || query.length < 3) {
            searchResults.innerHTML = '';
            // Hide Shift hint when no search
            ctrlHint.classList.add('hidden');
            return;
        }

        // Show loading indicator with animation
        searchResults.innerHTML = '<div class="search-loading"><div class="search-loading-spinner"></div>Поиск...</div>';

        // Build the URL with query parameters
        let url = `${searchUrl}?query=${encodeURIComponent(query)}`;

        // Add model parameter if a model is selected
        if (selectedModel) {
            url += `&model=${encodeURIComponent(selectedModel.id)}`;
            console.log('Adding model parameter to URL:', selectedModel.id, 'Final URL:', url);
        } else {
            console.log('No model selected, URL:', url);
        }

        // Make AJAX request to the backend
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Search results received:', data);
                const results = data.results || [];

                // Display results
                searchResults.innerHTML = '';
                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
                    searchResultItems = document.querySelectorAll('.search-result-item');
                    // Hide Shift hint when no results
                    ctrlHint.classList.add('hidden');
                    if (searchResultItems.length > 0) {
                        selectedIndex = 0;
                        searchResultItems[selectedIndex].classList.add('selected');
                        searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                    return;
                }

                // Group results by model
                const groupedResults = {};
                results.forEach(result => {
                    const modelName = result.model_name || 'Прочее';
                    if (!groupedResults[modelName]) {
                        groupedResults[modelName] = [];
                    }
                    groupedResults[modelName].push(result);
                });

                // Display results grouped by model
                console.log('Displaying grouped results:', groupedResults);
                let globalIndex = 0;
                for (const [modelName, modelResults] of Object.entries(groupedResults)) {
                    console.log('Displaying results for model:', modelName, 'count:', modelResults.length);
                    // Add model header
                    const modelHeader = document.createElement('div');
                    modelHeader.className = 'search-result-model-header';
                    modelHeader.textContent = modelName;
                    searchResults.appendChild(modelHeader);

                    // Add results for this model
                    modelResults.forEach(result => {
                        console.log('Adding result item:', result);
                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        resultItem.dataset.url = result.url;
                        resultItem.dataset.index = globalIndex;
                        resultItem.style.setProperty('--animation-order', globalIndex++);

                        const resultHTML = `
                            <div class="search-result-icon"><i class="${result.icon}"></i></div>
                            <div class="search-result-content">
                                <div class="search-result-title">${result.title}</div>
                                <div class="search-result-description">${result.description}</div>
                            </div>
                            <div class="search-result-badge">${result.badge || ''}</div>
                            <div class="search-result-color-badge" style="background-color: ${result.color}"></div>
                        `;
                        console.log('Result item HTML:', resultHTML);
                        resultItem.innerHTML = resultHTML;

                        resultItem.addEventListener('click', function(e) {
                            console.log('Search result clicked, navigating to URL:', this.dataset.url);
                            if (e.ctrlKey) {
                                e.preventDefault()
                                // Open in new tab when Ctrl is pressed
                                window.open(this.dataset.url, '_blank');
                            } else {
                                window.location.href = this.dataset.url;
                            }
                        });

                        // Add right-click context menu event to open in new tab
                        resultItem.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                            console.log('Search result right-clicked, opening in new tab:', this.dataset.url);
                            window.open(this.dataset.url, '_blank');
                        });

                        searchResults.appendChild(resultItem);
                    });
                }

                searchResultItems = document.querySelectorAll('.search-result-item');

                // Select the first item if there are results
                if (searchResultItems.length > 0) {
                    selectedIndex = 0;
                    searchResultItems[selectedIndex].classList.add('selected');
                    searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    // Show Shift hint when there are search results
                    ctrlHint.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                searchResults.innerHTML = '<div class="search-result-item">Ошибка при выполнении поиска</div>';
                searchResultItems = document.querySelectorAll('.search-result-item');
                // Hide Shift hint on error
                ctrlHint.classList.add('hidden');
                if (searchResultItems.length > 0) {
                    selectedIndex = 0;
                    searchResultItems[selectedIndex].classList.add('selected');
                    searchResultItems[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            });
    }

    function navigateResults(direction) {
        console.log('navigateResults called, direction:', direction, 'searchResultItems.length:', searchResultItems.length, 'selectedIndex:', selectedIndex);
        if (searchResultItems.length === 0) {
            console.log('No search result items, returning');
            return;
        }

        // Remove selected class from current item
        if (selectedIndex >= 0 && selectedIndex < searchResultItems.length) {
            console.log('Removing selected class from item at index:', selectedIndex);
            searchResultItems[selectedIndex].classList.remove('selected');
        } else {
            // If selectedIndex is -1 or out of bounds, reset it to -1 + direction
            console.log('selectedIndex is -1 or out of bounds, resetting to -1');
            selectedIndex = -1;
        }

        // Update selected index
        selectedIndex += direction;

        // Handle wrapping
        if (selectedIndex < 0) {
            selectedIndex = searchResultItems.length - 1;
        } else if (selectedIndex >= searchResultItems.length) {
            selectedIndex = 0;
        }

        // Add selected class to new item and scroll into view
        const selectedItem = searchResultItems[selectedIndex];
        selectedItem.classList.add('selected');
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    function selectResult(e) {
        console.log('selectResult called, selectedIndex:', selectedIndex, 'searchResultItems.length:', searchResultItems.length);
        if (selectedIndex >= 0 && selectedIndex < searchResultItems.length) {
            const selectedItem = searchResultItems[selectedIndex];
            console.log('Selected item:', selectedItem, 'modelId:', selectedItem.dataset.modelId, 'url:', selectedItem.dataset.url);

            // Check if this is a model selection item
            if (selectedItem.dataset.modelId) {
                // Store the selected model
                selectedModel = {
                    id: selectedItem.dataset.modelId,
                    name: selectedItem.querySelector('.search-result-title').textContent,
                    icon: selectedItem.querySelector('.search-result-icon i').className
                };
                console.log('Model selected:', selectedModel);

                // Save to localStorage
                saveSelectedModel(selectedModel);

                // Set the search input to empty to allow user to type their query
                searchInput.value = '';
                searchInput.focus();

                // Clear the results and reset the models loaded flag
                searchResults.innerHTML = '';
                modelsLoaded = false;

                // Show the selected model indicator
                updateSelectedModelIndicator();

                // Hide the Tab hint since a model is selected and user will be typing a query
                tabHint.classList.add('hidden');
            } else if (selectedItem.dataset.url) {
                // This is a regular search result, navigate to its URL
                console.log('Navigating to URL:', selectedItem.dataset.url);
                if (e && e.ctrlKey) {
                    e.preventDefault();
                    // Open in new tab when Ctrl is pressed
                    window.open(selectedItem.dataset.url, '_blank');
                } else {
                    window.location.href = selectedItem.dataset.url;
                }
            }
        }
    }

    function updateSelectedModelIndicator() {
        console.log('updateSelectedModelIndicator called, selectedModel:', selectedModel);
        // Remove existing indicator if any
        const existingIndicator = document.getElementById('selected-model-indicator');
        if (existingIndicator) {
            console.log('Removing existing indicator');
            existingIndicator.remove();
        }

        // If no model is selected, return
        if (!selectedModel) {
            console.log('No model selected, returning');
            return;
        }

        // Create the selected model indicator
        const indicator = document.createElement('div');
        indicator.id = 'selected-model-indicator';
        indicator.className = 'selected-model-indicator';
        const indicatorHTML = `
            <div class="model-icon"><i class="${selectedModel.icon}"></i></div>
            <div class="model-name">${selectedModel.name}</div>
            <div class="model-clear" title="Очистить выбор модели"><i class="fa-solid fa-times"></i></div>
        `;
        console.log('Creating indicator with HTML:', indicatorHTML);
        indicator.innerHTML = indicatorHTML;

        // Add click handler to clear button
        indicator.querySelector('.model-clear').addEventListener('click', function(e) {
            console.log('Clear button clicked');
            e.stopPropagation();
            selectedModel = null;
            saveSelectedModel(null);
            console.log('Selected model cleared');
            indicator.remove();

            // Show the Tab hint again since no model is selected
            if (!searchInput.value.trim()) {
                tabHint.classList.remove('hidden');
            }
        });

        // Insert the indicator before the input container
        console.log('Inserting indicator before input container, searchContainer:', searchContainer);
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            searchContainer.insertBefore(indicator, inputContainer);
        } else {
            console.error('Input container not found');
        }
    }

    // Add a small indicator to show the keyboard shortcut
    const shortcutIndicator = document.createElement('div');
    shortcutIndicator.className = 'search-shortcut-indicator';
    shortcutIndicator.innerHTML = '<i class="fa-solid fa-search"></i> <span>Ctrl+K</span>';

    // Add CSS for the shortcut indicator
    const indicatorStyle = document.createElement('style');
    indicatorStyle.textContent = `
        .search-shortcut-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--body-bg);
            color: var(--body-quiet-color);
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            border: 1px solid var(--border-color);
        }

        .search-shortcut-indicator:hover {
            transform: scale(1.05);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            background-color: var(--primary);
            color: white;
        }

        .search-shortcut-indicator i {
            font-size: 14px;
        }

        .search-shortcut-indicator span {
            font-weight: 500;
            display: inline-block;
            padding: 2px 6px;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
        }

        @media (max-width: 768px) {
            .search-shortcut-indicator {
                bottom: 15px;
                right: 15px;
                padding: 6px 10px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(indicatorStyle);

    console.log('Adding click handler to shortcut indicator:', shortcutIndicator);
    shortcutIndicator.addEventListener('click', toggleSearchModal);
    console.log('Appending shortcut indicator to document body');
    document.body.appendChild(shortcutIndicator);
});

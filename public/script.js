// State management
let hasApiKey = false;
let songHistory = [];
let historyOpen = false;
let currentTheme = 'light';
let interfaceMode = 'classic'; // 'classic' or 'wizard'
let currentWizardStep = 1;
let wizardData = {
    styleValue: 50,
    theme: '',
    subgenre: '',
    mood: '',
    vocalStyle: '',
    additionalNotes: ''
};

// Initialize on page load
window.addEventListener('load', async function() {
    await checkApiKeyStatus();
    await loadHistory();
    loadTheme();
    loadInterfaceMode();
    updateSliderFill();
    updateHistoryCount();
    initializeWizard();
});

// Theme management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Interface mode management
function loadInterfaceMode() {
    const savedMode = localStorage.getItem('interfaceMode') || 'classic';
    interfaceMode = savedMode;
    updateInterfaceDisplay();
    updateModeButtons();
}

function setInterfaceMode(mode) {
    interfaceMode = mode;
    localStorage.setItem('interfaceMode', mode);
    updateInterfaceDisplay();
    updateModeButtons();
    closeSettings();
}

function toggleInterfaceMode() {
    const newMode = interfaceMode === 'classic' ? 'wizard' : 'classic';
    setInterfaceMode(newMode);
}

function updateInterfaceDisplay() {
    const classicInterface = document.getElementById('classicInterface');
    const wizardInterface = document.getElementById('wizardInterface');
    const modeToggleText = document.getElementById('modeToggleText');
    
    if (interfaceMode === 'wizard') {
        classicInterface.style.display = 'none';
        wizardInterface.style.display = 'block';
        modeToggleText.textContent = 'Switch to Classic Mode';
    } else {
        classicInterface.style.display = 'block';
        wizardInterface.style.display = 'none';
        modeToggleText.textContent = 'Switch to Wizard Mode';
    }
}

function updateModeButtons() {
    const wizardBtn = document.getElementById('wizardModeBtn');
    const classicBtn = document.getElementById('classicModeBtn');
    
    if (interfaceMode === 'wizard') {
        wizardBtn.classList.add('active');
        classicBtn.classList.remove('active');
    } else {
        classicBtn.classList.add('active');
        wizardBtn.classList.remove('active');
    }
}

// Settings modal management
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('show');
    updateApiKeyStatusInSettings();
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target === modal) {
        closeSettings();
    }
}

// API key management in settings
async function saveApiKeyFromSettings() {
    const apiKey = document.getElementById('settingsApiKey').value;
    
    if (!apiKey) {
        showApiKeyStatus('Please enter your Claude API key', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveSettingsKeyBtn');
    const originalContent = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const response = await fetch('/api/set-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: apiKey })
        });
        
        if (!response.ok) {
            const error = await response.json();
            if (error.instructions) {
                // Special handling for Vercel
                showApiKeyStatus(`${error.error}\n${error.instructions}`, 'error');
                if (error.helpUrl) {
                    window.open(error.helpUrl, '_blank');
                }
            } else {
                throw new Error(error.error || 'Failed to save API key');
            }
            return;
        }
        
        hasApiKey = true;
        showApiKeyStatus('API key saved successfully!', 'success');
        showNotification('API key saved successfully!', 'success');
        document.getElementById('settingsApiKey').value = '';
    } catch (error) {
        showApiKeyStatus(`Error: ${error.message}`, 'error');
        showNotification(`Error saving API key: ${error.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalContent;
    }
}

function showApiKeyStatus(message, type) {
    const statusDiv = document.getElementById('apiKeyStatus');
    statusDiv.textContent = message;
    statusDiv.className = `api-key-status ${type}`;
}

function updateApiKeyStatusInSettings() {
    if (hasApiKey) {
        showApiKeyStatus('API key is configured', 'success');
        document.getElementById('settingsApiKey').placeholder = 'API key is already set';
    } else {
        document.getElementById('apiKeyStatus').textContent = '';
    }
}

// Wizard functionality
function initializeWizard() {
    updateWizardSliderFill();
}

function updateWizardSliderFill() {
    const slider = document.getElementById('wizardStyleSlider');
    const fill = document.getElementById('wizardSliderFill');
    if (slider && fill) {
        const value = slider.value;
        fill.style.width = value + '%';
    }
}

function updateWizardStyleLabel() {
    const slider = document.getElementById('wizardStyleSlider');
    const label = document.getElementById('wizardStyleLabel');
    const description = document.getElementById('wizardStyleDescription');
    const value = parseInt(slider.value);
    
    updateWizardSliderFill();
    wizardData.styleValue = value;
    
    let styleName, desc;
    
    if (value <= 20) {
        styleName = 'Radio Hit';
        desc = '<strong>Radio Hit (0-20):</strong> Maximum hook appeal. Simple, catchy, repeatable.';
    } else if (value <= 40) {
        styleName = 'Hook-Forward';
        desc = '<strong>Hook-Forward (21-40):</strong> Strong commercial appeal with some storytelling.';
    } else if (value <= 60) {
        styleName = 'Balanced';
        desc = '<strong>Balanced (41-60):</strong> Equal focus on hooks and narrative.';
    } else if (value <= 80) {
        styleName = 'Story-Forward';
        desc = '<strong>Story-Forward (61-80):</strong> Narrative takes priority but maintains accessibility.';
    } else {
        styleName = 'Artistic';
        desc = '<strong>Artistic (81-100):</strong> Full storytelling focus. Complex narratives and metaphors welcome.';
    }
    
    label.textContent = styleName;
    description.innerHTML = '<p>' + desc + '</p>';
}

function nextStep() {
    if (currentWizardStep < 4) {
        // Validate current step
        if (!validateWizardStep(currentWizardStep)) {
            return;
        }
        
        // Save current step data
        saveWizardStepData(currentWizardStep);
        
        // Move to next step
        currentWizardStep++;
        showWizardStep(currentWizardStep);
        updateProgressBar();
    }
}

function previousStep() {
    if (currentWizardStep > 1) {
        currentWizardStep--;
        showWizardStep(currentWizardStep);
        updateProgressBar();
    }
}

function showWizardStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`wizardStep${i}`).style.display = 'none';
        document.getElementById(`step${i}`).classList.remove('active', 'completed');
    }
    
    // Show current step
    document.getElementById(`wizardStep${step}`).style.display = 'block';
    document.getElementById(`step${step}`).classList.add('active');
    
    // Mark completed steps
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}`).classList.add('completed');
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('wizardPrevBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    const generateBtn = document.getElementById('wizardGenerateBtn');
    
    prevBtn.style.display = step === 1 ? 'none' : 'block';
    
    if (step === 4) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'block';
        generateReviewContent();
    } else {
        nextBtn.style.display = 'block';
        generateBtn.style.display = 'none';
    }
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = (currentWizardStep / 4) * 100;
    progressFill.style.width = progressPercent + '%';
}

function validateWizardStep(step) {
    switch (step) {
        case 1:
            const theme = document.getElementById('wizardTheme').value.trim();
            if (!theme) {
                showNotification('Please enter a song theme or concept', 'error');
                return false;
            }
            return true;
        case 2:
        case 3:
            return true; // No validation needed for optional steps
        default:
            return true;
    }
}

function saveWizardStepData(step) {
    switch (step) {
        case 1:
            wizardData.theme = document.getElementById('wizardTheme').value;
            wizardData.styleValue = document.getElementById('wizardStyleSlider').value;
            break;
        case 2:
            wizardData.subgenre = document.getElementById('wizardSubgenre').value;
            wizardData.mood = document.getElementById('wizardMood').value;
            wizardData.vocalStyle = document.getElementById('wizardVocalStyle').value;
            break;
        case 3:
            wizardData.additionalNotes = document.getElementById('wizardAdditionalNotes').value;
            break;
    }
}

function generateReviewContent() {
    const reviewDiv = document.getElementById('wizardReview');
    
    let styleText = '';
    const styleValue = parseInt(wizardData.styleValue);
    if (styleValue <= 20) styleText = 'Radio Hit';
    else if (styleValue <= 40) styleText = 'Hook-Forward';
    else if (styleValue <= 60) styleText = 'Balanced';
    else if (styleValue <= 80) styleText = 'Story-Forward';
    else styleText = 'Artistic';
    
    reviewDiv.innerHTML = `
        <h4>Song Configuration</h4>
        <p><strong>Theme:</strong> ${escapeHtml(wizardData.theme)}</p>
        <p><strong>Style:</strong> ${styleText} (${wizardData.styleValue})</p>
        <p><strong>Sub-genre:</strong> ${wizardData.subgenre || 'Let Claude decide'}</p>
        <p><strong>Mood:</strong> ${wizardData.mood || 'Let Claude decide'}</p>
        <p><strong>Vocal Style:</strong> ${wizardData.vocalStyle || 'Let Claude decide'}</p>
        ${wizardData.additionalNotes ? `<p><strong>Additional Notes:</strong> ${escapeHtml(wizardData.additionalNotes)}</p>` : ''}
    `;
}

function showWizardTab(tabName) {
    // Hide all tabs
    document.getElementById('wizardInstrumentsTab').style.display = 'none';
    document.getElementById('wizardTempoTab').style.display = 'none';
    document.getElementById('wizardKeywordsTab').style.display = 'none';
    document.getElementById('wizardTopicsTab').style.display = 'none';
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.wizard-tabs .tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const tabMap = {
        'instruments': 'wizardInstrumentsTab',
        'tempo': 'wizardTempoTab',
        'keywords': 'wizardKeywordsTab',
        'topics': 'wizardTopicsTab'
    };
    
    document.getElementById(tabMap[tabName]).style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function addToWizardNotes(element) {
    const notesField = document.getElementById('wizardAdditionalNotes');
    const currentValue = notesField.value;
    
    if (currentValue.trim()) {
        notesField.value = currentValue + ', ' + element;
    } else {
        notesField.value = element;
    }
    
    // Flash the textarea
    notesField.style.backgroundColor = '#fffacd';
    setTimeout(() => {
        notesField.style.backgroundColor = '';
    }, 300);
}

function updateWizardVocalStyleInfo() {
    const vocalStyle = document.getElementById('wizardVocalStyle').value;
    const info = document.getElementById('wizardVocalStyleInfo');
    
    if (vocalStyle === 'duet') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}

async function letClaudeDecide() {
    // Save current data first
    saveWizardStepData(2);
    
    // Get current settings
    const styleValue = parseInt(wizardData.styleValue);
    const theme = wizardData.theme.toLowerCase();
    const subgenre = wizardData.subgenre;
    const mood = wizardData.mood;
    const vocalStyle = wizardData.vocalStyle;
    
    // Clear current additional notes
    const notesField = document.getElementById('wizardAdditionalNotes');
    notesField.value = '';
    
    // Arrays to collect selected items
    let selectedItems = [];
    
    // Instrument selection based on sub-genre
    if (subgenre === 'Traditional Country') {
        selectedItems.push('Acoustic guitar', 'Fiddle', 'Pedal steel', 'Upright bass');
    } else if (subgenre === 'Pop Country') {
        selectedItems.push('Electric guitar', 'Drums', 'Synth pads', '808 bass');
        if (mood === 'upbeat and celebratory') {
            selectedItems.push('Gang vocals', 'Hand claps');
        }
    } else if (subgenre === 'Bluegrass') {
        selectedItems.push('Banjo', 'Mandolin', 'Fiddle', 'Upright bass', 'Dobro');
    } else if (subgenre === 'Outlaw Country') {
        selectedItems.push('Electric guitar', 'Harmonica', 'Drums', 'Hammond organ');
    } else if (subgenre === 'Country Rock') {
        selectedItems.push('Electric guitar', 'Drums', 'Hammond organ', 'Slide guitar');
    } else if (subgenre === 'Americana') {
        selectedItems.push('Acoustic guitar', 'Harmonica', 'Piano', 'Fiddle');
    } else if (subgenre === 'Honky-Tonk') {
        selectedItems.push('Piano', 'Pedal steel', 'Electric guitar', 'Upright bass');
    } else if (subgenre === 'Country Rap') {
        selectedItems.push('808 bass', 'Trap drums', 'Synth pads', 'Auto-tune');
    } else {
        // Default mix based on style
        if (styleValue <= 40) {
            selectedItems.push('Electric guitar', 'Drums', 'Synth pads');
        } else {
            selectedItems.push('Acoustic guitar', 'Fiddle', 'Piano');
        }
    }
    
    // Tempo and key based on mood and style
    if (mood === 'upbeat and celebratory' || mood === 'humorous and playful') {
        selectedItems.push('Upbeat (110-130 BPM)', 'Key of G');
        if (styleValue <= 40) {
            selectedItems.push('Key change in final chorus');
        }
    } else if (mood === 'heartbroken and melancholic' || mood === 'introspective and thoughtful') {
        selectedItems.push('Slow tempo (70-90 BPM)', 'Key of Em', 'Minor key');
        if (styleValue > 60) {
            selectedItems.push('Rubato intro');
        }
    } else if (mood === 'nostalgic and reflective') {
        selectedItems.push('Mid-tempo (90-110 BPM)', 'Key of D', 'Waltz time (3/4)');
    } else if (mood === 'rebellious and defiant') {
        selectedItems.push('Fast (130+ BPM)', 'Key of A', 'Double-time feel');
    } else if (mood === 'romantic and tender') {
        selectedItems.push('Ballad (60-70 BPM)', 'Key of C', '6/8 time signature');
    } else {
        selectedItems.push('Mid-tempo (90-110 BPM)', 'Key of G');
    }
    
    // Vocal style additions
    if (vocalStyle === 'duet') {
        selectedItems.push('Call and response', 'A cappella section');
    } else if (vocalStyle === 'female') {
        selectedItems.push('Key of F', 'Gospel choir');
    }
    
    // Keywords based on theme and style
    const themeKeywords = {
        // Places
        'town': ['Small town life', 'Water tower', 'Courthouse', 'Diner', 'Small town gossip'],
        'home': ['Coming home', 'Front porch', 'Porch sitting', 'Family traditions'],
        'road': ['Dirt road', 'Backroads', 'Road trip', 'Pickup truck'],
        'farm': ['Farmer', 'Tractor', 'Cornfield', 'Harvest time', 'Planting season'],
        
        // Emotions/Events
        'love': ['First love', 'Lost love', 'Stars', 'Moonlight', 'Wedding'],
        'heart': ['Heartbreak', 'Divorce', 'Blue jeans', 'Whiskey'],
        'party': ['Party anthem', 'Bonfire', 'Tailgate', 'Friday night', 'Beer'],
        'memory': ['Nostalgia', 'Summer memories', 'High school days', 'Graduation'],
        
        // Time
        'night': ['Friday night', 'Moonlight', 'Stars', 'Star gazing', 'Bonfire'],
        'summer': ['Summer memories', 'River', 'Fishing', 'County fair'],
        'morning': ['Coffee pot', 'Sunrise', 'Work boots', 'Working hard'],
        
        // Nature
        'rain': ['Thunderstorm', 'Muddy creek', 'River'],
        'sun': ['Sunset', 'Drought', 'Harvest moon']
    };
    
    // Add keywords based on theme
    Object.keys(themeKeywords).forEach(keyword => {
        if (theme.includes(keyword)) {
            selectedItems.push(...themeKeywords[keyword].slice(0, 3)); // Add first 3 matches
        }
    });
    
    // Style-based additions
    if (styleValue <= 30) {
        // Radio hit style - add party/fun elements
        selectedItems.push('Pickup truck', 'Tailgate', 'Blue jeans', 'Friday night', 'Party anthem');
    } else if (styleValue >= 70) {
        // Story song style - add narrative elements
        selectedItems.push('Grandpa\'s wisdom', 'Mama\'s prayers', 'Church bells', 'Cemetery', 'Redemption');
    }
    
    // Regional elements based on sub-genre
    if (subgenre === 'Bluegrass' || theme.includes('mountain') || theme.includes('appalachian')) {
        selectedItems.push('Appalachian pride', 'Pine woods', 'Limestone cliff');
    } else if (theme.includes('texas') || theme.includes('cowboy')) {
        selectedItems.push('Texas sized', 'Cowboy boots', 'Two-stepping');
    } else if (theme.includes('nashville') || theme.includes('music')) {
        selectedItems.push('Nashville dreams', 'Radio', 'Guitar');
    }
    
    // Modern elements for contemporary styles
    if (subgenre === 'Pop Country' || subgenre === 'Country Rap') {
        selectedItems.push('Social media drama', 'Online dating', 'Video calls home');
    }
    
    // Remove duplicates and join
    selectedItems = [...new Set(selectedItems)];
    notesField.value = selectedItems.join(', ');
    
    // Visual feedback
    notesField.style.backgroundColor = '#fffacd';
    setTimeout(() => {
        notesField.style.backgroundColor = '';
    }, 500);
    
    // Show notification
    showNotification('Claude has selected options based on your song configuration!', 'success');
}

function letClaudeDecideClassic() {
    // Get current settings from classic interface
    const styleValue = parseInt(document.getElementById('styleSlider').value);
    const theme = document.getElementById('theme').value.toLowerCase();
    const subgenre = document.getElementById('subgenre').value;
    const mood = document.getElementById('mood').value;
    const vocalStyle = document.getElementById('vocalStyle').value;
    
    // Clear current additional notes
    const notesField = document.getElementById('additionalNotes');
    notesField.value = '';
    
    // Arrays to collect selected items
    let selectedItems = [];
    
    // Instrument selection based on sub-genre
    if (subgenre === 'Traditional Country') {
        selectedItems.push('Acoustic guitar', 'Fiddle', 'Pedal steel', 'Upright bass');
    } else if (subgenre === 'Pop Country') {
        selectedItems.push('Electric guitar', 'Drums', 'Synth pads', '808 bass');
        if (mood === 'upbeat and celebratory') {
            selectedItems.push('Gang vocals', 'Hand claps');
        }
    } else if (subgenre === 'Bluegrass') {
        selectedItems.push('Banjo', 'Mandolin', 'Fiddle', 'Upright bass', 'Dobro');
    } else if (subgenre === 'Outlaw Country') {
        selectedItems.push('Electric guitar', 'Harmonica', 'Drums', 'Hammond organ');
    } else if (subgenre === 'Country Rock') {
        selectedItems.push('Electric guitar', 'Drums', 'Hammond organ', 'Slide guitar');
    } else if (subgenre === 'Americana') {
        selectedItems.push('Acoustic guitar', 'Harmonica', 'Piano', 'Fiddle');
    } else if (subgenre === 'Honky-Tonk') {
        selectedItems.push('Piano', 'Pedal steel', 'Electric guitar', 'Upright bass');
    } else if (subgenre === 'Country Rap') {
        selectedItems.push('808 bass', 'Trap drums', 'Synth pads', 'Auto-tune');
    } else {
        // Default mix based on style
        if (styleValue <= 40) {
            selectedItems.push('Electric guitar', 'Drums', 'Synth pads');
        } else {
            selectedItems.push('Acoustic guitar', 'Fiddle', 'Piano');
        }
    }
    
    // Tempo and key based on mood and style
    if (mood === 'upbeat and celebratory' || mood === 'humorous and playful') {
        selectedItems.push('Upbeat (110-130 BPM)', 'Key of G');
        if (styleValue <= 40) {
            selectedItems.push('Key change in final chorus');
        }
    } else if (mood === 'heartbroken and melancholic' || mood === 'introspective and thoughtful') {
        selectedItems.push('Slow tempo (70-90 BPM)', 'Key of Em', 'Minor key');
        if (styleValue > 60) {
            selectedItems.push('Rubato intro');
        }
    } else if (mood === 'nostalgic and reflective') {
        selectedItems.push('Mid-tempo (90-110 BPM)', 'Key of D', 'Waltz time (3/4)');
    } else if (mood === 'rebellious and defiant') {
        selectedItems.push('Fast (130+ BPM)', 'Key of A', 'Double-time feel');
    } else if (mood === 'romantic and tender') {
        selectedItems.push('Ballad (60-70 BPM)', 'Key of C', '6/8 time signature');
    } else {
        selectedItems.push('Mid-tempo (90-110 BPM)', 'Key of G');
    }
    
    // Vocal style additions
    if (vocalStyle === 'duet') {
        selectedItems.push('Call and response', 'A cappella section');
    } else if (vocalStyle === 'female') {
        selectedItems.push('Key of F', 'Gospel choir');
    }
    
    // Keywords based on theme and style
    const themeKeywords = {
        // Places
        'town': ['Small town life', 'Water tower', 'Courthouse', 'Diner', 'Small town gossip'],
        'home': ['Coming home', 'Front porch', 'Porch sitting', 'Family traditions'],
        'road': ['Dirt road', 'Backroads', 'Road trip', 'Pickup truck'],
        'farm': ['Farmer', 'Tractor', 'Cornfield', 'Harvest time', 'Planting season'],
        
        // Emotions/Events
        'love': ['First love', 'Lost love', 'Stars', 'Moonlight', 'Wedding'],
        'heart': ['Heartbreak', 'Divorce', 'Blue jeans', 'Whiskey'],
        'party': ['Party anthem', 'Bonfire', 'Tailgate', 'Friday night', 'Beer'],
        'memory': ['Nostalgia', 'Summer memories', 'High school days', 'Graduation'],
        
        // Time
        'night': ['Friday night', 'Moonlight', 'Stars', 'Star gazing', 'Bonfire'],
        'summer': ['Summer memories', 'River', 'Fishing', 'County fair'],
        'morning': ['Coffee pot', 'Sunrise', 'Work boots', 'Working hard'],
        
        // Nature
        'rain': ['Thunderstorm', 'Muddy creek', 'River'],
        'sun': ['Sunset', 'Drought', 'Harvest moon']
    };
    
    // Add keywords based on theme
    Object.keys(themeKeywords).forEach(keyword => {
        if (theme.includes(keyword)) {
            selectedItems.push(...themeKeywords[keyword].slice(0, 3)); // Add first 3 matches
        }
    });
    
    // Style-based additions
    if (styleValue <= 30) {
        // Radio hit style - add party/fun elements
        selectedItems.push('Pickup truck', 'Tailgate', 'Blue jeans', 'Friday night', 'Party anthem');
    } else if (styleValue >= 70) {
        // Story song style - add narrative elements
        selectedItems.push('Grandpa\'s wisdom', 'Mama\'s prayers', 'Church bells', 'Cemetery', 'Redemption');
    }
    
    // Regional elements based on sub-genre
    if (subgenre === 'Bluegrass' || theme.includes('mountain') || theme.includes('appalachian')) {
        selectedItems.push('Appalachian pride', 'Pine woods', 'Limestone cliff');
    } else if (theme.includes('texas') || theme.includes('cowboy')) {
        selectedItems.push('Texas sized', 'Cowboy boots', 'Two-stepping');
    } else if (theme.includes('nashville') || theme.includes('music')) {
        selectedItems.push('Nashville dreams', 'Radio', 'Guitar');
    }
    
    // Modern elements for contemporary styles
    if (subgenre === 'Pop Country' || subgenre === 'Country Rap') {
        selectedItems.push('Social media drama', 'Online dating', 'Video calls home');
    }
    
    // Remove duplicates and join
    selectedItems = [...new Set(selectedItems)];
    notesField.value = selectedItems.join(', ');
    
    // Visual feedback
    notesField.style.backgroundColor = '#fffacd';
    setTimeout(() => {
        notesField.style.backgroundColor = '';
    }, 500);
    
    // Show notification
    showNotification('Claude has selected options based on your song configuration!', 'success');
}

function generateRandomThemeWizard() {
    if (!hasApiKey) {
        showNotification('Please set your Claude API key in Settings', 'error');
        return;
    }

    const themeInput = document.getElementById('wizardTheme');
    const styleValue = document.getElementById('wizardStyleSlider').value;
    
    // Use the existing generateRandomTheme function logic
    const btn = event.target.closest('button');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const response = await fetch('/api/generate-theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ styleValue })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API request failed: ${response.status}`);
        }

        const data = await response.json();
        themeInput.value = data.theme;
        
        // Animation effect
        themeInput.style.transform = 'scale(1.02)';
        themeInput.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.3)';
        setTimeout(() => {
            themeInput.style.transform = '';
            themeInput.style.boxShadow = '';
        }, 300);

    } catch (error) {
        showNotification(`Error generating theme: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

async function generateSongFromWizard() {
    if (!hasApiKey) {
        showNotification('Please set your Claude API key first in Settings', 'error');
        return;
    }

    // Save current step data
    saveWizardStepData(3);

    const generateBtn = document.getElementById('wizardGenerateBtn');
    const loading = document.getElementById('loading');
    const output = document.getElementById('output');

    const originalContent = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    loading.style.display = 'block';
    output.innerHTML = '';

    try {
        const response = await fetch('/api/generate-song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                theme: wizardData.theme,
                subgenre: wizardData.subgenre,
                vocalStyle: wizardData.vocalStyle,
                mood: wizardData.mood,
                additionalNotes: wizardData.additionalNotes,
                styleValue: wizardData.styleValue
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API request failed: ${response.status}`);
        }

        const songData = await response.json();
        displaySong(songData);
        await addToHistory(songData);
        showNotification('Song generated successfully!', 'success');
        
        // Reset wizard to step 1 for next song
        currentWizardStep = 1;
        showWizardStep(1);
        updateProgressBar();
        
        // Clear form
        document.getElementById('wizardTheme').value = '';
        document.getElementById('wizardAdditionalNotes').value = '';
        
    } catch (error) {
        output.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</div>`;
        showNotification('Failed to generate song', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalContent;
        loading.style.display = 'none';
    }
}

// Update slider fill background
function updateSliderFill() {
    const slider = document.getElementById('styleSlider');
    const fill = document.getElementById('sliderFill');
    const value = slider.value;
    fill.style.width = value + '%';
}

// Update style label and description based on slider value
function updateStyleLabel() {
    const slider = document.getElementById('styleSlider');
    const label = document.getElementById('styleLabel');
    const description = document.getElementById('styleDescription');
    const value = parseInt(slider.value);
    
    updateSliderFill();
    
    let styleName, desc;
    
    if (value <= 20) {
        styleName = 'Radio Hit';
        desc = '<strong>Radio Hit (0-20):</strong> Maximum hook appeal. Simple, catchy, repeatable. Think "Cruise," "Red Solo Cup," "Chicken Fried." Built for sing-alongs and chart success.';
    } else if (value <= 40) {
        styleName = 'Hook-Forward';
        desc = '<strong>Hook-Forward (21-40):</strong> Strong commercial appeal with some storytelling. Like "Body Like a Back Road" or "Dirt Road Anthem." Radio-friendly but with personality.';
    } else if (value <= 60) {
        styleName = 'Balanced';
        desc = '<strong>Balanced (41-60):</strong> Equal focus on hooks and narrative. Think "Amarillo By Morning" or "Friends in Low Places." Commercial yet meaningful.';
    } else if (value <= 80) {
        styleName = 'Story-Forward';
        desc = '<strong>Story-Forward (61-80):</strong> Narrative takes priority but maintains accessibility. Like "The Dance" or "Whiskey Lullaby." Deeper meaning with memorable moments.';
    } else {
        styleName = 'Artistic';
        desc = '<strong>Artistic (81-100):</strong> Full storytelling focus. Complex narratives and metaphors welcome. Think "He Stopped Loving Her Today" or "The Grand Tour." Art over commerce.';
    }
    
    label.textContent = styleName;
    description.innerHTML = '<p>' + desc + '</p>';
}

// Toggle history sidebar
function toggleHistory() {
    const sidebar = document.getElementById('historySidebar');
    const mainContent = document.querySelector('.main-content');
    
    historyOpen = !historyOpen;
    
    if (historyOpen) {
        sidebar.classList.add('active');
        mainContent.classList.add('shifted');
    } else {
        sidebar.classList.remove('active');
        mainContent.classList.remove('shifted');
    }
}

// Load history from server
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        if (response.ok) {
            songHistory = await response.json();
            displayHistory();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showNotification('Failed to load history', 'error');
    }
}

// Add song to history (server-side)
async function addToHistory(songData) {
    const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        title: songData.title,
        theme: document.getElementById('theme').value,
        styleValue: document.getElementById('styleSlider').value,
        songData: songData
    };
    
    try {
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historyItem)
        });
        
        if (response.ok) {
            // Reload history from server to ensure consistency
            await loadHistory();
        } else {
            throw new Error('Failed to save to history');
        }
    } catch (error) {
        console.error('Error saving to history:', error);
        showNotification('Failed to save to history', 'error');
    }
}

// Display history in sidebar
function displayHistory() {
    const historyList = document.getElementById('historyList');
    
    if (songHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No songs generated yet</p>';
        return;
    }
    
    historyList.innerHTML = songHistory.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-title">${escapeHtml(item.title)}</div>
                <div class="history-item-date">${dateStr}</div>
                <div class="history-item-preview">Theme: ${escapeHtml(item.theme)}</div>
                <div class="history-item-actions">
                    <button class="history-btn" onclick="loadFromHistory(${item.id})">
                        <i class="fas fa-redo"></i> Load
                    </button>
                    <button class="history-btn" onclick="deleteFromHistory(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    updateHistoryCount();
}

// Filter history based on search
function filterHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const historyItems = document.querySelectorAll('.history-item');
    
    historyItems.forEach(item => {
        const title = item.querySelector('.history-item-title').textContent.toLowerCase();
        const preview = item.querySelector('.history-item-preview').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || preview.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Load song from history
function loadFromHistory(id) {
    const item = songHistory.find(h => h.id === id);
    if (!item) return;
    
    // Set the form values
    document.getElementById('theme').value = item.theme;
    document.getElementById('styleSlider').value = item.styleValue;
    updateStyleLabel();
    
    // Display the song
    displaySong(item.songData);
    
    // Close history sidebar
    toggleHistory();
    
    // Scroll to output
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}

// Delete from history (server-side)
async function deleteFromHistory(id) {
    if (confirm('Are you sure you want to delete this song from history?')) {
        try {
            const response = await fetch(`/api/history/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadHistory();
                showNotification('Song deleted from history', 'success');
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting from history:', error);
            showNotification('Failed to delete from history', 'error');
        }
    }
}

// Clear all history (server-side)
async function clearAllHistory() {
    if (confirm('Are you sure you want to clear all song history? This cannot be undone.')) {
        try {
            const response = await fetch('/api/history', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadHistory();
                showNotification('All history cleared', 'success');
            } else {
                throw new Error('Failed to clear history');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            showNotification('Failed to clear history', 'error');
        }
    }
}

// Update history count badge
function updateHistoryCount() {
    const countElement = document.getElementById('historyCount');
    if (songHistory.length > 0) {
        countElement.textContent = songHistory.length;
        countElement.style.display = 'inline-block';
    } else {
        countElement.style.display = 'none';
    }
}

// Check API key status on server
async function checkApiKeyStatus() {
    try {
        const response = await fetch('/api/check-key');
        const data = await response.json();
        hasApiKey = data.hasKey;
        
        // Show Vercel-specific message if needed
        if (data.isVercel && !data.hasKey) {
            showVercelInstructions();
        }
        
        updateApiKeyUI(hasApiKey);
    } catch (error) {
        console.error('Error checking API key:', error);
    }
}

// Show Vercel deployment instructions
function showVercelInstructions() {
    const notification = document.createElement('div');
    notification.className = 'notification notification-info';
    notification.style.maxWidth = '500px';
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <div>
            <strong>Running on Vercel</strong><br>
            <small>To use this app, add your Claude API key in Vercel:<br>
            1. Go to your Vercel Dashboard<br>
            2. Settings → Environment Variables<br>
            3. Add CLAUDE_API_KEY with your key<br>
            4. Redeploy the app</small>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Keep this notification visible longer
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Don't auto-remove this important message
}

// Update UI based on API key status
function updateApiKeyUI(hasKey) {
    // API key UI is now handled in settings
    hasApiKey = hasKey;
}

// Show notification (instead of alert)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate random theme
async function generateRandomTheme() {
    if (!hasApiKey) {
        showNotification('Please set your Claude API key in Settings', 'error');
        return;
    }

    const randomThemeBtn = document.getElementById('randomThemeBtn');
    const themeInput = document.getElementById('theme');
    const styleValue = document.getElementById('styleSlider').value;
    
    const originalContent = randomThemeBtn.innerHTML;
    randomThemeBtn.disabled = true;
    randomThemeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const response = await fetch('/api/generate-theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ styleValue })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API request failed: ${response.status}`);
        }

        const data = await response.json();
        themeInput.value = data.theme;
        
        // Add a little animation effect
        themeInput.style.transform = 'scale(1.02)';
        themeInput.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.3)';
        setTimeout(() => {
            themeInput.style.transform = '';
            themeInput.style.boxShadow = '';
        }, 300);

    } catch (error) {
        showNotification(`Error generating theme: ${error.message}`, 'error');
    } finally {
        randomThemeBtn.disabled = false;
        randomThemeBtn.innerHTML = originalContent;
    }
}

// Update vocal style info
function updateVocalStyleInfo() {
    const vocalStyle = document.getElementById('vocalStyle').value;
    const info = document.getElementById('vocalStyleInfo');
    
    if (vocalStyle === 'duet') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}

// Add elements to notes
function addToNotes(element) {
    const notesField = document.getElementById('additionalNotes');
    const currentValue = notesField.value;
    
    // Add element to notes, with comma if there's already content
    if (currentValue.trim()) {
        notesField.value = currentValue + ', ' + element;
    } else {
        notesField.value = element;
    }
    
    // Flash the textarea to show it was updated
    notesField.style.backgroundColor = '#fffacd';
    setTimeout(() => {
        notesField.style.backgroundColor = '';
    }, 300);
}

// Generate song
async function generateSong() {
    if (!hasApiKey) {
        showNotification('Please set your Claude API key in Settings', 'error');
        return;
    }

    const theme = document.getElementById('theme').value;
    const subgenre = document.getElementById('subgenre').value;
    const vocalStyle = document.getElementById('vocalStyle').value;
    const mood = document.getElementById('mood').value;
    const additionalNotes = document.getElementById('additionalNotes').value;
    const styleValue = document.getElementById('styleSlider').value;

    if (!theme) {
        showNotification('Please enter a song theme or concept', 'error');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const output = document.getElementById('output');

    const originalContent = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    loading.style.display = 'block';
    output.innerHTML = '';

    try {
        const response = await fetch('/api/generate-song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                theme,
                subgenre,
                vocalStyle,
                mood,
                additionalNotes,
                styleValue
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API request failed: ${response.status}`);
        }

        const songData = await response.json();
        displaySong(songData);
        await addToHistory(songData);
        showNotification('Song generated successfully!', 'success');
    } catch (error) {
        output.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</div>`;
        showNotification('Failed to generate song', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalContent;
        loading.style.display = 'none';
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Copy to clipboard
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Store for edit mode
let editOriginalContent = {};

// Display generated song
function displaySong(songData) {
    const output = document.getElementById('output');
    
    // Store song data globally for save functions
    window.currentSongData = songData;
    
    // Ensure we have all fields
    songData.title = songData.title || 'Generated Song';
    songData.lyrics = songData.lyrics || 'Lyrics not available';
    songData.sunoStyle = songData.sunoStyle || 'Style information not available';
    songData.notes = songData.notes || 'Notes not available';
    
    // Format lyrics with proper line breaks and color-coding
    let formattedLyrics = escapeHtml(songData.lyrics);
    
    // Replace newlines with actual line breaks (but preserve pre-wrap styling)
    formattedLyrics = formattedLyrics.replace(/\\n/g, '\n');
    
    // Color-code duet parts if present
    if (songData.lyrics.includes('[Male]') || songData.lyrics.includes('[Female]') || songData.lyrics.includes('(Male)') || songData.lyrics.includes('(Female)')) {
        formattedLyrics = formattedLyrics
            .replace(/\[Male\]:|Male:/g, '<span style="color: #1E90FF; font-weight: bold;">[Male]:</span>')
            .replace(/\[Female\]:|Female:/g, '<span style="color: #DC143C; font-weight: bold;">[Female]:</span>')
            .replace(/\[Both\]:|Both:/g, '<span style="color: #8B4513; font-weight: bold;">[Both]:</span>')
            .replace(/\(Male\)/g, '<span style="color: #1E90FF; font-weight: bold;">(Male)</span>')
            .replace(/\(Female\)/g, '<span style="color: #DC143C; font-weight: bold;">(Female)</span>')
            .replace(/\(Both\)/g, '<span style="color: #8B4513; font-weight: bold;">(Both)</span>');
    }
    
    output.innerHTML = `
        <div class="song-output">
            <h2 class="song-title">${escapeHtml(songData.title)}</h2>
            
            <div class="song-section" id="lyrics-section">
                <div class="section-header">
                    <h3><i class="fas fa-music"></i> Lyrics</h3>
                    <div>
                        <button class="copy-button" onclick="copyToClipboard(\`${songData.lyrics.replace(/`/g, '\\`')}\`, this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="edit-button" onclick="enableEdit('lyrics')">
                            <i class="fas fa-pencil-alt"></i> Edit
                        </button>
                    </div>
                </div>
                <div class="lyrics" id="lyrics-content">${formattedLyrics}</div>
            </div>
            
            <div class="song-section" id="suno-section">
                <div class="section-header">
                    <h3><i class="fas fa-sliders-h"></i> Suno Style</h3>
                    <div>
                        <button class="copy-button" onclick="copyToClipboard(\`${songData.sunoStyle.replace(/`/g, '\\`')}\`, this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="edit-button" onclick="enableEdit('sunoStyle')">
                            <i class="fas fa-pencil-alt"></i> Edit
                        </button>
                    </div>
                </div>
                <div class="suno-style" id="suno-content">${escapeHtml(songData.sunoStyle)}</div>
            </div>
            
            <div class="song-section" id="notes-section">
                <div class="section-header">
                    <h3><i class="fas fa-sticky-note"></i> Notes/Theme</h3>
                    <div>
                        <button class="copy-button" onclick="copyToClipboard(\`${songData.notes.replace(/`/g, '\\`')}\`, this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="edit-button" onclick="enableEdit('notes')">
                            <i class="fas fa-pencil-alt"></i> Edit
                        </button>
                    </div>
                </div>
                <div class="notes" id="notes-content">${escapeHtml(songData.notes)}</div>
            </div>
            
            <div class="save-buttons-container">
                <button class="save-button save-button-json" onclick="saveSong(window.currentSongData)">
                    <i class="fas fa-file-code"></i> Save as JSON
                </button>
                <button class="save-button save-button-markdown" onclick="saveSongAsMarkdown(window.currentSongData)">
                    <i class="fas fa-file-alt"></i> Save as Markdown
                </button>
                <button class="save-button save-button-pdf" onclick="saveSongAsPDF(window.currentSongData)">
                    <i class="fas fa-file-pdf"></i> Save as PDF
                </button>
            </div>
        </div>
    `;
    
    // Scroll to output
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Save song as JSON
function saveSong(songData) {
    // Add artist field
    const dataWithArtist = {
        ...songData,
        artist: "Alex Wilson",
        generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataWithArtist, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Song saved as JSON', 'success');
}

// Save song as Markdown
function saveSongAsMarkdown(songData) {
    const markdown = `# ${songData.title}

**Artist:** Alex Wilson  
**Generated:** ${new Date().toLocaleString()}

## Lyrics

${songData.lyrics}

## Suno Style

${songData.sunoStyle}

## Notes/Theme

${songData.notes}

---

*Generated with Alex Wilson Country Song Generator*`;

    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Song saved as Markdown', 'success');
}

// Save song as PDF
function saveSongAsPDF(songData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(songData.title, 105, 20, { align: 'center' });
    
    // Artist
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('by Alex Wilson', 105, 30, { align: 'center' });
    
    // Reset font
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    let yPosition = 45;
    
    // Lyrics section
    doc.setFont(undefined, 'bold');
    doc.text('Lyrics', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    // Split lyrics into lines and handle page breaks
    const lyricsLines = songData.lyrics.split('\n');
    for (const line of lyricsLines) {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Handle section markers
        if (line.match(/^\[.*\]$/) || line.match(/^\[.*\]:/) || line.match(/^[A-Za-z]+:/)) {
            doc.setFont(undefined, 'bold');
            doc.text(line, 20, yPosition);
            doc.setFont(undefined, 'normal');
        } else if (line.trim() === '') {
            // Empty line - just add space
            yPosition += 4;
            continue;
        } else {
            // Wrap long lines
            const wrappedLines = doc.splitTextToSize(line, 170);
            for (const wrappedLine of wrappedLines) {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(wrappedLine, 20, yPosition);
                yPosition += 6;
            }
        }
        yPosition += 2;
    }
    
    // Suno Style section
    yPosition += 10;
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Suno Style', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    const styleLines = doc.splitTextToSize(songData.sunoStyle, 170);
    for (const line of styleLines) {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
    }
    
    // Notes section
    yPosition += 10;
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Notes/Theme', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    const notesLines = doc.splitTextToSize(songData.notes, 170);
    for (const line of notesLines) {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
    }
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    doc.setFontSize(10);
    doc.text(`Generated with Alex Wilson Country Song Generator - ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    
    // Save PDF
    doc.save(`${songData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    showNotification('Song saved as PDF', 'success');
}

// Edit mode functions
function enableEdit(sectionType) {
    // Get the current content and section elements
    let contentElement, sectionElement, currentContent;
    
    switch(sectionType) {
        case 'lyrics':
            contentElement = document.getElementById('lyrics-content');
            sectionElement = document.getElementById('lyrics-section');
            currentContent = window.currentSongData.lyrics;
            break;
        case 'sunoStyle':
            contentElement = document.getElementById('suno-content');
            sectionElement = document.getElementById('suno-section');
            currentContent = window.currentSongData.sunoStyle;
            break;
        case 'notes':
            contentElement = document.getElementById('notes-content');
            sectionElement = document.getElementById('notes-section');
            currentContent = window.currentSongData.notes;
            break;
        default:
            return;
    }
    
    // Store original content for cancellation
    editOriginalContent[sectionType] = currentContent;
    
    // Add editing highlight
    sectionElement.classList.add('editing-highlight');
    
    // Create editable textarea
    const editContainer = document.createElement('div');
    editContainer.className = 'editable-section';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'edit-textarea';
    textarea.value = currentContent;
    textarea.id = `edit-${sectionType}`;
    
    // For lyrics, set a larger minimum height
    if (sectionType === 'lyrics') {
        textarea.style.minHeight = '300px';
    }
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'edit-actions';
    
    actionsDiv.innerHTML = `
        <button class="btn-cancel-edit" onclick="cancelEdit('${sectionType}')">
            <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-save-edit" onclick="saveEdit('${sectionType}')">
            <i class="fas fa-save"></i> Save
        </button>
    `;
    
    editContainer.appendChild(textarea);
    editContainer.appendChild(actionsDiv);
    
    // Replace content with edit container
    contentElement.replaceWith(editContainer);
    
    // Focus the textarea
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function saveEdit(sectionType) {
    // Get the edited content
    const textarea = document.getElementById(`edit-${sectionType}`);
    const newContent = textarea.value;
    
    // Update the global song data
    window.currentSongData[sectionType] = newContent;
    
    // Get section element
    let sectionElement;
    switch(sectionType) {
        case 'lyrics':
            sectionElement = document.getElementById('lyrics-section');
            break;
        case 'sunoStyle':
            sectionElement = document.getElementById('suno-section');
            break;
        case 'notes':
            sectionElement = document.getElementById('notes-section');
            break;
    }
    
    // Remove editing highlight
    sectionElement.classList.remove('editing-highlight');
    
    // Create new content element
    let contentElement;
    if (sectionType === 'lyrics') {
        contentElement = document.createElement('div');
        contentElement.className = 'lyrics';
        contentElement.id = 'lyrics-content';
        
        // Apply formatting for lyrics
        let formattedContent = escapeHtml(newContent);
        
        // Color-code duet parts if present
        if (newContent.includes('[Male]') || newContent.includes('[Female]') || 
            newContent.includes('(Male)') || newContent.includes('(Female)')) {
            formattedContent = formattedContent
                .replace(/\[Male\]:|Male:/g, '<span style="color: #1E90FF; font-weight: bold;">[Male]:</span>')
                .replace(/\[Female\]:|Female:/g, '<span style="color: #DC143C; font-weight: bold;">[Female]:</span>')
                .replace(/\[Both\]:|Both:/g, '<span style="color: #8B4513; font-weight: bold;">[Both]:</span>')
                .replace(/\(Male\)/g, '<span style="color: #1E90FF; font-weight: bold;">(Male)</span>')
                .replace(/\(Female\)/g, '<span style="color: #DC143C; font-weight: bold;">(Female)</span>')
                .replace(/\(Both\)/g, '<span style="color: #8B4513; font-weight: bold;">(Both)</span>');
        }
        
        contentElement.innerHTML = formattedContent;
    } else {
        contentElement = document.createElement('div');
        contentElement.className = sectionType === 'sunoStyle' ? 'suno-style' : 'notes';
        contentElement.id = sectionType === 'sunoStyle' ? 'suno-content' : 'notes-content';
        contentElement.textContent = newContent;
    }
    
    // Replace edit container with content
    const editContainer = textarea.parentElement;
    editContainer.replaceWith(contentElement);
    
    // Update copy button
    const copyButton = sectionElement.querySelector('.copy-button');
    copyButton.setAttribute('onclick', `copyToClipboard(\`${newContent.replace(/`/g, '\\`')}\`, this)`);
    
    // Show success notification
    showNotification('Changes saved successfully!', 'success');
    
    // Clear stored original content
    delete editOriginalContent[sectionType];
}

function cancelEdit(sectionType) {
    // Get section element
    let sectionElement, contentClass, contentId;
    switch(sectionType) {
        case 'lyrics':
            sectionElement = document.getElementById('lyrics-section');
            contentClass = 'lyrics';
            contentId = 'lyrics-content';
            break;
        case 'sunoStyle':
            sectionElement = document.getElementById('suno-section');
            contentClass = 'suno-style';
            contentId = 'suno-content';
            break;
        case 'notes':
            sectionElement = document.getElementById('notes-section');
            contentClass = 'notes';
            contentId = 'notes-content';
            break;
    }
    
    // Remove editing highlight
    sectionElement.classList.remove('editing-highlight');
    
    // Get original content
    const originalContent = editOriginalContent[sectionType];
    
    // Create content element with original content
    const contentElement = document.createElement('div');
    contentElement.className = contentClass;
    contentElement.id = contentId;
    
    if (sectionType === 'lyrics') {
        // Apply formatting for lyrics
        let formattedContent = escapeHtml(originalContent);
        
        // Color-code duet parts if present
        if (originalContent.includes('[Male]') || originalContent.includes('[Female]') || 
            originalContent.includes('(Male)') || originalContent.includes('(Female)')) {
            formattedContent = formattedContent
                .replace(/\[Male\]:|Male:/g, '<span style="color: #1E90FF; font-weight: bold;">[Male]:</span>')
                .replace(/\[Female\]:|Female:/g, '<span style="color: #DC143C; font-weight: bold;">[Female]:</span>')
                .replace(/\[Both\]:|Both:/g, '<span style="color: #8B4513; font-weight: bold;">[Both]:</span>')
                .replace(/\(Male\)/g, '<span style="color: #1E90FF; font-weight: bold;">(Male)</span>')
                .replace(/\(Female\)/g, '<span style="color: #DC143C; font-weight: bold;">(Female)</span>')
                .replace(/\(Both\)/g, '<span style="color: #8B4513; font-weight: bold;">(Both)</span>');
        }
        
        contentElement.innerHTML = formattedContent;
    } else {
        contentElement.textContent = originalContent;
    }
    
    // Replace edit container with original content
    const editContainer = document.querySelector('.editable-section');
    editContainer.replaceWith(contentElement);
    
    // Clear stored original content
    delete editOriginalContent[sectionType];
}

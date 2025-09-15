// Configuration
const API_URL = 'http://localhost:5678/webhook/health-chat';

// Global state
let chatState = {
    userEmail: '',
    conversation: [],
    questionCount: 0,
    isComplete: false,
    userId: '',
    isActive: false
};

// DOM Elements
const emailSection = document.getElementById('emailSection');
const chatSection = document.getElementById('chatSection');
const completionSection = document.getElementById('completionSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const emailInput = document.getElementById('emailInput');
const startChatBtn = document.getElementById('startChatBtn');
const emailError = document.getElementById('emailError');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const endChatBtn = document.getElementById('endChatBtn');
const chatError = document.getElementById('chatError');
const restartBtn = document.getElementById('restartBtn');

// Utility Functions
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    console.error('Error:', message);
}

function hideError(errorElement) {
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// UI Functions
function showSection(sectionToShow) {
    console.log('Showing section:', sectionToShow ? sectionToShow.id : 'null');
    
    // Hide all sections
    const sections = [emailSection, chatSection, completionSection];
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
        }
    });
    
    // Show the target section
    if (sectionToShow) {
        sectionToShow.style.display = 'flex';
        sectionToShow.style.visibility = 'visible';
        
        // Apply specific fixes based on section
        if (sectionToShow.id === 'chatSection') {
            setTimeout(() => {
                fixChatLayout();
            }, 100);
        }
        
        console.log('Section shown:', sectionToShow.id);
    }
}

function addMessage(role, content) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    messageDiv.innerHTML = `
        <div class="message-role">${role === 'user' ? 'You' : 'Health Consultant'}</div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function updateChatState(response) {
    chatState.conversation = response.conversation || [];
    chatState.questionCount = response.questionCount || 0;
    chatState.isComplete = response.isComplete || false;
    chatState.userId = response.userId || chatState.userId;
    
    // Save to localStorage
    saveChatState();
    
    console.log('Chat State Updated:', chatState);
}

function saveChatState() {
    try {
        localStorage.setItem('healthChatState', JSON.stringify(chatState));
    } catch (error) {
        console.error('Error saving chat state:', error);
    }
}

// Layout Fix Functions
function fixChatLayout() {
    const chatSection = document.querySelector('.chat-section');
    const chatContainer = document.querySelector('.chat-container');
    const chatMessages = document.querySelector('.chat-messages-modern');
    const chatApp = document.getElementById('chatApp');
    
    if (chatApp) {
        chatApp.style.height = '100vh';
        chatApp.style.overflow = 'hidden';
    }
    
    if (chatSection) {
        chatSection.style.height = 'calc(100vh - 70px)';
        chatSection.style.display = 'flex';
        chatSection.style.flexDirection = 'column';
        chatSection.style.overflow = 'hidden';
    }
    
    if (chatContainer) {
        chatContainer.style.height = '100%';
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
    }
    
    if (chatMessages) {
        chatMessages.style.flex = '1';
        chatMessages.style.overflowY = 'auto';
    }
    
    console.log('Chat layout fixed');
}

function preventBodyScroll() {
    const chatAppVisible = document.getElementById('chatApp').style.display !== 'none';
    
    if (chatAppVisible) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    } else {
        document.body.style.overflow = '';
        document.body.style.height = '';
    }
}

// API Functions
async function startConversation(email) {
    try {
        showLoading();
        hideError(emailError);
        
        const payload = { userEmail: email };
        console.log('Starting conversation with payload:', payload);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Start conversation response:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update chat state
        chatState.userEmail = email;
        chatState.isActive = true;
        updateChatState(data);
        
        // Show chat section
        showSection(chatSection);
        
        if (data.response) {
            addMessage('assistant', data.response);
        }
        
        // Focus on message input
        if (messageInput) {
            setTimeout(() => messageInput.focus(), 200);
        }
        
    } catch (error) {
        console.error('Start conversation error:', error);
        showError(emailError, `Failed to start conversation: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function sendMessage(message) {
    try {
        showLoading();
        hideError(chatError);
        
        // Add user message to UI
        addMessage('user', message);
        
        const payload = {
            userEmail: chatState.userEmail,
            message: message,
            conversation: chatState.conversation,
            questionCount: chatState.questionCount,
            isComplete: chatState.isComplete
        };
        
        console.log('Sending message with payload:', payload);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Handle completion response
        if (responseText.trim() === '=' || responseText.trim() === '') {
            console.log('Workflow completed successfully');
            showSection(completionSection);
            chatState.isActive = false;
            return;
        }
        
        // Parse JSON response
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Send message response:', data);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            showError(chatError, 'Invalid response format. Please try again.');
            return;
        }
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update chat state
        updateChatState(data);
        
        // Check completion status
        if (data.isComplete || data.status === 'consultation_complete') {
            console.log('Conversation marked complete');
            showSection(completionSection);
            chatState.isActive = false;
            return;
        }
        
        // Add AI response
        if (data.response) {
            addMessage('assistant', data.response);
            showSection(chatSection);
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        showError(chatError, `Failed to send message: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function endConversation() {
    if (!chatState.isActive) return;
    
    try {
        await sendMessage('end conversation');
    } catch (error) {
        console.error('End conversation error:', error);
        showError(chatError, `Failed to end conversation: ${error.message}`);
    }
}

// Navigation Functions
function updateNavBarForChatView() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Store original content
    if (!window.originalNavContent) {
        window.originalNavContent = navMenu.innerHTML;
    }
    
    // Replace with back button
    navMenu.innerHTML = `
        <a href="#" class="nav-link" id="navBackHome">← Back to Home</a>
    `;
    
    // Add click handler
    const backBtn = document.getElementById('navBackHome');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            backToLandingPage();
        });
    }
}

function restoreOriginalNavBar() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && window.originalNavContent) {
        navMenu.innerHTML = window.originalNavContent;
        attachNavEventListeners();
    }
}

function attachNavEventListeners() {
    const navGetStarted = document.getElementById('navGetStarted');
    if (navGetStarted) {
        navGetStarted.addEventListener('click', openChatFromLanding);
    }
}

function openChatFromLanding() {
    console.log('Opening chat app from landing page');
    
    const landingPage = document.getElementById('landingPage');
    const chatApp = document.getElementById('chatApp');
    
    if (landingPage && chatApp) {
        landingPage.style.display = 'none';
        chatApp.style.display = 'block';
        
        updateNavBarForChatView();
        showSection(emailSection);
        preventBodyScroll();
        
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
        
        updateConnectionStatus();
    }
}

function backToLandingPage() {
    console.log('Going back to landing page');
    
    const landingPage = document.getElementById('landingPage');
    const chatApp = document.getElementById('chatApp');
    
    if (landingPage && chatApp) {
        landingPage.style.display = 'block';
        chatApp.style.display = 'none';
        
        preventBodyScroll();
        restoreOriginalNavBar();
        
        // Reset chat state
        if (chatState.isActive) {
            resetChatState();
        }
    }
}

function resetChatState() {
    chatState = {
        userEmail: '',
        conversation: [],
        questionCount: 0,
        isComplete: false,
        userId: '',
        isActive: false
    };
    
    // Clear UI
    if (emailInput) emailInput.value = '';
    if (messageInput) messageInput.value = '';
    if (chatMessages) chatMessages.innerHTML = '';
    
    hideError(emailError);
    hideError(chatError);
    
    // Clear localStorage
    localStorage.removeItem('healthChatState');
}

function updateConnectionStatus() {
    const connectionStatus = document.getElementById('connectionStatus');
    const statusIndicator = connectionStatus?.querySelector('.status-indicator');
    const statusText = connectionStatus?.querySelector('span');
    
    if (statusIndicator && statusText) {
        statusText.textContent = 'Connected';
        statusIndicator.style.background = 'var(--success-color)';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Health Chat Frontend Initialized');
    
    // Clear any saved session
    localStorage.removeItem('healthChatState');
    
    // Show landing page initially
    const landingPage = document.getElementById('landingPage');
    const chatApp = document.getElementById('chatApp');
    
    if (landingPage && chatApp) {
        landingPage.style.display = 'block';
        chatApp.style.display = 'none';
    }
    
    hideLoading();
    
    // Email form submission
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput?.value.trim();
            if (!email) {
                showError(emailError, 'Please enter your email address');
                return;
            }
            if (!validateEmail(email)) {
                showError(emailError, 'Please enter a valid email address');
                return;
            }
            
            await startConversation(email);
        });
    }
    
    // Send message button
    if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
            const message = messageInput?.value.trim();
            if (!message || !chatState.isActive) return;
            
            messageInput.value = '';
            await sendMessage(message);
        });
    }
    
    // End chat button
    if (endChatBtn) {
        endChatBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to end the conversation?')) {
                await endConversation();
            }
        });
    }
    
    // Restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetChatState();
            showSection(emailSection);
            if (emailInput) emailInput.focus();
        });
    }
    
    // Enter key handlers
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('emailForm')?.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn?.click();
            }
        });
    }
    
    // Navigation elements
    const heroGetStarted = document.getElementById('heroGetStarted');
    const navGetStarted = document.getElementById('navGetStarted');
    const learnMore = document.getElementById('learnMore');
    const backToLanding = document.getElementById('backToLanding');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    if (heroGetStarted) {
        heroGetStarted.addEventListener('click', openChatFromLanding);
    }
    
    if (navGetStarted) {
        navGetStarted.addEventListener('click', openChatFromLanding);
    }
    
    if (learnMore) {
        learnMore.addEventListener('click', openChatFromLanding);
    }
    
    if (backToLanding) {
        backToLanding.addEventListener('click', backToLandingPage);
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', backToLandingPage);
    }
    
    // Hamburger menu
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-menu-active');
            navToggle.classList.toggle('nav-toggle-active');
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('nav-menu-active')) {
                navMenu.classList.remove('nav-menu-active');
                navToggle?.classList.remove('nav-toggle-active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Debug function
window.debugChatState = () => {
    console.log('Current Chat State:', chatState);
    return chatState;
};

console.log('Health Chat JavaScript loaded successfully');
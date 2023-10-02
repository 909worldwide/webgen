// Function to fetch quota information
// Function to fetch quota information
function fetchQuota(username, password) {
    return fetch('https://webgen.gay.xn--q9jyb4c/quota', {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error('Authentication failed');
        }
    })
    .then(data => {
        // Update progress bar
        const totalQuestions = 250;
        const questionsAnswered = data.questions_answered;
        const progress = (questionsAnswered / totalQuestions) * 100;
        
        const progressBar = document.getElementById('progressFill');
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${questionsAnswered}/${totalQuestions}`;
        
        // Update text elements
        document.getElementById('answered').textContent = questionsAnswered;
        document.getElementById('remaining').textContent = data.questions_remaining;
    })
    .catch(error => {
        console.error('Error fetching quota:', error);
    });
}

// When the popup is loaded, fetch the quota info
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve username and password from storage
    chrome.storage.sync.get(['username', 'password'], function(data) {
        const username = data.username;
        const password = data.password;
        
        if(username && password) {
            fetchQuota(username, password)
            .then(data => {
                document.getElementById('answered').textContent = data.questions_answered;
                document.getElementById('remaining').textContent = data.questions_remaining;
            })
            .catch(error => {
                console.error('Error fetching quota:', error);
            });
        }
    });
});

// Handle form submission for saving username and password
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Verify the username and password by fetching the quota
    fetchQuota(username, password)
    .then(data => {
        // Save to Chrome storage
        chrome.storage.sync.set({
            username: username,
            password: password
        }, function() {
            // Notify that we saved.
            console.log('Settings saved');
            alert('Settings saved successfully!');
        });
    })
    .catch(error => {
        console.error('Error verifying credentials:', error);
        alert('Authentication failed. Please check your username and password.');
    });
});

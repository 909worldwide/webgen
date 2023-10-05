// Create the 'Solve question' context menu
chrome.contextMenus.create({
  id: 'sendToAPI',
  title: 'Solve question',
  contexts: ['selection'],
});

// Create the 'Popup answer' context menu
chrome.contextMenus.create({
  id: 'popupAnswer',
  title: 'Popup answer',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'sendToAPI' || info.menuItemId === 'popupAnswer') {
    const selectedText = info.selectionText;
    chrome.storage.sync.get(['username', 'password'], function (data) {
      const username = data.username;
      const password = data.password;
      fetch('https://webgen.gay.xn--q9jyb4c/answer', {
        method: 'POST',
        headers: new Headers({
          Authorization: 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ question: selectedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            // Handle error messages here as per your requirement
            alert('Error: ' + data.error);
          } else {
            // Update questions count in storage
            chrome.storage.sync.set({
              questions_remaining: 250 - data.questions_answered,
              questions_answered: data.questions_answered,
            });

            if (info.menuItemId === 'sendToAPI') {
              // Replace the selected text with the answer
              chrome.tabs.executeScript({
                code: `
                  document.getSelection().getRangeAt(0).deleteContents();
                  document.getSelection().getRangeAt(0).insertNode(document.createTextNode("${data.answer}"));
                `,
              });
            } else if (info.menuItemId === 'popupAnswer') {
              // Create a popup with the answer
              alert(data.answer); // simple alert-based popup
              // you might want to create a more sophisticated popup depending on your needs
            }
          }
        })
        .catch((err) => {
          alert('Error: ' + err);
        });
    });
  }
});

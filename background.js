// Create a context menu
chrome.contextMenus.create({
    id: 'sendToAPI',
    title: 'Solve question',
    contexts: ['selection'],
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'sendToAPI') {
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
              if (data.error === 'ERR_ANSWER_REFUSED') {
                alert('Your question either could not be solved or has ethical concerns.');
              } else if (data.error === 'Question limit reached for this account') {
                alert('Question limit reached for this account. Please contact el1a.');
              }
            } else {
              // Store remaining and asked questions
              chrome.storage.sync.set({
                questions_remaining: 250 - data.questions_answered,
                questions_answered: data.questions_answered,
              });
  
              // Update the selected text with the answer
              chrome.tabs.executeScript(
                {
                  code: `
                    document.getSelection().getRangeAt(0).deleteContents();
                    document.getSelection().getRangeAt(0).insertNode(document.createTextNode("${data.answer}"));
                  `,
                },
                () => {}
              );
            }
          })
          .catch((err) => {
            alert('Error: ' + err);
          });
      });
    }
  });
  
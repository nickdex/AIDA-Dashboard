/* eslint-disable no-console */
self.addEventListener('push', event => {
  console.info('Push received');

  const payload = event.data.json();
  console.debug(payload);
  const options = {
    body: payload.body,
    icon: 'static/img/icons/android-chrome-192x192.png',
    actions: payload.actions
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', event => {
  console.debug('Inside Service worker');
  const action = event.action;
  console.info(`Action clicked: ${action}`);

  if (action !== undefined) {
    console.debug('Posting notification action using fetch api');

    fetch('http://localhost:3000/push/click', {
      method: 'POST',
      body: self.JSON.stringify({ action }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(response => {
        console.debug(`Response received: ${self.JSON.stringify(response)}`);

        if (response.ok) {
          console.info('Request to server successful');
        } else console.warn('Request to server Failed');
      })
      .catch(err => console.error(err));
  }
});

/* eslint-disable no-console */

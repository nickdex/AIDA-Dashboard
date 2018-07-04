self.addEventListener('push', event => {
  console.info('Push received');

  const payload = event.data.json();
  console.debug(payload);
  const options = {
    body: payload.body,
    icon: 'static/img/icons/android-chrome-192x192.png',
    actions: [{ action: 'yes', title: 'Yes' }, { action: 'no', title: 'No' }]
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

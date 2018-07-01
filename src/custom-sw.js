self.addEventListener('push', event => {
  console.info('Push received');
  event.waitUntil(
    self.registration.showNotification('Yo man', { data: 'Data' })
  );
});

importScripts(
  'https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js',
)

importScripts(
  'https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js',
)

firebase.initializeApp({
  apiKey:
    'AIzaSyD-_RMtvr4Fxgwu46B2A9TNj4JHSWDOdVA',
  authDomain:
    'adat-jisrael-app.firebaseapp.com',
  projectId:
    'adat-jisrael-app',
  storageBucket:
    'adat-jisrael-app.firebasestorage.app',
  messagingSenderId:
    '991999629869',
  appId:
    '1:991999629869:web:6c9254b9083063d69876a4',
})

firebase.messaging()

self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close()

    const targetUrl =
      event.notification?.data?.url ||
      '/'

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          for (
            const client
            of windowClients
          ) {
            if ('focus' in client) {
              if ('navigate' in client) {
                void client.navigate(
                  targetUrl,
                )
              }

              return client.focus()
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(
              targetUrl,
            )
          }

          return undefined
        }),
    )
  },
)

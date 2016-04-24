if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker-demo/service-worker.js')
        .then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration);
        })
        .catch(function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

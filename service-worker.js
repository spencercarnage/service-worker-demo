var CACHE_NAME = 'my-site-cache-v1';

var urlsToCache = [
    '/service-worker-demo/scripts/app.js',
    '/service-worker-demo/stylesheets/github-light.css'
];

console.log('here');

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('opened cache');

        return cache.addAll(urlsToCache);
    }));
});

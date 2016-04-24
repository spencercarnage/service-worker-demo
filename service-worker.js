var CACHE_NAME = 'my-site-cache-v1';

var urlsToCache = [
    '/',
    '/scripts/app.js',
    '/stylesheets/github-light.css'
];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('opened cache');

        return cache.addAll(urlsToCache);
    }));
});

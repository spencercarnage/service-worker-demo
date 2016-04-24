var CACHE_NAME = 'my-site-cache-v1';
var VERSION = 'v1::';

function updateStaticCache () {
    return caches.open(VERSION + CACHE_NAME)
        .then(function (cache) {
            return cache.addAll([
                '/service-worker-demo/',
                '/service-worker-demo/stylesheets/github-light.css',
                '/service-worker-demo/scripts/app.js'
            ]);
        });
}

self.addEventListener('install', function (event) {
    event.waitUntil(updateStaticCache());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(cache.keys().then(function (keys) {
        // Remove caches whose name is no longer valid
        return Promise.all(
            keys.filter(function (key) {
                console.log('filter', key);
                return key.indexOf(VERSION) !== 0;
            }).map(function (key) {
                return caches.delete(key);
            })
        );
    }));
});

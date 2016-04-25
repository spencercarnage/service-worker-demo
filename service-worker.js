var CACHE_NAME = 'site-cache';
var VERSION = 'v1.2.0';

function updateStaticCache () {
    return caches.open(VERSION + CACHE_NAME)
        .then(function (cache) {
            return cache.addAll([
                '/service-worker-demo/index.html',
                '/service-worker-demo/offline.html',
                '/service-worker-demo/stylesheets/github-light.css',
                '/service-worker-demo/stylesheets/normalize.css',
                '/service-worker-demo/stylesheets/stylesheet.css',
                '/service-worker-demo/scripts/app.js'
            ]);
        });
}

var offlineImage = 
`<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <title id="offline-title">Offline</title>
    <g fill="none" fill-rule="evenodd">
            <path fill="#D8D8D8" d="M0 0h400v300H0z"/>
            <text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold">
                <tspan x="93" y="172">offline</tspan>
            </text>
    </g>
</svg>`;

self.addEventListener('install', function (event) {
    event.waitUntil(updateStaticCache());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                // Remove caches whose name is no longer valid
                return Promise.all(keys
                    .filter(function (key) {
                        return key.indexOf(VERSION) !== 0;
                    }).map(function (key) {
                        console.log('delete ', key);
                        return caches.delete(key);
                    })
                );
            })
    );
});

self.addEventListener('fetch', function (event) {
    var request = event.request;

    // Always fetch non-GET requests from the network
    if (request.method !== 'GET') {
        event.respondWith(
            fetch(request)
                .catch(function () {
                    return caches.match('/service-worker-demo/offline.html');
                })
        );

        console.log('non GET request', request);
        return;
    }

    // For HTML requests, try the network first, fall back to the cache, finally the offline page
    if (request.headers.get('Accept').indexOf('text/html') !== -1) {
        // Fix for Chrome bug: https://code.google.com/p/chromium/issues/detail?id=573937
        if (request.mode !== 'navigate') {
            request = new Request(request.url, {
                method: 'GET',
                headers: request.headers,
                mode: request.mode,
                credentials: request.credentials,
                redirect: request.redirect
            });
        }

        event.respondWith(
            fetch(request)
                .then(function (response) {
                    // Stash a copy of this page in the cache
                    var copy = response.clone();

                    caches.open(VERSION + CACHE_NAME)
                        .then(function (cache) {
                            cache.put(request, copy);
                        });

                    console.log('response', response);

                    return response;
                })
                .catch(function () {
                    console.log('catch 1');

                    return caches.match(request)
                        .then(function (response) {
                            return response || caches.match('/service-worker-demo/offline.html');
                        });
                })
        );

        console.log('request 2', request);

        return;
    }

    // For non-HTML requests, look in the cache first, fall back to the network
    event.respondWith(
        caches.match(request)
            .then(function (response) {
                console.log('non html', response);

                return response || fetch(response)
                    .catch(function () {
                        console.log(request, response);

                        // If the request is an image, show an offline placeholder
                        if (request.headers.get('Accept').indexOf('image') !== -1) {
                            return new Response(offlineImage, {
                                headers: {
                                    'Content-Type': 'image/svg+xml'
                                }
                            });
                        }
                    });
            })
    );

});

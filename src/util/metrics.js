const client = require('prom-client');

const Metrics = {
    init: (serviceName) => {
        Metrics.registry = new client.Registry();
        Metrics.registry.setDefaultLabels({
            app: serviceName
        })
        client.collectDefaultMetrics({ register: Metrics.registry })
        
        // Welcome to any suggestions on improving 
        Metrics.httpRequestDurationMicroseconds = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in microseconds',
            labelNames: ['method', 'route', 'code'],
            buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
          })
        Metrics.registry.registerMetric(Metrics.httpRequestDurationMicroseconds)
    },
    registry: null,
    httpRequestDurationMicroseconds: null,
    client,
}





module.exports = Metrics;

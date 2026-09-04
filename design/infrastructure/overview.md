# Infrastructure

The only required infrastructure is a static HTTPS host with SPA fallback to `index.html`. No compute service, database, private network, identity provider, certificate code, or infrastructure-as-code project is needed for v1. Cache hashed JavaScript and CSS assets immutably; serve `index.html` with a short cache lifetime.

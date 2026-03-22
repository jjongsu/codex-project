# Supabase Server Layer

- create the server-only client here
- keep secret keys out of client bundles
- let route handlers call this layer instead of talking to Supabase directly
- use `SUPABASE_SECRET_KEY` only on the server

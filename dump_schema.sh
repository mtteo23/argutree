#! /bin/bash
pg_dump   --schema-only   --no-owner   --no-privileges   --host=db.htbxgsolhsxacotnprjq.supabase.co   --port=5432   --username=postgres   --dbname=postgres   > supabase_schema.sql

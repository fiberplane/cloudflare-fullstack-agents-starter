#!/bin/bash

# utility script to push secrets from a file to the correct environment
# can delete if you have CI set up

env_flag=""
env_display="production"
if [[ "$1" == .preview* ]]; then
  env_flag="--env preview"
  env_display="preview"
elif [[ -n "$CLOUDFLARE_ENV" ]]; then
  env_flag="--env $CLOUDFLARE_ENV"
  env_display="$CLOUDFLARE_ENV"
fi

read -p "Push secrets from $1 to $env_display? (y/n) " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 0

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  echo "$value" | bun wrangler secret $env_flag put "$key"
done < "$1"

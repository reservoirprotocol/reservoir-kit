#!/bin/bash

paths=(
    "./packages/*/dist"
    ".parcel-cache"
)

for path in "${paths[@]}"; do
    for resolved in $path; do
        if [[ -e "$resolved" ]]; then
            echo "Removing $resolved..."
            rm -rf "$resolved"
        else
            echo "$resolved does not exist. Skipping..."
        fi
    done
done

echo "Cleanup complete."

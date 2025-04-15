#!/bin/bash

# Temukan semua file .js di folder dist
find dist -type f -name '*.js' | while read -r file; do
  # Replace semua import tanpa ekstensi ke .js
  sed -i '' -E "s/(from ['\"])(\..*)(['\"])/\1\2.js\3/g" "$file"
done
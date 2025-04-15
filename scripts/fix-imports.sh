#!/bin/bash

# Temukan semua file .js di folder dist
# find dist -type f -name '*.js' | while read -r file; do
find dist -type f -name '*.js' -exec sed -i 's/from "\(.*\)";/from "\1.js";/g' {} +
  # Replace semua import tanpa ekstensi ke .js
  sed -i '' -E "s/(from ['\"])(\..*)(['\"])/\1\2.js\3/g" "$file"
done
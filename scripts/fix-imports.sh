#!/bin/bash

# Untuk Linux/GNU sed
find dist -type f -name '*.js' -exec sed -i 's/from \(["'\'']\)\(\.\/.*\)\1/from \1\2.js\1/g' {} +
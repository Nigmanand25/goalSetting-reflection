#!/bin/bash

# Script to update import paths to use new organized structure
cd "$(dirname "$0")/.."

echo "Updating import paths to use new organized structure..."

# Update relative imports to use @ aliases
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Processing: $file"
  
  # Replace relative imports with @ aliases
  sed -i '' "s|from '../../types'|from '@/types'|g" "$file"
  sed -i '' "s|from '../types'|from '@/types'|g" "$file"
  sed -i '' "s|from './types'|from '@/types'|g" "$file"
  
  sed -i '' "s|from '../../services|from '@/services|g" "$file"
  sed -i '' "s|from '../services|from '@/services|g" "$file"
  
  sed -i '' "s|from '../../utils|from '@/utils|g" "$file"
  sed -i '' "s|from '../utils|from '@/utils|g" "$file"
  
  sed -i '' "s|from '../../contexts|from '@/contexts|g" "$file"
  sed -i '' "s|from '../contexts|from '@/contexts|g" "$file"
  
  sed -i '' "s|from '../../lib|from '@/lib|g" "$file"
  sed -i '' "s|from '../lib|from '@/lib|g" "$file"
  
  sed -i '' "s|from '../../constants|from '@/constants|g" "$file"
  sed -i '' "s|from '../constants|from '@/constants|g" "$file"
done

echo "Import path updates completed!"

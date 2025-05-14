#!/bin/sh
if [ "$NODE_ENV" = "production" ]; then
  npm run build
  npm start
else
  npm run start:dev
fi
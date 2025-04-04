#! /bin/bash 
cp index.html 404.html
git add .
git commit -m "$1"
git push origin main

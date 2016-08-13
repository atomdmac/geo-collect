@echo off
rem Watchify (for faster, automatic builds)
watchify ./js/index.js -o ./js/bundle.js --exclude jquery --verbose
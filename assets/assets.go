package assets

import "embed"

//go:embed index.html favicon.ico css/* js/* images/*
var Assets embed.FS

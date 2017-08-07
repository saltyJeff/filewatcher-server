# filewatcher-server
A simple server that broadcasts any changes made to files in a directory as an [Event Source](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
# Install
`npm install -g saltyJeff/filewatcher-server`
# Run
You can do a basic run with default settings with

`fwserve`

It will watch all files in the current directory on port 8081, using the "word" mode of diffing, and using the "memory" scheme (check below for explanations)

You can also run it with `fwserve -c <your config location>` where you pass the location of a config.json. The schema for
the config is in this directory as configschema.json as a [JSON-Schema](http://json-schema.org/).
# Config:
## JSON schema description
```json
 {
	"port": "<the port number to listen on>",
	"watchDir": "<the directory to watch (will default to cwd)>",
	"watchMode": "<the scheme to watch the directory with (see below for schemes)>",
	"diffModes": "<a JSON object where the keys are the names of files, and the values are which diff algorithim to use (diff by 'word', 'line', 'sentence', or as 'json')>"
 }
```
## Watch Mode Schemes
### memory
No disk IO takes place except on server start and watch, the entire file is buffered to memory,
and writes are made by POSTing to `<server root>/<filename.ext>` with the full text in the POST body
### watch
The server watches the directory and automatically sends changes when the file is written to,
Attempting to POST to the server ends in an 403 error
# For clients
## EventSource events
### initial
the initial text of the file
### change
a delta (set of changes) to make to the file.
It is recommended you use JSON.parse to turn the message into a patch array, and use the 
[JSDiff](https://github.com/kpdecker/jsdiff) library to patch it into the local copy
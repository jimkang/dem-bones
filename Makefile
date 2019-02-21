include config.mk

HOMEDIR = $(shell pwd)
BROWSERIFY = ./node_modules/.bin/browserify
UGLIFY = ./node_modules/.bin/uglifyjs
TRANSFORM_SWITCH = -t [ babelify --presets [ es2015 ] ]

pushall: sync
	git push origin master

run:
	wzrd app.js:index.js -- \
		-d \
		$(TRANSFORM_SWITCH)

build:
	$(BROWSERIFY) $(TRANSFORM_SWITCH) app.js | $(UGLIFY) -c -m -o index.js

prettier:
	prettier --single-quote --write "**/*.js"

sync:
	rsync -a $(HOMEDIR)/ $(USER)@$(SERVER):$(APPDIR) --exclude node_modules/ \
		--omit-dir-times --no-perms


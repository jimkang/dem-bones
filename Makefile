include config.mk

HOMEDIR = $(shell pwd)
BROWSERIFY = ./node_modules/.bin/browserify
UGLIFY = ./node_modules/.bin/uglifyjs
PLUGIN_SWITCH = -p [tsify]

pushall: sync
	git push origin master

run:
	wzrd app.js:index.js -- \
		-d \
		$(PLUGIN_SWITCH) 
		$(TRANSFORM_SWITCH)

build:
	$(BROWSERIFY) $(PLUGIN_SWITCH) app.js | $(UGLIFY) -c -m -o index.js

prettier:
	prettier --single-quote --write "**/*.js"
	prettier --single-quote --write "**/*.ts"

sync:
	rsync -a $(HOMEDIR)/ $(USER)@$(SERVER):$(APPDIR) --exclude node_modules/ \
		--omit-dir-times --no-perms


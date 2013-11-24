
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

lint:
	@jshint *.json *.js

clean:
	rm -fr build components template.js

example: example/ace build
	@xdg-open example/index.html

example/ace:
	@mkdir -p tmp-ace;\
		cd tmp-ace;\
	    wget https://github.com/ajaxorg/ace-builds/archive/master.zip;\
	    unzip master.zip;\
	    mv ace-builds-master/src-noconflict ../example/ace;\
	    cd ..;\
	    rm -rf tmp-ace

test:
	@mocha -R spec test

.PHONY: clean test lint


build: components index.js index.css template.js
	@component build --dev

index.css: index.styl
	@stylus < index.styl > index.css

template.js: template.html
	@component convert $<

components: component.json
	@component install --dev

lint:
	@jshint *.json *.js

clean:
	rm -fr build components template.js

.PHONY: clean

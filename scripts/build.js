const build = require('./main')

var clean = false

if(process.argv.length === 3){
	clean = process.argv[2] === 'clean'
}

build(clean)
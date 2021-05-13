
import build from './script'

var clean = false

// process.on('unhandledRejection', (error: any, p) => {
//     console.log('Unhandled Rejection at: Promise', p, 'reason:', error);
//     console.log(error.stack);
// });

process.on('unhandledRejection', r => console.log(r));

if (process.argv.length === 3) {
    clean = process.argv[2] === 'clean'
}

build(clean)
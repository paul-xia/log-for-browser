const gulp = require('gulp')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const minimatch = require('minimatch')
const uglify = require('gulp-uglify')
const pump = require('pump')

gulp.task('compress', next=>{
    pump([
        gulp.src('./log.js'),
        babel({
            presets: ['env']
        }),
        uglify(),
        rename(filePath=>{
            console.log(filePath)
            filePath.basename = 'log.min'
        }),
        gulp.dest('dist'),
        
    ], next)
})

gulp.task('watch', ()=>{
    gulp.watch('./log.js').on('change', event=>{
        gulp.start('compress')
    })
})

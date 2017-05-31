const gulp = require("gulp");

gulp.task('copy', function () {
    return gulp.src(["src/**/*.less", "src/**/*.md"]).pipe(gulp.dest("lib"))
});

gulp.task("build", ['copy'], function () {
    const ts = require("gulp-typescript");
    const tsProject = ts.createProject('tsconfig.json');
    return gulp.src(["src/**/*.ts", "src/**/*.tsx"])
        .pipe(tsProject()).js.pipe(gulp.dest("lib"))
});

gulp.task("tslint", () => {
    const tslint = require("gulp-tslint");
    gulp.src(["src/**/*.ts", "src/**/*.tsx"])
        .pipe(tslint({
            formatter: "verbose",
            configuration: "tslint.json"
        }))
        .pipe(tslint.report())
});

gulp.task('rename', function () {
    const rename = require("gulp-rename");
    gulp.src(["components/**/*"])
        .pipe(rename(function (path) {
            if (path.basename.includes('index.web')) {
                path.basename = "index";
            }
        }))
        .pipe(gulp.dest("_components"));
});
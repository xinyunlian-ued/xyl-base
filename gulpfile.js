const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject('tsconfig.json');

gulp.task("build", function () {
    const tsResult = gulp.src(["src/**/*.ts", "src/**/*.tsx"])
        .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest("lib"));
});

const tslint = require("gulp-tslint");

gulp.task("tslint", () =>
    gulp.src(["src/**/*.ts", "src/**/*.tsx"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

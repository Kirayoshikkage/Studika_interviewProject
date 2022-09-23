import gulp from 'gulp';
import { deleteAsync } from "del"
import browserSync from 'browser-sync';
import gulpIf from 'gulp-if';
import htmlMin from 'gulp-htmlmin';
import typograf from 'gulp-typograf';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCss from 'gulp-clean-css';
import autoPrefixer from 'gulp-autoprefixer';
import GulpSvgmin from 'gulp-svgmin';
import gulpCheerio from 'gulp-cheerio';
import replace from 'gulp-replace';
import svgSprite from 'gulp-svg-sprite';
import webpack from 'webpack-stream';
import vinyl from 'vinyl-named'
import converterToWebp from 'gulp-webp';
import versionNumber from 'gulp-version-number';
import rename from 'gulp-rename';
import newer from 'gulp-newer';
import include from 'gulp-include';
import vinylNamedWithPath from 'vinyl-named-with-path';


const buildFolder = './build';
const srcFolder = './src';
const path = {
  build: {
    img: `${buildFolder}/img/`,
    resources: `${buildFolder}/resources/`,
    styles: `${buildFolder}/styles/`,
    pages: `${buildFolder}/`,
    scripts: `${buildFolder}/scripts/`,
  },
  src: {
    img: `${srcFolder}/img/pictures/**/*.{jpg,jpeg,png,webp,svg}`,
    svg: `${srcFolder}/img/svg/*.svg`,
    resources: `${srcFolder}/resources/**/*.*`,
    styles: `${srcFolder}/styles/pages/**/*.scss`,
    pages: `${srcFolder}/pages/*.html`,
    scripts: `${srcFolder}/scripts/pages/*.js`,
  },
  watch: {
    img: `${srcFolder}/img/pictures/**/*.{jpg,jpeg,png,gif,webp,svg}`,
    svg: `${srcFolder}/img/svg/*.svg`,
    styles: `${srcFolder}/styles/**/*.scss`,
    pages: `${srcFolder}/pages/*.html`,
    scripts: `${srcFolder}/scripts/**/*.js`,
  },
}
const sass = gulpSass(dartSass);;
let isBuild = process.argv.includes('--build');
let isDev = !isBuild;

const clean = (folder) => {
  return deleteAsync(folder)
}

const pages = () => {
  return gulp.src(path.src.pages)
    .pipe(gulpIf(isBuild, typograf({
      locale: ['ru', 'en-US']
    })))
    .pipe(gulpIf(isBuild, htmlMin({
      collapseWhitespace: true
    })))
    .pipe(gulpIf(isBuild, versionNumber({
      "value": '%DT%',
      "append": {
        "key": "_v",
        "cover": '0',
        "to": [
          "css",
          "js",
        ]
      },
    })))
    .pipe(gulp.dest(path.build.pages))
    .pipe(browserSync.stream());
}

const styles = () => {
  return gulp.src(path.src.styles)
    .pipe(sass())
    .pipe(gulpIf(isBuild, autoPrefixer({
      cascade: false
    })))
    .pipe(gulpIf(isBuild, cleanCss({
      level: 2
    })))
    .pipe(gulp.dest(path.build.styles))
    .pipe(browserSync.stream());
}

const scripts = () => {
  return gulp.src(path.src.scripts)
    .pipe(vinyl())
    .pipe(webpack({
      mode: isBuild ? 'production' : 'development',
      output: {
        filename: '[name].js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }]
      },
      devtool: isDev ? 'source-map' : false
    }))
    .pipe(gulp.dest(path.build.scripts))
    .pipe(browserSync.stream());
}

const resources = () => {
  return gulp.src(path.src.resources)
    .pipe(gulp.dest(path.build.resources))
}

const createsSvgSprite = () => {
  return gulp.src(path.src.svg)
    .pipe(gulpIf(isBuild, GulpSvgmin({
      js2svg: {
        pretty: true,
      },
    })))
    .pipe(
      gulpCheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true
        },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
        }
      },
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}

const img = () => {
  return gulp.src(path.src.img)
    .pipe(newer(path.build.img))
    .pipe(converterToWebp())
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}

const watcher = () => {
  gulp.watch(path.watch.pages, pages)
  gulp.watch(path.watch.styles, styles)
  gulp.watch(path.watch.svg, createsSvgSprite)
  gulp.watch(path.watch.scripts, scripts)
  gulp.watch(path.watch.img, img)
}

const server = (folder) => {
  browserSync.init({
    server: {
      baseDir: folder
    },
    notify: false,
    port: 8080,
    browser: 'firefox',
    open: false
  })
}

const dev = gulp.series(
  clean.bind(this, buildFolder),
  gulp.parallel(pages, styles, scripts, resources, createsSvgSprite, img),
  gulp.parallel(watcher, server.bind(this, `${path.build.pages}`))
)
const build = gulp.series(
  clean.bind(this, buildFolder),
  gulp.parallel(pages, styles, scripts, resources, createsSvgSprite, img)
)

gulp.task('default', dev);
gulp.task('build', build);

/**
 * 
 * Assembly for tests
 * 
 */

const testFolder = './tests';
const testPath = {
  html: `${srcFolder}/tests/**/*.html`,
  styles: `${srcFolder}/tests/**/*.scss`,
  scripts: `${srcFolder}/tests/**/*.js`,
}

const testHtml = () => {
  return gulp.src(testPath.html)
    .pipe(gulp.dest(testFolder))
    .pipe(include())
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest(testFolder))
    .pipe(browserSync.stream());
}

const testStyles = () => {
  return gulp.src(testPath.styles)
    .pipe(sass())
    .pipe(gulp.dest(testFolder))
}

const testScripts = () => {
  return gulp.src(testPath.scripts)
    .pipe(vinylNamedWithPath())
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: '[name].js',
      },
    }))
    .pipe(gulp.dest(testFolder))
}

const testMainTasks = gulp.series(
  testStyles, testScripts, testHtml, clean.bind(this, [`${testFolder}/**/`, `!${testFolder}/*.html`]),
)

const testWatcher = () => {
  gulp.watch(`${srcFolder}/**/*.*`, testMainTasks)
}

const test = gulp.series(
  clean.bind(this, testFolder),
  testMainTasks,
  gulp.parallel(testWatcher, server.bind(this, testFolder))
)

gulp.task('test', test);
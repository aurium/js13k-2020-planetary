#!/bin/bash -e

COPY_ONLY=false
NO_DEBUG=false

while (echo "$1" | egrep -q '^--(copy|no-debug)$'); do
  test "$1" = "--copy" && COPY_ONLY=true
  test "$1" = "--no-debug" && NO_DEBUG=true
  shift
done

$COPY_ONLY && echo '>> Copy mode. It will be bigger.'
$NO_DEBUG && echo '>> No-Debug mode. Not test friendly.'

test -e public && rm -r public
mkdir public

if $COPY_ONLY; then

  cp -r src/* public/

else

  function js_compress() {
    ( $NO_DEBUG && sed -r 's#(const|var|let) DEBUG_MODE#//#g' || cat ) |
    ( $NO_DEBUG && sed -r 's#(window.)?DEBUG_MODE#false#g' || cat ) |
    ( $NO_DEBUG && sed -r 's#function debug\(#function neverUsedFunc(#g' || cat ) |
    ( $NO_DEBUG && sed -r 's#debug\(#void(#g' || cat ) |
    sed -r 's#"use strict"##' |
    sed -r 's#\b(const|var)\b#let#g' |
    terser --compress --mangle |
    ( $NO_DEBUG && cat || sed -r 's/\b(function |const |var |let |if\()/\n\1/g' )
  }

  function crush() {
    node -e "
      crush = require('./crush');
      src = '';
      process.stdin.on('data', (chunk)=> src += chunk.toString() );
      process.stdin.on('end', ()=> process.stdout.write(crush(src)+\"$1\") );
    "
  }

  index_step1=$(mktemp)
  if $NO_DEBUG; then
    grep -vi 'debug' src/index.html > $index_step1
  else
    cat src/index.html > $index_step1
  fi
  echo $(grep -v 'clientJS' $index_step1) > public/index.html
  rm $index_step1

  sed -ri '
    s#</body>#<script src="client.js"></script></body>#;
    s#\s*/>#/>#g;
    s#>\s*<#><#g;
  ' public/index.html
  sed -ri 's#<!DOCTYPE html>#<!DOCTYPE html>\n#' public/index.html

  STYLE="$(
  echo -n $(sed -r '
    s/\*/ASTERISK/g;
    s/([-a-z0-9])\s+([-#.a-z0-9])/\1|\2/g;
    s/([-a-z0-9])\s+([-#.a-z0-9])/\1|\2/g;
  ' src/style.css) |
  sed -r '
    s/ASTERISK/*/g;
    s/\s+//g;
    s/\|/ /g;
    s/;\}/}/g;
  ')"

  sed -ri "s|<link .*href=\"style.css\">|<style>$STYLE</style>|" public/index.html

  echo "(()=>{ $(cat src/server.js) })()" |
  sed -r 's/log\(/void\(/g' |
  js_compress > public/server.js

  echo "(()=>{ $(cat src/ww.js) })()" |
  js_compress > public/ww.js

  echo "(()=>{$(
    grep 'clientJS' src/index.html    |
    sed -r 's#.*src="(.*)".*#src/\1#' |
    xargs cat
  )})()" | js_compress > public/client.js

  cp src/shared.js public/shared.js

fi

if [ "$1" = "start" ]; then
  sync
  exec npm start
else
  echo Done.
fi

#!/bin/sh


for f in ./tools/obfuscators/defendjs/configurations/*.sh; do 
  bash "$f" -H 
done
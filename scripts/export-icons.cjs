const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
(async () => {
  const root = path.resolve(__dirname,'..');
  for (const size of [16,32,48,128]) await sharp(path.join(root,'assets/mark.png')).resize(size,size,{fit:'contain'}).png().toFile(path.join(root,'icons/icon-'+size+'.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
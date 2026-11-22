// IndexNow key file (Bing, Yandex, Seznam, Naver). https://www.indexnow.org
import {writeFile} from 'node:fs/promises';
const KEY='54f4235983673f3596a344a87cd91396';
await writeFile(`public/${KEY}.txt`,KEY);
console.log('indexnow.mjs: key file written');

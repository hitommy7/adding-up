'use strict';
const fs = require('fs'); 
const readline = require('readline'); // ファイルを一行ずつ読み込むためのモジュール
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map();

// rl オブジェクトで line というイベントが発生したらこの無名関数を呼び出す
rl.on('line', (lineString) => {
  // lineString = 読み込んだ1行の文字列
  const columns = lineString.split(','); // カンマで分割して配列化
  const year = parseInt(columns[0]);
  const prefecture = columns[2];
  const popu = parseInt(columns[7]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture); // key: 都道府県 value: 集計データのオブジェクト
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 += popu;
    }
    if (year === 2015) {
      value.popu15 += popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
rl.resume(); // ストリームに情報を流し始める処理
rl.on('close', () => { // 全ての行を読み込み終わった際に呼び出されるイベント
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => { // 連想配列を普通の配列に変換
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map(([key, value]) => {
    return key + ':' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
  });
  console.log(rankingStrings);
});

// アプリケーション作成用のモジュールを読み込み
const electron = require('electron');
const fs = require('fs-extra');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const request = require('request');
const git = require('simple-git');
const datapath = require('./datapath');

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

// メインウィンドウ
let mainWindow;

function createWindow() {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({width: 800, height: 600,  'frame': false, 'fullscreen':true, webPreferences: {nodeIntegration: true}});

  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'update.html'),
    //pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Self Update
  await git("./").pull();

  // デベロッパーツールの起動
  //mainWindow.webContents.openDevTools();

  // メインウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  let oldJson = JSON.parse(fs.readFileSync(datapath["work"] + 'data.json', 'utf-8'));
  // アップデートの確認
  request('https://randomer.ch-random.net/launcher.json', async (error, response, body) => {
  //request('https://randomer.ch-random.net/test.json', async (error, response, body) => {
    try {
      if (error === null) {
        newJson = JSON.parse(body);
        for (let key in newJson) if (newJson[key].repository !== "") {
          if (oldJson[key]) { // アップデートチェック
            await git(datapath["work"] + key).pull();
          } else { // 新規DL
            if (isExistFile(datapath["work"] + key)) {
              fs.removeSync(datapath["work"] + key);
            }
            let gitUrl = 'https://github.com/' + newJson[key]['account'] + '/' + newJson[key]['repository'] + '.git';
            await git().clone(gitUrl, datapath["work"] + key);
          }
        }
        for (let key in oldJson) if (!newJson[key]) { // 削除済み
          fs.removeSync(datapath["work"] + key);
        }
        fs.writeFile(datapath["work"] + 'data.json', body, 'utf-8', (err) => {});
      }
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));
    } catch (e) {
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'error.html'),
        protocol: 'file:',
        slashes: true
      }));
      setTimeout(() => {
        mainWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file:',
          slashes: true
        }));
      }, 5000);
    }
  });
}

//  初期化が完了した時の処理
app.on('ready', createWindow);

// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', () => {
  // macOSのとき以外はアプリケーションを終了させます
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', () => {
  // メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});

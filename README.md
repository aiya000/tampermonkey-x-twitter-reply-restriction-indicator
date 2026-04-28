# X/Twitter Reply Restriction Indicator

X（旧Twitter）で投稿するとき、返信設定が「全員」になっていると警告してくれる Tampermonkey ユーザースクリプトです

## 何をするスクリプトか

ポストボタンの上に透明なオーバーレイを重ね、投稿前に返信設定を確認します

- 返信設定が **「全員が返信できます」** の場合 → アラートで警告して投稿をブロック
- 返信設定がそれ以外の場合 → そのまま投稿を通す

「全員に返信を許可したまま誤ってポストしてしまった」という事故を防ぐためのスクリプトです

## インストール

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) をインストールする
2. Tampermonkey のダッシュボードを開き、「新しいスクリプトを作成」を選ぶ
3. [`x-twitter-reply-restriction-indicator.js`](./x-twitter-reply-restriction-indicator.js) の内容をコピー＆ペーストして保存する

## 動作環境

- 対象URL: `https://x.com/*`
- Tampermonkey（Chrome / Firefox / Edge など主要ブラウザ対応）

## 仕組み

| 処理 | 内容 |
|------|------|
| ボタン検出 | 200ms ごとにポスト用テキストエリアとポストボタンを探す |
| オーバーレイ | ポストボタンの上に同じ見た目のオーバーレイを重ねる |
| 返信設定チェック | ページ内テキストに `全員が返信できます` / `Everyone can reply` が含まれるか確認 |
| クリック処理 | 設定が問題なければ React 互換のクリックイベントを本物のボタンに発火する |

## ライセンス

MIT

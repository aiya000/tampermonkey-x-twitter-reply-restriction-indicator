// ==UserScript==
// @name         X/Twitter Reply Restriction Indicator
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let overlay = null;
    let targetBtn = null;
    let lastUrl = location.href;

    // 🔥 React対応クリック
    function dispatchRealClick(el) {
        ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
    }

    function removeOverlay() {
        if (overlay) {
            overlay.remove();
            overlay = null;
            targetBtn = null;
        }
    }

    function updateOverlayPosition() {
        if (!overlay || !targetBtn) return;

        const rect = targetBtn.getBoundingClientRect();

        Object.assign(overlay.style, {
            top: rect.top + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px'
        });
    }

    function createOverlay(btn) {
        removeOverlay();
        targetBtn = btn;

        overlay = document.createElement('div');
        overlay.textContent = btn.innerText || 'Post';

        Object.assign(overlay.style, {
            position: 'fixed',
            background: 'rgba(29,155,240,1)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            fontWeight: 'bold',
            zIndex: 999999,
            cursor: 'pointer',
            pointerEvents: 'auto'
        });

        overlay.addEventListener('click', (e) => {
            e.stopPropagation();

            const bodyText = document.body.innerText;

            // ❌ NG
            if (
                bodyText.includes('全員が返信できます') ||
                bodyText.toLowerCase().includes('everyone can reply')
            ) {
                alert('⚠️ 返信設定が「全員」なのです！');
                return;
            }

            // ✅ OK → 本物クリック
            dispatchRealClick(targetBtn);
        });

        document.body.appendChild(overlay);
        updateOverlayPosition();
    }

    // ⭐ モバイル対応：投稿画面検出
    function findPostButton() {
        // 投稿テキストエリアがあるか
        const composer =
            document.querySelector('[data-testid="tweetTextarea_0"]') ||
            document.querySelector('[aria-label="ポストテキスト"]');

        if (!composer) return null;

        const buttons = document.querySelectorAll('[role="button"]');

        for (const btn of buttons) {
            const text = btn.innerText || btn.getAttribute('aria-label') || '';

            if (
                text.includes('ポスト') ||
                text.toLowerCase() === 'post'
            ) {
                return btn;
            }
        }

        return null;
    }

    // 🔁 メインループ
    setInterval(() => {

        // URL変化で消す
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            removeOverlay();
        }

        const btn = findPostButton();

        if (!btn) {
            removeOverlay();
            return;
        }

        if (btn !== targetBtn) {
            createOverlay(btn);
        }

        updateOverlayPosition();

    }, 200);

})();

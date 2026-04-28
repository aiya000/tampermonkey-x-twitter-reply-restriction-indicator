// ==UserScript==
// @name         X/Twitter - Reply Restriction Indicator
// @namespace    https://github.com/aiya000/
// @version      0.3.0
// @description  Warns when reply settings are set to "everyone" before posting on https://x.com
// @author       aiya000
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    let overlay = null;
    let targetBtn = null;
    let lastUrl = location.href;
    let intervalId = null;
    let menuCommandId = null;

    function isEnabled() {
        return GM_getValue('enabled', true);
    }

    function isEveryoneCanReply() {
        // PC: 返信制限ボタンの aria-label で判定
        if (
            document.querySelector('[aria-label="全員が返信できます"]') ||
            document.querySelector('[aria-label="Everyone can reply"]')
        ) {
            return true;
        }
        // スマホ fallback: body 全体テキスト
        const bodyText = document.body.innerText;
        return (
            bodyText.includes('全員が返信できます') ||
            bodyText.toLowerCase().includes('everyone can reply')
        );
    }

    function dispatchRealClick(el) {
        const view = el.ownerDocument.defaultView;
        ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view
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

            if (isEveryoneCanReply()) {
                alert('⚠️ 返信設定が「全員」になっています');
                return;
            }

            dispatchRealClick(targetBtn);
        });

        document.body.appendChild(overlay);
        updateOverlayPosition();
    }

    function findPostButton() {
        const composer =
            document.querySelector('[data-testid="tweetTextarea_0"]') ||
            document.querySelector('[aria-label="ポストテキスト"]');

        if (!composer) return null;

        // PC: data-testid で直接取得
        const directBtn =
            document.querySelector('[data-testid="tweetButton"]') ||
            document.querySelector('[data-testid="tweetButtonInline"]');
        if (directBtn) return directBtn;

        // スマホ fallback: テキストで検索
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

    function startLoop() {
        if (intervalId) return;

        intervalId = setInterval(() => {
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
    }

    function stopLoop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        removeOverlay();
    }

    function registerMenu() {
        if (menuCommandId !== null) {
            GM_unregisterMenuCommand(menuCommandId);
        }

        const enabled = isEnabled();
        const label = enabled
            ? '返信制限チェック: 有効（クリックで無効）'
            : '返信制限チェック: 無効（クリックで有効）';

        menuCommandId = GM_registerMenuCommand(label, () => {
            const newEnabled = !isEnabled();
            GM_setValue('enabled', newEnabled);

            if (newEnabled) {
                startLoop();
            } else {
                stopLoop();
            }

            registerMenu();
        });
    }

    registerMenu();

    if (isEnabled()) {
        startLoop();
    }

})();

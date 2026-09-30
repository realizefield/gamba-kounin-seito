/* ============================================================
 * GAMBA AI質問ウィジェット（全科目共通）
 * ------------------------------------------------------------
 * 使い方：各ページの </body> の直前に、次の1行を入れるだけです。
 *
 *   <script src="https://realizefield.github.io/gamba-kounin-seito/gamba-ai.js" defer></script>
 *
 * ・ページ右下に「わからないときは」ボタンが出ます
 * ・スタイルはShadow DOMの中に閉じているので、ページの見た目を壊しません
 * ・文言や設定を直すときは、このファイル1つを直せば全ページに反映されます
 *
 * 2026-09-03 作成
 * ============================================================ */
(function () {
  'use strict';

  if (window.__GAMBA_AI__) return;   // 二重読み込み防止
  window.__GAMBA_AI__ = true;

  // ---------- 体験版の利用者かどうか ----------
  // 体験版の入口ページを開いたブラウザには、目印（gamba_demo_start）が残っています。
  //  ・目印があり、体験の合言葉（gamba_demo_token）もある → AI質問を「合計5回まで」使えます
  //  ・目印だけある（合言葉がない）                      → AI質問は使えず、本科の案内を出します
  // 本科の生徒さんのブラウザでは、生徒版の入口ページ（gamba-kounin-seito.html）を開くと目印が消えます。
  var DEMO = false, TOKEN = '';
  try {
    DEMO = !!parseInt(localStorage.getItem('gamba_demo_start'), 10);
    TOKEN = DEMO ? (localStorage.getItem('gamba_demo_token') || '') : '';
  } catch (e) {}
  var DEMO_LOCKED = DEMO && !TOKEN;

  // ---------- 設定（変更するのはここだけ） ----------
  var CONFIG = {
    API: 'https://gamba-api.kogentext.workers.dev/',
    LINE: 'https://line.me/R/ti/p/@735itfta',
    BUTTON_LABEL: 'わからないときは',
    TITLE: 'GAMBA 学習サポート',
    GREETING: 'こんにちは。わからないところがあれば、遠慮なく聞いてください。\n「ここが何を言っているのか分からない」だけでも大丈夫です。',
    MAX_TURNS: 20,          // 1ページあたりの往復上限（使いすぎ防止）
    PLACEHOLDER: '質問を入力してください',
  };

  // ---------- 科目の推定（URLとタイトルから） ----------
  function guessSubject() {
    var p = location.pathname;
    var map = [
      ['kounin-math1', '高卒認定試験の数学'],
      ['kounin-kagaku', '科学と人間生活'],
      ['kounin-chiri', '高卒認定試験の地理'],
      ['kagaku', '化学'],
      ['koumuin-keizaigaku', '公務員試験の経済学'],
      ['j-math', '中学数学'],
      ['j-english', '中学英文法'],
      ['j-engglish-word', '中学英単語'],
      ['kounin_english_word', '高卒認定試験の英単語'],
      ['kounin_eng_grammer', '高卒認定試験の英文法'],
      ['kotenbunpou', '古典文法'],
      ['rekishisougou', '歴史総合'],
      ['koukyou', '公共'],
      ['seibutukiso', '生物基礎'],
      ['kounin-seibutu', '生物基礎'],
      ['japanese', '国語（高卒認定試験）'],
      ['kounin-joho', '高卒認定試験の情報'],
      ['business1', 'ビジネス関連科目'],
    ];
    for (var i = 0; i < map.length; i++) {
      if (p.indexOf('/' + map[i][0] + '/') === 0 || p.indexOf('/' + map[i][0] + '/') > -1) return map[i][1];
    }
    return '高卒認定試験の学習';
  }

  function pageContext() {
    var t = (document.title || '').trim();
    var h1 = document.querySelector('h1, .lesson-title, .success-title');
    return {
      subject: guessSubject(),
      title: t,
      heading: h1 ? h1.textContent.trim().slice(0, 80) : '',
      url: location.href,
    };
  }

  // AIへの指示文は、Worker側（gamba-api）が持っています。ここには書きません。

  // ---------- 画面の組み立て（Shadow DOM） ----------
  var host = document.createElement('div');
  host.id = 'gamba-ai-host';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483000;';
  var root = host.attachShadow({ mode: 'open' });

  root.innerHTML = [
    '<style>',
    ':host{all:initial;}',
    '*{box-sizing:border-box;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;}',
    '.fab{position:fixed;right:16px;bottom:16px;white-space:nowrap;display:flex;align-items:center;gap:8px;',
    'background:#2B5797;color:#fff;border:none;border-radius:999px;padding:13px 18px;',
    'font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(43,87,151,.4);}',
    '.fab:hover{background:#1F3864;}',
    '.panel{position:fixed;right:16px;bottom:16px;width:min(380px,calc(100vw - 32px));',
    'height:min(560px,calc(100vh - 32px));background:#fff;border-radius:16px;display:none;',
    'flex-direction:column;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.28);border:1px solid #DCE1E8;}',
    '.panel.open{display:flex;}',
    '.hd{background:#2B5797;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}',
    '.hd .t{font-size:15px;font-weight:700;}',
    '.hd button{background:transparent;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 4px;}',
    '.body{flex:1;overflow-y:auto;padding:14px;background:#F7F9FC;display:flex;flex-direction:column;gap:10px;}',
    '.m{max-width:88%;padding:10px 13px;border-radius:14px;font-size:14.5px;line-height:1.8;white-space:pre-wrap;word-break:break-word;}',
    '.m.ai{background:#fff;border:1px solid #DCE1E8;align-self:flex-start;border-bottom-left-radius:4px;color:#2C3038;}',
    '.m.me{background:#E8EEF7;align-self:flex-end;border-bottom-right-radius:4px;color:#1F3864;}',
    '.m.think{background:#EDEFF2;color:#6B7280;font-style:italic;align-self:flex-start;}',
    '.ft{border-top:1px solid #DCE1E8;padding:10px;background:#fff;}',
    '.row{display:flex;gap:8px;}',
    'textarea{flex:1;resize:none;height:44px;padding:11px 12px;border:1px solid #DCE1E8;border-radius:10px;',
    'font-size:16px;line-height:1.4;outline:none;color:#2C3038;}',
    'textarea:focus{border-color:#2B5797;}',
    '.send{background:#E8802B;color:#fff;border:none;border-radius:10px;padding:0 16px;font-size:14px;font-weight:700;cursor:pointer;}',
    '.send:disabled{background:#C3C8D0;cursor:default;}',
    '.line{display:block;text-align:center;margin-top:9px;font-size:13px;color:#06663a;text-decoration:none;',
    'background:#E6F7EE;border:1px solid #A7E3C4;border-radius:8px;padding:8px;}',
    '.note{font-size:11.5px;color:#8A9099;text-align:center;margin-top:7px;line-height:1.6;}',
    '@media (max-width:480px){.panel{right:8px;left:8px;bottom:8px;width:auto;height:calc(100vh - 16px);}}',
    '</style>',
    '<button class="fab" id="fab">🤖 <span>' + CONFIG.BUTTON_LABEL + '</span></button>',
    '<div class="panel" id="panel">',
    '  <div class="hd"><span class="t">' + CONFIG.TITLE + '</span><button id="close" aria-label="閉じる">×</button></div>',
    '  <div class="body" id="body"></div>',
    '  <div class="ft">',
    '    <div class="row">',
    '      <textarea id="ta" placeholder="' + CONFIG.PLACEHOLDER + '"></textarea>',
    '      <button class="send" id="send">送信</button>',
    '    </div>',
    '    <a class="line" id="lineBtn" href="' + CONFIG.LINE + '" target="_blank" rel="noopener">解決しないときは 野田先生に聞く（LINE）</a>',
    '    <div class="note" id="note">答えが合っているか不安なときは、先生に確認してください。</div>',
    '  </div>',
    '</div>',
  ].join('');

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.body.appendChild(host);

    var $ = function (id) { return root.getElementById(id); };
    var panel = $('panel'), body = $('body'), ta = $('ta'), send = $('send');
    var history = [], turns = 0, busy = false;

    function add(text, cls) {
      var d = document.createElement('div');
      d.className = 'm ' + cls;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
      return d;
    }

    function lockInput(placeholder) {
      ta.disabled = true; send.disabled = true;
      if (placeholder) ta.placeholder = placeholder;
    }

    function open() {
      panel.classList.add('open');
      $('fab').style.display = 'none';
      if (!body.childElementCount) {
        if (DEMO_LOCKED) {
          add('無料体験をご利用いただき、ありがとうございます。\nAIへの質問は、本科でご利用いただく機能です。\nわからないところは、下のLINEから野田先生にご相談ください。', 'ai');
          lockInput('AI質問は本科でご利用いただけます');
        } else if (DEMO) {
          add('無料体験をご利用いただき、ありがとうございます。\nAIへの質問は、体験中に合計5回までお使いいただけます。\nわからないところがあれば、聞いてみてください。', 'ai');
          $('note').textContent = '体験版のAI質問：合計5回まで（お使いになった回数は、ページをまたいで数えます）';
        } else {
          add(CONFIG.GREETING, 'ai');
        }
      }
      setTimeout(function () { ta.focus(); }, 50);
    }
    function close() {
      panel.classList.remove('open');
      $('fab').style.display = 'flex';
    }

    $('fab').addEventListener('click', open);

    // ページ自身の「画面下のバー」や、右下の丸いボタンと重ならないよう、ボタンの位置をずらす
    function avoid() {
      try {
        var fab = $('fab');
        if (!fab || fab.style.display === 'none') return;
        var vw = window.innerWidth, vh = window.innerHeight;
        var fw = fab.offsetWidth || 190;
        var bottom = 16, right = 16;
        var els = document.body.getElementsByTagName('*');
        for (var i = 0; i < els.length; i++) {
          var e = els[i];
          if (e === host) continue;
          var cs = window.getComputedStyle(e);
          if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (parseFloat(cs.opacity) < 0.05 || cs.pointerEvents === 'none') continue;   // 見えない・触れないものは無視
          var r = e.getBoundingClientRect();
          if (!r.width || !r.height || r.height > vh * 0.5) continue;
          if (r.bottom < vh - 220 || r.top >= vh) continue;      // 画面の下のほうにあるものだけ
          if (r.width >= vw * 0.6) {                               // 横長のバー：その上に出す
            bottom = Math.max(bottom, vh - r.top + 12);
          } else if (r.right > vw - fw - 16 && r.left < vw) {      // 右下の小さなボタン：その左に出す
            right = Math.max(right, vw - r.left + 12);
          }
        }
        fab.style.bottom = bottom + 'px';
        fab.style.right = right + 'px';
      } catch (e) {}
    }
    setTimeout(avoid, 600);
    setTimeout(avoid, 2500);
    window.addEventListener('resize', avoid);
    $('close').addEventListener('click', close);

    async function ask() {
      var msg = ta.value.trim();
      if (!msg || busy) return;
      if (DEMO_LOCKED) return;   // 体験版（合言葉なし）では送信しない

      if (turns >= CONFIG.MAX_TURNS) {
        add('たくさん質問していただきありがとうございます。ここから先は、野田先生に直接聞いていただくほうが早いかもしれません。下のLINEボタンからご連絡ください。', 'ai');
        return;
      }

      add(msg, 'me');
      ta.value = '';
      busy = true;
      send.disabled = true;
      var thinking = add('考えています…', 'think');

      history.push({ role: 'user', content: msg });

      try {
        var res = await fetch(CONFIG.API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ai_chat2',
            context: (function () { var c = pageContext(); return { subject: c.subject, title: c.title, heading: c.heading }; })(),
            token: TOKEN || undefined,
            messages: history,
          }),
        });
        var data = await res.json();
        var reply = data.reply || data.response || '';
        if (!reply) throw new Error('empty');
        thinking.className = 'm ai';
        thinking.textContent = reply;
        if (data.code && data.code !== 'ok') {
          // 体験の回数を使い切った・期限が切れた・混み合っている、など
          history.pop();                               // この質問は数えない
          if (data.code === 'limit' || data.code === 'expired' || data.code === 'notoken') lockInput('AI質問は本科でご利用いただけます');
          return;
        }
        history.push({ role: 'assistant', content: reply });
        turns++;
        if (DEMO && typeof data.remaining === 'number') {
          $('note').textContent = '体験版のAI質問：残り ' + data.remaining + ' 回';
          if (data.remaining <= 0) lockInput('体験版のAI質問は、使い切りました');
        }
      } catch (e) {
        thinking.className = 'm ai';
        thinking.textContent = 'うまく通信できませんでした。電波の良い場所でもう一度お試しください。\n何度も出るときは、下のLINEから野田先生にご連絡ください。';
      } finally {
        busy = false;
        send.disabled = false;
        body.scrollTop = body.scrollHeight;
        ta.focus();
      }
    }

    send.addEventListener('click', ask);
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ask(); }
    });
  });
})();

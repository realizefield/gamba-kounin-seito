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

  function buildSystemPrompt() {
    var c = pageContext();
    return [
      'あなたは江原予備校GAMBAの学習サポートAIです。生徒からの質問に日本語で答えます。',
      '',
      '【いま生徒が開いているページ】',
      '科目：' + c.subject,
      'ページ：' + c.title + (c.heading ? '（' + c.heading + '）' : ''),
      '',
      '【この予備校に来る生徒について】',
      '不登校の経験がある人、高校を中退した人、通信制高校に通う人、社会人になってから学び直す人、',
      'ひとり親家庭の人など、学習環境に恵まれてこなかった生徒が多くいます。',
      '学校の授業についていけなかった経験や、「自分は勉強ができない」と思い込んでいる生徒もいます。',
      '',
      '【答え方のルール】',
      '1. やさしく、短く、順を追って説明する。一度にたくさん説明しない',
      '2. 専門用語を使うときは、必ずその場で意味を説明する',
      '3. 「そんなことも分からないのか」と受け取られる言い方は絶対にしない',
      '4. 質問があいまいなときは、責めずに「どのあたりで止まっていますか」と一言だけ尋ねる',
      '5. 練習問題の質問には、いきなり答えだけを言わず、考え方を一段ずつ示す。',
      '   ただし生徒が「答えを教えて」と言う場合や、行き詰まっている場合は答えも示してよい',
      '6. できていることは具体的に認める。おおげさに褒めない',
      '7. 回答は原則400字以内。長くなるときは区切って「ここまでで大丈夫ですか」と確認する',
      '8. 科目の学習と、勉強のやり方の相談に答える。それ以外の話題は',
      '   「勉強のことでしたらお答えできます」とやんわり伝える',
      '9. 自信のないことは、推測で答えず「これは先生に確認したほうが確実です」と伝える',
      '',
      '【解決しないとき】',
      '2〜3回やり取りしても生徒が理解できない様子のときは、無理に続けず',
      '「この続きは、野田先生に直接聞いてみましょう。下のLINEボタンから連絡できます」と案内する。',
      '一人で抱え込ませないことが、この予備校でいちばん大切にしていることです。',
    ].join('\n');
  }

  // ---------- 画面の組み立て（Shadow DOM） ----------
  var host = document.createElement('div');
  host.id = 'gamba-ai-host';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483000;';
  var root = host.attachShadow({ mode: 'open' });

  root.innerHTML = [
    '<style>',
    ':host{all:initial;}',
    '*{box-sizing:border-box;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif;}',
    '.fab{position:fixed;right:16px;bottom:16px;display:flex;align-items:center;gap:8px;',
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
    '    <div class="note">答えが合っているか不安なときは、先生に確認してください。</div>',
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

    function open() {
      panel.classList.add('open');
      $('fab').style.display = 'none';
      if (!body.childElementCount) add(CONFIG.GREETING, 'ai');
      setTimeout(function () { ta.focus(); }, 50);
    }
    function close() {
      panel.classList.remove('open');
      $('fab').style.display = 'flex';
    }

    $('fab').addEventListener('click', open);
    $('close').addEventListener('click', close);

    async function ask() {
      var msg = ta.value.trim();
      if (!msg || busy) return;

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
            action: 'ai_chat',
            systemPrompt: buildSystemPrompt(),
            messages: history,
          }),
        });
        var data = await res.json();
        var reply = data.reply || data.response || '';
        if (!reply) throw new Error('empty');
        history.push({ role: 'assistant', content: reply });
        turns++;
        thinking.className = 'm ai';
        thinking.textContent = reply;
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

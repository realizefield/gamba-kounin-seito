/* ============================================================
 * GAMBA 体験版：一覧ページ・後半の単元への出入りを止める番人
 * ------------------------------------------------------------
 * ・体験版の入口ページを開いたブラウザ（gamba_demo_start が残っている）だけで働きます。
 * ・本科の生徒さん（目印がないブラウザ）では、最初の1行で終了し、何も起きません。
 * ・止める対象：単元の一覧ページ、および体験の範囲より後ろの単元。
 *   → 体験版の入口ページ（該当の案内つき）へ戻します。
 * ・このファイルが読み込めない場合も、ページはこれまでどおり開きます。
 * 2026-09-30 作成
 * ============================================================ */
(function () {
  'use strict';
  if (window.__GAMBA_GUARD__) return;
  window.__GAMBA_GUARD__ = true;

  var DEMO = false;
  try { DEMO = !!parseInt(localStorage.getItem('gamba_demo_start'), 10); } catch (e) {}
  if (!DEMO) return;   // 本科の生徒さんは、ここで終了

  var ENTRANCE = 'https://realizefield.github.io/gamba-kounin-demo/gamba-kounin-demo.html?from=limit';
  var BLOCK = {"/j-engglish-word/index.html":1,"/j-engglish-word/js_adj01.html":1,"/j-engglish-word/js_adj02.html":1,"/j-engglish-word/js_adj03.html":1,"/j-engglish-word/js_adj04.html":1,"/j-engglish-word/js_adj05.html":1,"/j-engglish-word/js_adj06.html":1,"/j-engglish-word/js_adj07.html":1,"/j-engglish-word/js_adj08.html":1,"/j-engglish-word/js_adj09.html":1,"/j-engglish-word/js_adj10.html":1,"/j-engglish-word/js_adj11.html":1,"/j-engglish-word/js_adj12.html":1,"/j-engglish-word/js_adj13.html":1,"/j-engglish-word/js_adj14.html":1,"/j-engglish-word/js_adv01.html":1,"/j-engglish-word/js_adv02.html":1,"/j-engglish-word/js_adv03.html":1,"/j-engglish-word/js_adv04.html":1,"/j-engglish-word/js_adv05.html":1,"/j-engglish-word/js_adv06.html":1,"/j-engglish-word/js_adv07.html":1,"/j-engglish-word/js_adv08.html":1,"/j-engglish-word/js_adv09.html":1,"/j-engglish-word/js_cmp01.html":1,"/j-engglish-word/js_cmp02.html":1,"/j-engglish-word/js_cmp03.html":1,"/j-engglish-word/js_cmp04.html":1,"/j-engglish-word/js_cmp05.html":1,"/j-engglish-word/js_conj01.html":1,"/j-engglish-word/js_conj02.html":1,"/j-engglish-word/js_conj03.html":1,"/j-engglish-word/js_irv01.html":1,"/j-engglish-word/js_irv02.html":1,"/j-engglish-word/js_irv03.html":1,"/j-engglish-word/js_irv04.html":1,"/j-engglish-word/js_irv05.html":1,"/j-engglish-word/js_irv06.html":1,"/j-engglish-word/js_irv07.html":1,"/j-engglish-word/js_irv08.html":1,"/j-engglish-word/js_irv09.html":1,"/j-engglish-word/js_pro01.html":1,"/j-engglish-word/js_pro02.html":1,"/j-engglish-word/js_pro03.html":1,"/j-engglish-word/js_pro04.html":1,"/j-engglish-word/js_pro05.html":1,"/j-engglish-word/js_pro06.html":1,"/j-engglish-word/js_qw01.html":1,"/j-engglish-word/js_qw02.html":1,"/j-engglish-word/js_qw03.html":1,"/j-engglish-word/js_rv01.html":1,"/j-engglish-word/js_rv02.html":1,"/j-engglish-word/js_rv03.html":1,"/j-engglish-word/js_rv04.html":1,"/j-engglish-word/js_rv05.html":1,"/j-engglish-word/js_rv06.html":1,"/j-engglish-word/js_rv07.html":1,"/j-engglish-word/js_rv08.html":1,"/j-engglish-word/js_rv09.html":1,"/j-engglish-word/js_rv10.html":1,"/j-english/ea21.html":1,"/j-english/ea22.html":1,"/j-english/ea23.html":1,"/j-english/ea24.html":1,"/j-english/ea25.html":1,"/j-english/ea26.html":1,"/j-english/ea27.html":1,"/j-english/ea28.html":1,"/j-english/ea29.html":1,"/j-english/ea30.html":1,"/j-english/ea31.html":1,"/j-english/ea32.html":1,"/j-english/ea33.html":1,"/j-english/ea34.html":1,"/j-english/ea35.html":1,"/j-english/ea36.html":1,"/j-english/ea37.html":1,"/j-english/ea38.html":1,"/j-english/ea39.html":1,"/j-english/index.html":1,"/j-math/ef01/intro.html":1,"/j-math/ef02/intro_a.html":1,"/j-math/ef03/intro.html":1,"/j-math/ef04-1/ef04-1_intro.html":1,"/j-math/ef04-2/ef04-2_intro.html":1,"/j-math/ef05/intro.html":1,"/j-math/ef06-1/ef06-1_intro.html":1,"/j-math/ef06-2/ef06-2_intro.html":1,"/j-math/ef06-3/ef06-3_intro.html":1,"/j-math/ef07/intro.html":1,"/j-math/ef08/intro.html":1,"/j-math/ef09/intro.html":1,"/j-math/gamba_kounin_kiso.html":1,"/j-math/index.html":1,"/j-math/md06/intro.html":1,"/j-math/md07/intro.html":1,"/j-math/md08/intro.html":1,"/j-math/mf01/intro.html":1,"/j-math/mf02/intro.html":1,"/j-math/mf03/intro.html":1,"/j-math/mf04/intro.html":1,"/j-math/mf05/intro.html":1,"/j-math/qe01/intro.html":1,"/j-math/qe02/intro.html":1,"/j-math/qe03/intro.html":1,"/j-math/qe04/intro.html":1,"/j-math/qe05/intro.html":1,"/j-math/qe06/intro.html":1,"/j-math/sq01/intro.html":1,"/j-math/sq02/intro.html":1,"/j-math/sq03/intro.html":1,"/j-math/sq04/intro.html":1,"/j-math/sq05/intro.html":1,"/j-math/sq06/intro.html":1,"/j-math/sq07/intro.html":1,"/j-math/sq08/intro.html":1,"/japanese/kaiwa_hyojun_01.html":1,"/japanese/kaiwa_hyojun_02.html":1,"/japanese/kaiwa_hyojun_03.html":1,"/japanese/kaiwa_jissen_01.html":1,"/japanese/kaiwa_jissen_02.html":1,"/japanese/kaiwa_kiso_01.html":1,"/japanese/kaiwa_kiso_02.html":1,"/japanese/kaiwa_kiso_03.html":1,"/japanese/kaiwa_nyumon_01.html":1,"/japanese/kaiwa_nyumon_02.html":1,"/japanese/kaiwa_nyumon_03.html":1,"/japanese/kanbun_kiso.html":1,"/japanese/kanbun_r5_1.html":1,"/japanese/kanbun_r5_2.html":1,"/japanese/kanbun_r6_2.html":1,"/japanese/kanbun_r7_1.html":1,"/japanese/kanbun_r7_2.html":1,"/japanese/yondeikou_index.html":1,"/koukyou/c02_ch4_l1.html":1,"/koukyou/c02_g5_l1.html":1,"/koukyou/c02_g5_l2.html":1,"/koukyou/c02_g5_l3.html":1,"/koukyou/c02_g5_l4.html":1,"/koukyou/c02_g6_l1.html":1,"/koukyou/c02_g6_l2.html":1,"/koukyou/c02_g6_l3.html":1,"/koukyou/c02_g6_l4.html":1,"/koukyou/c02_g7_l1.html":1,"/koukyou/c02_g7_l2.html":1,"/koukyou/c02_g8_l1.html":1,"/koukyou/c02_g8_l2.html":1,"/koukyou/c02_g8_l3.html":1,"/koukyou/c02_index.html":1,"/kounin-chiri/kouninchiri-index.html":1,"/kounin-chiri/worldall1.html":1,"/kounin-chiri/worldall2.html":1,"/kounin-chiri/worldall3.html":1,"/kounin-chiri/worldall4.html":1,"/kounin-joho/index.html":1,"/kounin-joho/kouninjoho4.html":1,"/kounin-joho/kouninjoho5.html":1,"/kounin-joho/kouninjoho6.html":1,"/kounin-kagaku/index.html":1,"/kounin-kagaku/sc12_intro.html":1,"/kounin-kagaku/sc13_intro.html":1,"/kounin-kagaku/sc14_intro.html":1,"/kounin-kagaku/sc15.html":1,"/kounin-kagaku/sc16_intro.html":1,"/kounin-kagaku/sc17_intro.html":1,"/kounin-kagaku/sc18_intro.html":1,"/kounin-kagaku/sc19_intro.html":1,"/kounin-math1/da01.html":1,"/kounin-math1/da02.html":1,"/kounin-math1/da03.html":1,"/kounin-math1/da04.html":1,"/kounin-math1/kounin_math_index.html":1,"/kounin-math1/qu06/intro.html":1,"/kounin-math1/qu07/intro.html":1,"/kounin-math1/qu08/intro.html":1,"/kounin-math1/qu09/intro.html":1,"/kounin-math1/tr01.html":1,"/kounin-math1/tr02.html":1,"/kounin-math1/tr03.html":1,"/kounin-math1/tr04.html":1,"/kounin-math1/tr05.html":1,"/kounin-math1/tr06.html":1,"/kounin-math1/tr07.html":1,"/kounin-math1/tr08.html":1,"/kounin-math1/tr09.html":1,"/kounin-math1/tr10.html":1,"/kounin-seibutu/bl06.html":1,"/kounin-seibutu/bl09_intro.html":1,"/kounin-seibutu/bl10.html":1,"/kounin-seibutu/bl11.html":1,"/kounin-seibutu/bl12.html":1,"/kounin-seibutu/bl13.html":1,"/kounin-seibutu/bl14.html":1,"/kounin-seibutu/bl15.html":1,"/kounin-seibutu/bl16.html":1,"/kounin-seibutu/bl18.html":1,"/kounin-seibutu/index.html":1,"/kounin_eng_grammer/kounineng-index.html":1,"/kounin_eng_grammer/kounineng10.html":1,"/kounin_eng_grammer/kounineng11.html":1,"/kounin_eng_grammer/kounineng7.html":1,"/kounin_eng_grammer/kounineng8.html":1,"/kounin_eng_grammer/kounineng9.html":1,"/kounin_english_word/hs_1101.html":1,"/kounin_english_word/hs_1201.html":1,"/kounin_english_word/hs_1301.html":1,"/kounin_english_word/hs_1401.html":1,"/kounin_english_word/hs_1501.html":1,"/kounin_english_word/hs_1601.html":1,"/kounin_english_word/hs_1701.html":1,"/kounin_english_word/hs_1801.html":1,"/kounin_english_word/hs_1901.html":1,"/kounin_english_word/hs_2001.html":1,"/kounin_english_word/hs_index.html":1,"/rekishisougou/index.html":1,"/rekishisougou/kindai14.html":1,"/rekishisougou/kindai15.html":1,"/rekishisougou/kindai16.html":1,"/rekishisougou/kindai17.html":1,"/rekishisougou/kindai18.html":1,"/rekishisougou/kindai19.html":1,"/rekishisougou/kindai20.html":1,"/rekishisougou/kindai21.html":1,"/rekishisougou/kindai22.html":1,"/rekishisougou/kindai23.html":1,"/rekishisougou/kindai24.html":1,"/rekishisougou/kindai25.html":1,"/rekishisougou/kindai26.html":1};

  function key(path) {
    try { path = decodeURIComponent(path); } catch (e) {}
    if (path.charAt(path.length - 1) === '/') path += 'index.html';
    return path.toLowerCase();
  }
  function blocked(u) {
    return u.origin === location.origin && BLOCK[key(u.pathname)] === 1;
  }

  // 1) 止める対象のページを直接開いたとき
  if (blocked(location)) { location.replace(ENTRANCE); return; }

  // 2) 止める対象へ進むボタン・リンクを押したとき
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var el = t && t.closest ? t.closest('a[href],[onclick]') : null;
    if (!el) return;
    var h = null;
    if (el.tagName === 'A' && el.getAttribute('href')) {
      h = el.getAttribute('href');
    } else {
      var m = (el.getAttribute('onclick') || '').match(/location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/);
      if (m) h = m[1];
    }
    if (!h || /^(#|javascript:|mailto:|tel:)/i.test(h)) return;
    var u;
    try { u = new URL(h, location.href); } catch (e) { return; }
    if (blocked(u)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      location.href = ENTRANCE;
    }
  }, true);
})();

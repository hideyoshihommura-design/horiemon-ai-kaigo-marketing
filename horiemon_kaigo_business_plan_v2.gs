/**
 * ホリエモンAI学校 介護校 事業計画書 v2（高速版）
 * 実行方法: createBusinessPlan を選択して実行
 */

// ===== カラー定数 =====
const C = {
  NAVY:   '#1a237e',
  BLUE:   '#1565c0',
  LIGHT:  '#e3f2fd',
  WHITE:  '#ffffff',
  GOLD:   '#f9a825',
  LGRAY:  '#f5f5f5',
  GREEN_H:'#2e7d32',
  GREEN_L:'#e8f5e9',
  ORG_H:  '#e65100',
  ORG_L:  '#fff3e0',
  PUR_H:  '#4a148c',
  PUR_L:  '#f3e5f5',
  RED_L:  '#ffebee',
};

// ===== ヘルパー関数 =====
// タイトル行を追加
function addTitle(sh, row, cols, text, bg, fs) {
  sh.getRange(row, 1, 1, cols).merge()
    .setValue(text)
    .setBackground(bg || C.NAVY)
    .setFontColor(C.WHITE)
    .setFontSize(fs || 11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, fs === 14 ? 45 : 32);
}

// テーブルをまとめて書き込む（高速）
function addTable(sh, startRow, headers, rows, colWidths) {
  const cols = headers.length;
  // ヘッダー
  sh.getRange(startRow, 1, 1, cols)
    .setValues([headers])
    .setBackground(C.GOLD)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBorder(true, true, true, true, true, true);
  sh.setRowHeight(startRow, 30);

  if (rows.length === 0) return startRow + 1;

  // データ一括書き込み
  const dataRange = sh.getRange(startRow + 1, 1, rows.length, cols);
  dataRange.setValues(rows);

  // 背景色（2Dアレイで一括）
  const bgs = rows.map((_, i) => Array(cols).fill(i % 2 === 0 ? C.WHITE : C.LGRAY));
  dataRange.setBackgrounds(bgs);
  dataRange.setVerticalAlignment('middle');
  dataRange.setBorder(true, true, true, true, true, true);

  rows.forEach((_, i) => sh.setRowHeight(startRow + 1 + i, 28));

  return startRow + 1 + rows.length;
}

// ===== メイン関数 =====
function createBusinessPlan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const names = ['事業概要', '予算配分', '月別実行計画', 'KPI目標', '収益予測', 'チェックリスト'];

  // シート準備
  names.forEach(name => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  SpreadsheetApp.flush();

  // 不要なシートを削除
  ss.getSheets().filter(s => !names.includes(s.getName())).forEach(s => ss.deleteSheet(s));
  SpreadsheetApp.flush();

  // シートの順番を整える
  names.forEach((name, i) => {
    ss.setActiveSheet(ss.getSheetByName(name));
    ss.moveActiveSheet(i + 1);
  });
  SpreadsheetApp.flush();

  // 各シートの参照を取得して確認
  const sh概要    = ss.getSheetByName('事業概要');
  const sh予算    = ss.getSheetByName('予算配分');
  const sh実行    = ss.getSheetByName('月別実行計画');
  const shKPI     = ss.getSheetByName('KPI目標');
  const sh収益    = ss.getSheetByName('収益予測');
  const shチェック = ss.getSheetByName('チェックリスト');

  if (!sh概要 || !sh予算 || !sh実行 || !shKPI || !sh収益 || !shチェック) {
    const missing = names.filter(n => !ss.getSheetByName(n));
    SpreadsheetApp.getUi().alert('❌ シート取得エラー。取得できなかったシート: ' + missing.join(', '));
    return;
  }

  // 各シート作成
  sheet_概要(sh概要);
  sheet_予算(sh予算);
  sheet_実行計画(sh実行);
  sheet_KPI(shKPI);
  sheet_収益(sh収益);
  sheet_チェック(shチェック);

  ss.setActiveSheet(sh概要);
  SpreadsheetApp.getUi().alert('✅ 事業計画書の作成が完了しました！');
}

// ============================================================
// シート1: 事業概要
// ============================================================
function sheet_概要(sh) {
  sh.clear();
  sh.setColumnWidths(1, 1, 220);
  sh.setColumnWidths(2, 1, 420);
  sh.setColumnWidths(3, 1, 380);

  // タイトル
  addTitle(sh, 1, 2, 'ホリエモンAI学校 介護校｜事業計画書', C.NAVY, 16);
  addTitle(sh, 2, 2, '月間広告予算 120万円 プロジェクト', C.BLUE, 11);
  sh.getRange('A3:B3').merge()
    .setValue('作成日: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年MM月dd日'))
    .setBackground(C.LGRAY).setFontSize(9).setHorizontalAlignment('right').setFontColor('#555555');

  // プロジェクト基本情報
  addTitle(sh, 5, 2, '■ プロジェクト基本情報', C.BLUE);
  const info = [
    ['プロジェクト名',      'ホリエモンAI学校 介護校 マーケティング'],
    ['事業形態',            'フランチャイズ（FC）展開'],
    ['プロジェクト期間',    '12ヶ月（P1: 1〜2ヶ月 / P2: 3〜6ヶ月 / P3: 7〜12ヶ月）'],
    ['月間広告予算',        '¥1,200,000'],
    ['目標成約数（月間）',  '8〜10件'],
    ['FC月間売上目標',      '¥6,200,000'],
    ['必達目標ライン（累計）', '¥38,700,000'],
    ['12ヶ月累計成約目標',  '76〜100件'],
    ['目標ROAS',            '313%〜417%'],
  ];
  const infoVals = info.map(r => r);
  sh.getRange(6, 1, info.length, 2).setValues(infoVals);
  const keyBgs  = info.map(() => [C.LIGHT, C.WHITE]);
  const keyFWs  = info.map(() => ['bold', 'normal']);
  sh.getRange(6, 1, info.length, 2).setBackgrounds(keyBgs).setFontWeights(keyFWs)
    .setBorder(true, true, true, true, true, true);
  info.forEach((_, i) => sh.setRowHeight(6 + i, 28));

  // 広告チャネル概要
  addTitle(sh, 15, 3, '■ 広告チャネル概要', C.BLUE);
  sh.setColumnWidths(3, 1, 380);
  const chHeaders = ['チャネル', '予算（割合）', '役割'];
  const chData = [
    ['Facebook広告', '¥840,000（70%）', '主力チャネル。介護士・シニア層ターゲティング。リード獲得に特化'],
    ['Google広告',   '¥180,000（15%）', '検索意図が高いユーザーへのアプローチ。指名・キーワード広告'],
    ['LINE広告',     '¥180,000（15%）', 'リターゲティングと成約フォロー。既存リードのナーチャリング'],
  ];
  addTable(sh, 16, chHeaders, chData);

  // 成功指標サマリー
  const kRow = 21;
  addTitle(sh, kRow, 2, '■ 成功指標サマリー', C.BLUE);
  const kData = [
    ['LP CVR（初期）',        '3%以上'],
    ['LP CVR（安定期）',      '4%以上'],
    ['商談化率',              '60%以上'],
    ['成約率',                '40%以上'],
    ['目標CPA（成約）',       '¥120,000〜¥150,000'],
    ['2週間チェックポイント', 'CPA・CVR未達の場合は即日調整'],
  ];
  sh.getRange(kRow + 1, 1, kData.length, 2).setValues(kData);
  sh.getRange(kRow + 1, 1, kData.length, 2)
    .setBackgrounds(kData.map(() => [C.LIGHT, C.WHITE]))
    .setFontWeights(kData.map(() => ['bold', 'normal']))
    .setBorder(true, true, true, true, true, true);
  kData.forEach((_, i) => sh.setRowHeight(kRow + 1 + i, 26));
}

// ============================================================
// シート2: 予算配分
// ============================================================
function sheet_予算(sh) {
  sh.clear();
  sh.setColumnWidths(1, 6, 150);
  sh.setColumnWidths(6, 1, 200);

  addTitle(sh, 1, 6, '予算配分詳細', C.NAVY, 14);

  // チャネル別予算
  addTitle(sh, 3, 6, '■ チャネル別予算配分', C.BLUE);
  const h1 = ['チャネル', '月間予算', '割合', '期待リード数/月', '目標CPL', '備考'];
  const d1 = [
    ['Facebook広告', '¥840,000', '70%', '40〜50件', '¥16,800〜21,000', '主力。リール動画・LP誘導型'],
    ['Google広告',   '¥180,000', '15%', '10〜15件', '¥12,000〜18,000', '検索広告・GDNリターゲ'],
    ['LINE広告',     '¥180,000', '15%', '5〜10件',  '¥18,000〜36,000', 'ナーチャリング・成約フォロー'],
    ['合計',         '¥1,200,000', '100%', '55〜75件', '¥16,000〜21,818', ''],
  ];
  let nextRow = addTable(sh, 4, h1, d1);

  // 合計行を強調
  sh.getRange(nextRow, 1, 1, 6).setBackground(C.LIGHT).setFontWeight('bold');

  // Facebook詳細
  nextRow += 2;
  addTitle(sh, nextRow, 6, '■ Facebook広告 詳細配分（月84万円）', C.BLUE);
  const h2 = ['キャンペーン種別', '予算', '割合', '目的', 'ターゲット', '想定成果'];
  const d2 = [
    ['リード獲得広告',   '¥504,000', '60%', 'フォーム直接取得', '介護士・40〜60代', 'リード25〜30件'],
    ['動画・リール広告', '¥168,000', '20%', 'ブランド認知・LP誘導', '類似オーディエンス', '閲覧数5,000〜'],
    ['リターゲティング', '¥168,000', '20%', '再訴求・成約促進', 'LP訪問者・エンゲージ', 'リード15〜20件'],
  ];
  nextRow = addTable(sh, nextRow + 1, h2, d2);

  // Google詳細
  nextRow += 2;
  addTitle(sh, nextRow, 6, '■ Google広告 詳細配分（月18万円）', C.BLUE);
  const h3 = ['キャンペーン種別', '予算', '割合', '目的', 'キーワード例', '想定成果'];
  const d3 = [
    ['検索広告（指名）', '¥72,000', '40%', '指名検索獲得', 'ホリエモンAI学校 介護', 'リード5〜8件'],
    ['検索広告（一般）', '¥72,000', '40%', '潜在層獲得',   '介護 副業 AI 資格',    'リード3〜5件'],
    ['GDNリターゲ',      '¥36,000', '20%', '再訴求',       'サイト訪問者',          'リード2〜3件'],
  ];
  addTable(sh, nextRow + 1, h3, d3);

  // その他コスト
  nextRow += 7;
  addTitle(sh, nextRow, 6, '■ その他コスト（月間）', C.BLUE);
  const h4 = ['項目', '月額（円）', '年額（円）', '内訳・備考', '', ''];
  const d4 = [
    ['ウェビナー費',   '¥2,749',    '¥32,988',     'Zoom有料プラン', '', ''],
    ['ツール・SaaS費', '¥120,000',  '¥1,440,000',  'CRM・MA・分析ツール等の月額利用料', '', ''],
    ['制作費',         '¥100,000',  '¥1,200,000',  '展示会用パンフレット・ポスター・POP制作費', '', ''],
    ['ケアウィーク費', '¥160,500',  '¥1,926,000',  '出展料・ブース設営・交通費・人件費等（年額を月割換算）', '', ''],
  ];
  let endRow4 = addTable(sh, nextRow + 1, h4, d4);
  // 合計行
  sh.getRange(endRow4, 1, 1, 6).setValues([['月間その他コスト 合計', '¥383,249', '¥4,598,988', '', '', '']])
    .setBackground(C.LIGHT).setFontWeight('bold').setBorder(true,true,true,true,true,true);
  sh.setRowHeight(endRow4, 30);

  // 月間総コスト（広告費＋その他）
  const totRow = endRow4 + 2;
  addTitle(sh, totRow, 6, '■ 月間総コスト（広告費＋その他）', C.BLUE);
  const costSummary = [
    ['広告費（月間）',         '¥1,200,000', ''],
    ['その他コスト（月間）',   '¥383,249',   ''],
    ['月間総コスト合計',       '¥1,583,249', '※収益予測の粗利計算に反映'],
    ['12ヶ月累計総コスト',     '¥18,998,988','¥1,583,249 × 12ヶ月'],
  ];
  sh.getRange(totRow + 1, 1, costSummary.length, 3).setValues(costSummary)
    .setBorder(true,true,true,true,true,true);
  sh.getRange(totRow + 1, 1, costSummary.length, 1).setBackground(C.LIGHT).setFontWeight('bold');
  sh.getRange(totRow + 1, 2, costSummary.length, 2).setBackground(C.WHITE);
  sh.getRange(totRow + 3, 1, 1, 3).setBackground('#fff9c4').setFontWeight('bold'); // 合計行をハイライト
  sh.getRange(totRow + 4, 1, 1, 3).setBackground('#fff9c4').setFontWeight('bold');
  costSummary.forEach((_, i) => sh.setRowHeight(totRow + 1 + i, 28));
}

// ============================================================
// シート3: 月別実行計画
// ============================================================
function sheet_実行計画(sh) {
  sh.clear();
  sh.setColumnWidths(1, 1, 110);
  sh.setColumnWidths(2, 1, 130);
  sh.setColumnWidths(3, 1, 300);
  sh.setColumnWidths(4, 1, 250);
  sh.setColumnWidths(5, 1, 130);
  sh.setColumnWidths(6, 1, 110);

  addTitle(sh, 1, 6, '月別実行計画', C.NAVY, 14);

  // ヘッダー
  const headers = ['月', 'フェーズ', '主要タスク', 'クリエイティブ施策', '期待リード数', '期待成約数'];
  sh.getRange(3, 1, 1, 6).setValues([headers])
    .setBackground(C.GOLD).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true, true, true, true, true, true);
  sh.setRowHeight(3, 30);

  const plans = [
    ['1ヶ月目', '基盤構築＋テスト',
     '・FBアカウント設定・ピクセル設置\n・LP A/Bテスト（2パターン）開始\n・検索広告キーワード選定・入稿\n・LINE公式アカウント連携\n・2週間チェックポイント設定',
     '・介護士向け訴求動画（30秒）×2本\n・静止画バナー（縦型・横型）各3種\n・LPファーストビュー2パターン',
     '30〜40件', '2〜4件'],
    ['2ヶ月目', '最適化＋本格運用',
     '・1ヶ月目データ分析・勝ちパターン特定\n・低パフォーマンス広告の停止・予算移行\n・LPを勝ちパターンに一本化\n・類似オーディエンス拡張\n・LINE自動ステップ配信設定',
     '・勝ちバナーの横展開（色違い・文言変更）\n・お客様事例ビデオ追加\n・季節訴求バナー作成',
     '45〜60件', '5〜7件'],
    ['3ヶ月目', 'スケールアップ開始',
     '・勝ちキャンペーンへ予算集中\n・新クリエイティブ追加（月2〜3本）\n・Google広告でロングテールKW追加\n・CRM連携・リードナーチャリング強化\n・商談化率・成約率の詳細分析',
     '・新規動画（ビフォーアフター型）\n・季節イベント連動バナー\n・口コミ型クリエイティブ',
     '55〜70件', '7〜9件'],
    ['4ヶ月目', 'スケールアップ継続',
     '・安定成果チャネルの予算10〜20%増額\n・新ターゲットセグメント開拓\n・リターゲティング精度向上\n・成約事例をLPへフィードバック\n・競合分析・差別化ポイント再定義',
     '・成約者インタビュー動画\n・FAQ形式バナー\n・期間限定オファー訴求',
     '60〜75件', '8〜10件'],
    ['5ヶ月目', '安定運用フェーズ',
     '・KPI安定化（CVR 4%以上維持）\n・月次レポート自動化\n・新チャネル（YouTube等）テスト検討\n・紹介プログラム検討\n・来月以降の予算計画策定',
     '・ロングフォーム動画（2分）\n・シーズナルキャンペーン\n・リブランディングバナー',
     '65〜80件', '9〜10件'],
    ['6ヶ月目', '安定運用＋次期計画',
     '・上半期総括・成果分析レポート作成\n・下半期戦略立案（予算見直し含む）\n・新規FC向けLPテスト\n・SEO・コンテンツマーケ検討\n・運用改善提案書作成',
     '・上半期ベスト訴求の再活用\n・新フェーズ向けクリエイティブ刷新\n・ブランドムービー制作検討',
     '65〜80件', '9〜10件'],
  ];

  // フェーズカラー
  const phaseBgs = [
    [C.GREEN_H, C.GREEN_L],
    [C.GREEN_H, C.GREEN_L],
    [C.ORG_H,   C.ORG_L],
    [C.ORG_H,   C.ORG_L],
    [C.PUR_H,   C.PUR_L],
    [C.PUR_H,   C.PUR_L],
  ];

  plans.forEach(([month, phase, tasks, creative, leads, conv], i) => {
    const r = 4 + i;
    const bg = i % 2 === 0 ? C.WHITE : C.LGRAY;
    sh.getRange(r, 1, 1, 6).setValues([[month, phase, tasks, creative, leads, conv]])
      .setVerticalAlignment('top').setWrap(true).setBorder(true,true,true,true,true,true);
    sh.getRange(r, 1).setBackground(phaseBgs[i][0]).setFontColor(C.WHITE).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sh.getRange(r, 2).setBackground(phaseBgs[i][1]).setFontColor(phaseBgs[i][0]).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sh.getRange(r, 3, 1, 2).setBackground(bg);
    sh.getRange(r, 5, 1, 2).setBackground(bg).setHorizontalAlignment('center').setVerticalAlignment('middle');
    sh.setRowHeight(r, 100);
  });

  // 週次アクション
  const wRow = 11;
  addTitle(sh, wRow, 6, '■ 週次アクション（定型業務）', C.BLUE);
  const wHeaders = ['曜日', 'アクション内容', '', '', '', ''];
  sh.getRange(wRow + 1, 1, 1, 2).setValues([['曜日', 'アクション内容']])
    .setBackground(C.GOLD).setFontWeight('bold').setHorizontalAlignment('center')
    .setBorder(true,true,true,true,true,true);
  sh.getRange(wRow + 1, 2, 1, 5).merge();

  const weekly = [
    ['月曜日', '先週の広告パフォーマンスレポート確認・KPI対比チェック'],
    ['火曜日', '広告クリエイティブの入れ替え・新バナー入稿'],
    ['水曜日', 'LP改善・ヒートマップ分析・コピー修正'],
    ['木曜日', 'リード対応状況確認・商談進捗チェック・CRMデータ更新'],
    ['金曜日', '週次レポート作成・来週施策立案・予算ペース確認'],
  ];
  weekly.forEach(([day, action], i) => {
    const r = wRow + 2 + i;
    const bg = i % 2 === 0 ? C.WHITE : C.LGRAY;
    sh.getRange(r, 1).setValue(day).setBackground(bg).setFontWeight('bold')
      .setHorizontalAlignment('center').setBorder(true,true,true,true,false,false);
    sh.getRange(r, 2, 1, 5).merge().setValue(action).setBackground(bg)
      .setBorder(true,true,true,true,false,false);
    sh.setRowHeight(r, 28);
  });
}

// ============================================================
// シート4: KPI目標
// ============================================================
function sheet_KPI(sh) {
  sh.clear();
  sh.setColumnWidths(1, 1, 200);
  sh.setColumnWidths(2, 1, 190);
  sh.setColumnWidths(3, 1, 190);
  sh.setColumnWidths(4, 1, 270);

  addTitle(sh, 1, 4, 'KPI目標一覧', C.NAVY, 14);

  // 広告パフォーマンスKPI
  addTitle(sh, 3, 4, '■ 広告パフォーマンスKPI', C.BLUE);
  const h1 = ['指標', '初期目標（1〜2ヶ月目）', '安定期目標（3ヶ月目〜）', '要改善ライン'];
  const d1 = [
    ['CTR（クリック率）',       '1.5%以上',    '2.0%以上',    '1.0%未満で要見直し'],
    ['CPL（リード単価）',       '¥20,000以下', '¥16,000以下', '¥25,000超でアラート'],
    ['LP CVR',                  '3.0%以上',    '4.0%以上',    '2.0%未満で要LP改修'],
    ['商談化率（リード→商談）', '60%以上',     '65%以上',     '50%未満でナーチャリング改善'],
    ['成約率（商談→成約）',     '40%以上',     '45%以上',     '35%未満で営業トーク改善'],
    ['CPA（成約単価）',         '¥150,000以下','¥120,000以下','¥180,000超で要見直し'],
    ['月間成約数',              '4〜6件',      '8〜10件',     '3件未満で緊急対応'],
    ['ROAS',                    '250%以上',    '313%以上',    '200%未満で戦略変更'],
  ];
  sh.getRange(4, 1, 1, 4).setValues([h1]).setBackground(C.GOLD).setFontWeight('bold')
    .setHorizontalAlignment('center').setBorder(true,true,true,true,true,true);
  sh.getRange(5, 1, d1.length, 4).setValues(d1).setBorder(true,true,true,true,true,true);
  sh.getRange(5, 1, d1.length, 1).setBackground(C.LIGHT).setFontWeight('bold');
  const stableBgs = d1.map(() => [C.GREEN_L]);
  const dangerBgs = d1.map(() => [C.RED_L]);
  sh.getRange(5, 3, d1.length, 1).setBackgrounds(stableBgs);
  sh.getRange(5, 4, d1.length, 1).setBackgrounds(dangerBgs);
  const altBgs = d1.map((_, i) => [i%2===0 ? C.WHITE : C.LGRAY]);
  sh.getRange(5, 2, d1.length, 1).setBackgrounds(altBgs);
  d1.forEach((_, i) => sh.setRowHeight(5 + i, 28));

  // チャネル別KPI
  const cRow = 14;
  addTitle(sh, cRow, 4, '■ チャネル別KPI目標', C.BLUE);
  const h2 = ['チャネル', '月間予算', '月間リード目標', '目標CPL'];
  const d2 = [
    ['Facebook広告', '¥840,000', '40〜50件', '¥16,800〜21,000'],
    ['Google広告',   '¥180,000', '10〜15件', '¥12,000〜18,000'],
    ['LINE広告',     '¥180,000', '5〜10件',  '¥18,000〜36,000'],
    ['合計',         '¥1,200,000', '55〜75件', '¥16,000〜21,818'],
  ];
  let nextRow = addTable(sh, cRow + 1, h2, d2);
  sh.getRange(nextRow, 1, 1, 4).setBackground(C.LIGHT).setFontWeight('bold');

  // 月次KPI推移
  const mRow = nextRow + 2;
  addTitle(sh, mRow, 4, '■ 月次KPI推移目標', C.BLUE);
  const h3 = ['月', '月間リード数', '月間成約数', '月間広告費'];
  const d3 = [
    ['1ヶ月目', '30〜40件', '2〜4件',  '¥1,200,000'],
    ['2ヶ月目', '45〜60件', '5〜7件',  '¥1,200,000'],
    ['3ヶ月目', '55〜70件', '7〜9件',  '¥1,200,000'],
    ['4ヶ月目', '60〜75件', '8〜10件', '¥1,200,000'],
    ['5ヶ月目', '65〜80件', '9〜10件', '¥1,200,000'],
    ['6ヶ月目', '65〜80件', '9〜10件', '¥1,200,000'],
  ];
  addTable(sh, mRow + 1, h3, d3);
}

// ============================================================
// シート5: 収益予測
// ============================================================
function sheet_収益(sh) {
  sh.clear();
  sh.setColumnWidths(1, 1, 110);
  sh.setColumnWidths(2, 1, 110);
  sh.setColumnWidths(3, 1, 110);
  sh.setColumnWidths(4, 1, 150);
  sh.setColumnWidths(5, 1, 150);
  sh.setColumnWidths(6, 1, 130);
  sh.setColumnWidths(7, 1, 140);

  addTitle(sh, 1, 7, '収益予測（12ヶ月）', C.NAVY, 14);

  // 前提条件
  addTitle(sh, 3, 7, '■ 前提条件・コスト構造', C.BLUE);
  const condData = [
    ['FC加盟金（1件あたり）',   '¥620,000（想定平均）',  '', '', '', '', ''],
    ['月間広告費',               '¥1,200,000（固定）',    '', '', '', '', ''],
    ['ウェビナー費（月）',       '¥2,749  ／  Zoom有料プラン', '', '', '', '', ''],
    ['ツール・SaaS費（月）',     '¥120,000  ／  CRM・MA・分析ツール等', '', '', '', '', ''],
    ['制作費（月）',             '¥100,000  ／  展示会用パンフ・ポスター・POP', '', '', '', '', ''],
    ['ケアウィーク費（月割）',   '¥160,500  ／  年¥1,926,000を12ヶ月で按分', '', '', '', '', ''],
    ['月間その他コスト 合計',    '¥383,249', '', '', '', '', ''],
    ['月間総コスト合計',         '¥1,583,249（広告費＋その他）', '', '', '', '', ''],
    ['目標ROAS（広告費ベース）', '313%〜417%', '', '', '', '', ''],
  ];
  sh.getRange(4, 1, condData.length, 7).setValues(condData);
  sh.getRange(4, 1, condData.length, 1).setBackground(C.LIGHT).setFontWeight('bold');
  sh.getRange(4, 2, condData.length, 6).setBackground(C.WHITE);
  // その他コスト合計・総コスト合計行をハイライト
  sh.getRange(10, 1, 1, 7).setBackground('#fff9c4').setFontWeight('bold');
  sh.getRange(11, 1, 1, 7).setBackground('#ffe082').setFontWeight('bold');
  sh.getRange(4, 1, condData.length, 7).setBorder(true,true,true,true,true,true);
  condData.forEach((_, i) => sh.setRowHeight(4 + i, 26));

  // 月別収益テーブル
  const tRow = 4 + condData.length + 2;
  addTitle(sh, tRow, 7, '■ 月別収益予測', C.BLUE);
  const h = ['月', '成約数(下限)', '成約数(上限)', 'FC売上(下限)', 'FC売上(上限)', '月間総コスト', '粗利(下限)'];
  const d = [
    ['1ヶ月目',  '2',  '4',  '¥1,240,000', '¥2,480,000',  '¥1,583,249', '−¥343,249'],
    ['2ヶ月目',  '5',  '7',  '¥3,100,000', '¥4,340,000',  '¥1,583,249', '¥1,516,751'],
    ['3ヶ月目',  '7',  '9',  '¥4,340,000', '¥5,580,000',  '¥1,583,249', '¥2,756,751'],
    ['4ヶ月目',  '8',  '10', '¥4,960,000', '¥6,200,000',  '¥1,583,249', '¥3,376,751'],
    ['5ヶ月目',  '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['6ヶ月目',  '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['7ヶ月目',  '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['8ヶ月目',  '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['9ヶ月目',  '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['10ヶ月目', '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['11ヶ月目', '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['12ヶ月目', '9',  '10', '¥5,580,000', '¥6,200,000',  '¥1,583,249', '¥3,996,751'],
    ['合計',     '94', '120','¥58,280,000','¥74,400,000', '¥18,998,988','¥39,281,012'],
  ];
  let nextRow = addTable(sh, tRow + 1, h, d);
  sh.getRange(nextRow, 1, 1, 7).setBackground(C.LIGHT).setFontWeight('bold');
  // ※粗利(下限)は FC売上(下限) - 月間総コスト で計算

  // 収益サマリー
  nextRow += 2;
  addTitle(sh, nextRow, 7, '■ 収益サマリー（12ヶ月累計）', C.BLUE);
  const sumData = [
    ['12ヶ月累計成約数',                    '76〜100件（想定シナリオ）'],
    ['12ヶ月累計FC売上',                    '¥47,120,000〜¥62,000,000'],
    ['12ヶ月累計広告費',                    '¥14,400,000'],
    ['12ヶ月累計その他コスト',              '¥4,598,988（¥383,249×12ヶ月）'],
    ['12ヶ月累計総コスト',                  '¥18,998,988（広告費＋その他）'],
    ['12ヶ月累計粗利（全コスト控除・下限）','¥28,121,012（¥47,120,000 − ¥18,998,988）'],
    ['12ヶ月累計粗利（全コスト控除・上限）','¥43,001,012（¥62,000,000 − ¥18,998,988）'],
    ['平均月次ROAS（安定期4〜12ヶ月）',     '465%〜517%（広告費ベース）'],
  ];
  sh.getRange(nextRow + 1, 1, sumData.length, 2).setValues(sumData)
    .setBorder(true,true,true,true,true,true);
  sh.getRange(nextRow + 1, 1, sumData.length, 1).setBackground(C.GREEN_L).setFontWeight('bold');
  sh.getRange(nextRow + 1, 2, sumData.length, 1).setBackground(C.GREEN_L).setFontWeight('bold');
  // 総コスト・粗利行を強調
  sh.getRange(nextRow + 5, 1, 1, 2).setBackground('#ffe082').setFontWeight('bold');
  sh.getRange(nextRow + 6, 1, 1, 2).setBackground('#c8e6c9').setFontWeight('bold');
  sh.getRange(nextRow + 7, 1, 1, 2).setBackground('#c8e6c9').setFontWeight('bold');
  sumData.forEach((_, i) => sh.setRowHeight(nextRow + 1 + i, 28));
}

// ============================================================
// シート6: チェックリスト
// ============================================================
function sheet_チェック(sh) {
  sh.clear();
  sh.setColumnWidths(1, 1, 50);
  sh.setColumnWidths(2, 1, 50);
  sh.setColumnWidths(3, 1, 360);
  sh.setColumnWidths(4, 1, 110);
  sh.setColumnWidths(5, 1, 180);

  addTitle(sh, 1, 5, '実行チェックリスト', C.NAVY, 14);

  const sections = [
    {
      title: '■ 開始前チェックリスト（Day 0）',
      bg: C.BLUE,
      rowBg: C.GREEN_L,
      items: [
        '広告アカウント（FB・Google・LINE）の開設・権限付与',
        'Facebookピクセル設置・動作確認',
        'Googleタグマネージャー設置・CV計測確認',
        'LINEコンバージョンAPIの設定',
        'LP（ランディングページ）の最終確認・表示速度チェック',
        'フォーム送信後のサンクスページ確認',
        'CRM・顧客管理システムとの連携確認',
        'クリエイティブ（バナー・動画）の入稿素材準備',
        '入稿チェックリスト（文字数・サイズ・禁止表現）確認',
        'レポートダッシュボードの設定',
        '担当者・連絡体制の確認',
        '2週間チェックポイントの日程設定',
      ],
    },
    {
      title: '■ 週次チェックリスト（毎週月曜日）',
      bg: '#1b5e20',
      rowBg: C.WHITE,
      items: [
        'CTR・CPL・CVRの先週実績 vs 目標比較',
        'チャネル別予算消化ペース確認',
        '広告クリエイティブのパフォーマンスランキング確認',
        '低パフォーマンス広告の停止・入れ替え判断',
        'LPのCVR確認・改善ポイント特定',
        'リード対応状況（商談化率）確認',
        '成約数・CPA確認',
        '来週のクリエイティブ・入稿スケジュール確認',
        '異常値（CPL急騰・CVR急落）のアラート確認',
      ],
    },
    {
      title: '■ 月次チェックリスト（月末）',
      bg: C.ORG_H,
      rowBg: C.ORG_L,
      items: [
        '月間KPI全項目の実績集計・目標対比レポート作成',
        'チャネル別ROASの計算・評価',
        '勝ちクリエイティブ・負けクリエイティブの分類',
        '翌月のクリエイティブ制作・改善計画立案',
        '予算配分の見直し（チャネル間の最適化）',
        'LP改修事項のリストアップ・優先度付け',
        '成約事例のヒアリング・LP・広告への反映検討',
        '競合状況のモニタリング',
        '翌月の施策・KPI目標の設定',
        'ステークホルダーへの月次レポート提出',
      ],
    },
    {
      title: '■ 2週間チェックポイント（KPI達成判定）',
      bg: C.PUR_H,
      rowBg: C.PUR_L,
      items: [
        'LP CVRが2%未満 → LP緊急改修（ファーストビュー・CTA変更）',
        'CPLが¥25,000超 → 広告クリエイティブ・ターゲット見直し',
        '商談化率50%未満 → リード獲得チャネル・LP訴求の再検討',
        '成約率35%未満 → 営業トークスクリプト改善・フォロー強化',
        'CPA¥180,000超 → 予算配分の緊急組み替え',
        '2週間でリード数が目標50%未満 → スケール拡大か戦略転換の判断',
      ],
    },
  ];

  let currentRow = 3;
  sections.forEach(sec => {
    // セクションタイトル
    addTitle(sh, currentRow, 5, sec.title, sec.bg);
    currentRow++;

    // 列ヘッダー
    sh.getRange(currentRow, 1, 1, 5).setValues([['No.', '完了', 'チェック項目', '担当者', '期限・備考']])
      .setBackground(C.GOLD).setFontWeight('bold').setHorizontalAlignment('center')
      .setBorder(true,true,true,true,true,true);
    currentRow++;

    // チェック項目一括書き込み
    const rows = sec.items.map((item, i) => [i + 1, '□', item, '', '']);
    sh.getRange(currentRow, 1, rows.length, 5).setValues(rows)
      .setBackground(sec.rowBg).setBorder(true,true,true,true,true,true);
    sh.getRange(currentRow, 1, rows.length, 1).setHorizontalAlignment('center');
    sh.getRange(currentRow, 2, rows.length, 1).setHorizontalAlignment('center').setFontSize(14)
      .setBackground(C.WHITE);
    sh.getRange(currentRow, 4, rows.length, 2).setBackground(C.WHITE);
    sec.items.forEach((_, i) => sh.setRowHeight(currentRow + i, 26));
    currentRow += rows.length + 1;
  });
}

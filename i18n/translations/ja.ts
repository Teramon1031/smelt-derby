const ja = {
  // Setup screen
  setup_title: 'ワカサギダービー',
  setup_subtitle: '湖に落ちないように気をつけてね',
  setup_event_name_label: 'イベント名',
  setup_event_name_placeholder: '例: 2024冬の陣',
  setup_location_label: '場所',
  setup_location_placeholder: '例: 諏訪湖',
  setup_participants_label: '参加者',
  setup_participant_placeholder: '参加者 {{number}}',
  setup_add_participant: '参加者を追加',
  setup_start_btn: 'ダービー開始',
  setup_error_name: 'イベント名を入力してください',
  setup_error_participants: '2人以上の参加者を入力してください',

  // Derby screen
  derby_hint: '🐟 ← タップで +1 ！',
  derby_unit: '匹',
  derby_end_btn: '終了！',
  derby_confirm_title: 'ダービー終了',
  derby_confirm_message: '本当にダービーを終了しますか？結果発表に進みます。',
  derby_cancel: 'キャンセル',
  derby_confirm_end: '終了して結果へ',
  derby_icon_modal_title: '{{name}} のアイコン',

  // Results screen
  results_title: '結果発表',
  results_total: '合計 {{count}} 匹',
  results_ranking_section: '全順位',
  results_unit: '匹',
  results_home_btn: 'ホームに戻る',

  // Not found screen
  not_found_title: 'ページが見つかりません',
  not_found_message: 'このページは存在しません',
  not_found_home: 'ホームに戻る',

  // Modal screen
  modal_title: 'ワカサギダービー',
  modal_close: '閉じる',

  // Weather hook errors
  weather_error_location: '位置情報を取得できませんでした',
  weather_error_temperature: '気温を取得できませんでした',
  weather_error_fetch: '気温の取得に失敗しました',
} as const;

export default ja;

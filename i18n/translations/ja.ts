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
  setup_start_btn: '幹事が記録する',
  setup_start_sub: 'このスマホ1台で全員分を管理',
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

  // History
  history_title: '過去のダービー',
  history_total: '合計 {{count}} 匹',
  history_winner: '優勝: {{name}}',
  history_badge_local: 'このスマホのみ',
  history_badge_online: 'オンライン',

  // Weather
  weather_permission_title: '現在地の気温を表示します',
  weather_permission_message: 'あなたの現在地の気温が表示されるようになります。位置情報がサーバーにアップロードされることはありません。',
  weather_permission_allow: '許可する',
  weather_permission_deny: 'スキップ',
  weather_error_location: '位置情報を取得できませんでした',
  weather_error_temperature: '気温を取得できませんでした',
  weather_error_fetch: '気温の取得に失敗しました',

  // Room (online mode)
  room_create_btn: 'みんなで記録する',
  room_create_sub: 'URLをシェアして各自のスマホから入力',
  room_banner_label: 'ルームコード',
  room_copy_link: 'リンクをコピー',
  room_copied: 'コピーしました！',
  room_not_found: 'ルームが見つかりません',
  room_join_hint: 'リンクを送れば友達がすぐ参加できます',
  room_end_btn: '終了！',
  room_confirm_end: '終了して結果へ',
} as const;

export default ja;

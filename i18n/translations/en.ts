const en = {
  // Setup screen
  setup_title: 'Smelt Derby',
  setup_subtitle: 'Be careful not to fall into the lake!',
  setup_event_name_label: 'Event Name',
  setup_event_name_placeholder: 'e.g. Winter Classic 2024',
  setup_location_label: 'Location',
  setup_location_placeholder: 'e.g. Lake Suwa',
  setup_participants_label: 'Participants',
  setup_participant_placeholder: 'Participant {{number}}',
  setup_add_participant: 'Add Participant',
  setup_start_btn: 'Start Derby',
  setup_error_name: 'Please enter an event name',
  setup_error_participants: 'Please add at least 2 participants',

  // Derby screen
  derby_hint: '🐟 ← Tap to +1!',
  derby_unit: 'fish',
  derby_end_btn: 'End!',
  derby_confirm_title: 'End Derby',
  derby_confirm_message: 'Are you sure you want to end the derby? You will be taken to the results.',
  derby_cancel: 'Cancel',
  derby_confirm_end: 'End & See Results',
  derby_icon_modal_title: '{{name}}\'s Icon',

  // Results screen
  results_title: 'Results',
  results_total: 'Total: {{count}} fish',
  results_ranking_section: 'Full Rankings',
  results_unit: 'fish',
  results_home_btn: 'Back to Home',

  // Not found screen
  not_found_title: 'Page Not Found',
  not_found_message: 'This page does not exist.',
  not_found_home: 'Back to Home',

  // Modal screen
  modal_title: 'Smelt Derby',
  modal_close: 'Close',

  // Weather hook errors
  weather_error_location: 'Could not retrieve location',
  weather_error_temperature: 'Could not retrieve temperature',
  weather_error_fetch: 'Failed to fetch temperature',
} as const;

export default en;

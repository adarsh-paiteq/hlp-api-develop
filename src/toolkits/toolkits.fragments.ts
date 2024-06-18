import { gql } from 'graphql-request';

/**
 * Fragment are used in  @function getToolkitByIdQuery() and @function getToolkitDataQuery()
 * @deprecated
 */
export const toolkitFragment = gql`
  fragment toolkit on tool_kits {
    is_whats_new_tool_kit
    habit_duration
    max_alcohol_intake
    max_blood_diastolic_value
    max_blood_systolic_value
    max_medication_per_day_value
    time_spent_on_sports
    tool_kit_hlp_reward_points
    activity_timer_value
    max_ecg_spm_value
    max_foot_steps
    max_heart_rate_in_bpm
    max_weight_value
    meditation_timer_value
    podcast_audio_length
    sleep_check_max_value
    description
    extra_information_description
    extra_information_title
    file_path
    image_id
    image_url
    membership_stage_type
    podcast_audio_url
    short_description
    title
    todo_screen_description
    tool_kit_explain_page_file_path
    tool_kit_explain_page_image_id
    tool_kit_explain_page_image_url
    tool_kit_info
    tool_kit_profile_page_file_path
    tool_kit_profile_page_image_id
    tool_kit_profile_page_image_url
    tool_kit_result_screen_image
    tool_kit_type
    video_id
    video_path
    video_thumb_nail
    video_thumbnail_id
    video_thumbnail_path
    video_url
    created_at
    updated_at
    goal_id
    id
    membership_level_id
    membership_stage_id
    tool_kit_category
    tool_kit_sub_category
    unit
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const sleepToolkitOptionSelectedFragment = gql`
  fragment sleep_tool_kit_option_selected on sleep_tool_kit_option_selected_by_user {
    created_at
    updated_at
    id
    schedule_id
    sleep_tool_kit_option_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const medicationToolkitInfoPlannedFragment = gql`
  fragment medication_tool_kit_info_planned on medication_tool_kit_info_planned_by_user {
    doses
    stock
    instructions
    medication
    created_at
    updated_at
    id
    schedule_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Unused Fragment
 */
export const sleepToolkitOptionsFragment = gql`
  fragment sleep_tool_kit_option on sleep_tool_kit_options {
    sleep_time
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

/**
 * @deprecated Unused Fragment
 */
export const AlcoholToolkitOptionsFragment = gql`
  fragment alcohol_tool_kit_option on alcohol_tool_kit_options {
    time_spent
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

/**
 * @deprecated Unused Fragment
 */
export const SportsToolkitOptionsFragment = gql`
  fragment sports_tool_kit_option on sports_tool_kit_option {
    time_spent
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

/**
 * @deprecated Unused Fragment
 */
export const StepsToolkitOptionsFragment = gql`
  fragment steps_tool_kit_option on steps_tool_kit_options {
    steps
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const stepToolkitOptionSelectedFragment = gql`
  fragment step_tool_kit_option_selected on step_tool_kit_option_selected_by_user {
    created_at
    updated_at
    id
    schedule_id
    steps_tool_kit_option_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const weightToolkitOptionSelectedFragment = gql`
  fragment weight_tool_kit_option_selected on weight_tool_kit_option_selected_by_user {
    weight
    created_at
    updated_at
    id
    schedule_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const sportsToolkitOptionSelectedFragment = gql`
  fragment sports_tool_kit_option_selected on sports_tool_kit_option_selected_by_user {
    created_at
    updated_at
    id
    schedule_id
    sports_tool_kit_option_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Fragment are used in @function getToolkitOptionsSelectedQuery()
 */
export const alcoholToolkitOptionSelectedFragment = gql`
  fragment alcohol_tool_kit_option_selected on alcohol_tool_kit_option_selected_by_user {
    created_at
    updated_at
    alcohol_tool_kit_option_id
    id
    schedule_id
    tool_kit_id
    user_id
  }
`;

/**
 * @deprecated Unused Fragment
 */
export const weightToolkitOptionsFrgament = gql`
  fragment weight_tool_kit_option on weight_tool_kit_options {
    maximum_angle
    starting_angle
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

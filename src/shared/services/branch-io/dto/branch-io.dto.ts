export class CreateDeepLinkUrlResponse {
  url: string;
}

/**
 * @description https://help.branch.io/developers-hub/reference/createdeeplinkurl
 */
export class CreateDeepLinkBody {
  branch_key: string;
  data: DeepLinkData;
  channel?: string;
  feature?: string;
  campaign?: string;
  stage?: string;
  tags?: string[];
  type?: number;
  alias?: string;
  duration?: number;
  analytics?: DeepLinkAnalytics;
}

export class DeepLinkAnalytics {
  '~channel'?: string;
  '~feature'?: string;
  '~campaign'?: string;
  '~campaign_id'?: string;
  '~customer_campaign'?: string;
  '~stage'?: string;
  '~tags'?: string[];
  '~secondary_publisher'?: string;
  '~customer_secondary_publisher'?: string;
  '~creative_name'?: string;
  '~creative_id'?: string;
  '~ad_set_name'?: string;
  '~ad_set_id'?: string;
  '~customer_ad_set_name'?: string;
  '~ad_name'?: string;
  '~ad_id'?: string;
  '~customer_ad_name'?: string;
  '~keyword'?: string;
  '~keyword_id'?: string;
  '~customer_keyword'?: string;
  '~placement'?: string;
  '~placement_id'?: string;
  '~customer_placement'?: string;
  '~sub_site_name'?: string;
  '~customer_sub_site_name'?: string;
}

export class DeepLinkData {
  $deeplink_path?: string;
  $fallback_url?: string;
  $fallback_url_xx?: string;
  $desktop_url?: string;
  $ios_url?: string;
  $ios_url_xx?: string;
  $ipad_url?: string;
  $android_url?: string;
  $android_url_xx?: string;
  $samsung_url?: string;
  $huawei_url?: string;
  $windows_phone_url?: string;
  $blackberry_url?: string;
  $fire_url?: string;
  $ios_wechat_url?: string;
  $android_wechat_url?: string;
  $web_only?: boolean;
  $desktop_web_only?: boolean;
  $mobile_web_only?: boolean;
  $after_click_url?: string;
  $afterclick_desktop_url?: boolean;
  $canonical_url?: string;
  $og_title?: string;
  $og_description?: string;
  $og_image_url?: string;
}

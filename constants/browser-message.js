class BrowserMessage {

  // Popup - Popup Iframe
  static PI_INIT_ADD_EXCEPT_SITE() { return 'REDSTOP_PI_INIT_ADD_EXCEPT_SITE'; }
  static PI_INIT_POPUP_HEIGHT() { return 'REDSTOP_PI_INIT_POPUP_HEIGHT'; }
  static PI_CLOSE_POPUP() { return 'REDSTOP_PI_CLOSE_POPUP'; }

  // Popup - Background
  static PB_UPDATE_BROWSER_ICON() { return 'REDSTOP_PB_UPDATE_BROWSER_ICON'; }
  static PB_REQUEST_WEBSITE_DATA() { return 'REDSTOP_PB_REQUEST_WEBSITE_DATA'; }
  static PB_RETURN_WEBSITE_DATA() { return 'REDSTOP_PB_RETURN_WEBSITE_DATA'; }
  static PB_CLOSE_POPUP() { return 'REDSTOP_PB_CLOSE_POPUP'; }
  static PB_OPEN_WEBSITE() { return 'REDSTOP_PB_OPEN_WEBSITE'; }
  static PB_OPEN_SUGGESTION() { return 'REDSTOP_PB_OPEN_SUGGESTION'; }

  // Background - Content
  static BC_SHOW_NOTIFICATION() { return 'REDSTOP_BC_SHOW_NOTIFICATION'; }
  static BC_CHECK_CONTENT() { return 'REDSTOP_BC_CHECK_CONTENT'; }
  static BC_SELECTION() { return 'REDSTOP_BC_SELECTION'; }

  // Background - Option
  static BO_UPDATE_DB_START() { return 'REDSTOP_BO_UPDATE_DB_START'; }
  static BO_UPDATE_DB_FINISH() { return 'REDSTOP_BO_UPDATE_DB_FINISH'; }

  // Option - Option Iframe
  static OI_UPDATE_DARK_MODE() { return 'REDSTOP_OI_UPDATE_DARK_MODE'; }
  static OI_UPDATE_DB_START() { return 'REDSTOP_OI_UPDATE_DB_START'; }
  static OI_UPDATE_DB_FINISH() { return 'REDSTOP_OI_UPDATE_DB_FINISH'; }

}

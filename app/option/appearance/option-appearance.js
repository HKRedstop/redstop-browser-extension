(function() {

  /* Onload Event */
  window.onload = function() {
    // dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDarkMode = urlParams.get('darkMode') == 'true';
    if (isDarkMode) document.body.classList.add('redstop-dark-mode');

    // layout
    initAppearanceCheckbox('menu-dark-mode', StorageKey.APPEARANCE_MENU_DARK_MODE(), BrowserMessage.OI_UPDATE_DARK_MODE());
    initAppearanceCheckbox('notification-dark-mode', StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE());
    initAppearanceNotificationPosition();
    initAppearanceAutoHide();
  }

  /* Common Appearance Setting */
  function initAppearanceCheckbox(id, storageKey, parentMesssageCode) {
    const checkboxId = 'redstop-option-appearance-' + id + '-checkbox';
    const checkbox = document.getElementById(checkboxId);

    // init function checkbox
    chrome.storage.sync.get(storageKey, (data) => {
      if (data && (storageKey in data) && data[storageKey]) {
        checkbox.checked = true;
      }
    });

    // init function checkbox change listener
    checkbox.addEventListener('change', function(e) {
      const storeValue = {};
      storeValue[storageKey] = e.target.checked;
      chrome.storage.sync.set(storeValue);

      // send message to parent
      window.parent.postMessage({
        code: parentMesssageCode
      });
    });
  }


  /* Notification Position */
  function initAppearanceNotificationPosition() {
    // init notification position radio
    chrome.storage.sync.get(StorageKey.APPEARANCE_NOTIFICATION_POSITION(), (data) => {
      if (data && (StorageKey.APPEARANCE_NOTIFICATION_POSITION() in data)) {
        const notificationPosition = data[StorageKey.APPEARANCE_NOTIFICATION_POSITION()];

        if (notificationPosition === NotificationPosition.TOP_LEFT()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-tl');
          checkAppearanceNotificationPositionRadio('mobile-radio-t');
        }
        else if (notificationPosition === NotificationPosition.TOP_MIDDLE()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-tm');
          checkAppearanceNotificationPositionRadio('mobile-radio-t');
        }
        else if (notificationPosition === NotificationPosition.TOP_RIGHT()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-tr');
          checkAppearanceNotificationPositionRadio('mobile-radio-t');
        }
        else if (notificationPosition === NotificationPosition.BOTTOM_LEFT()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-bl');
          checkAppearanceNotificationPositionRadio('mobile-radio-b');
        }
        else if (notificationPosition === NotificationPosition.BOTTOM_MIDDLE()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-bm');
          checkAppearanceNotificationPositionRadio('mobile-radio-b');
        }
        else if (notificationPosition === NotificationPosition.BOTTOM_RIGHT()) {
          checkAppearanceNotificationPositionRadio('desktop-radio-br');
          checkAppearanceNotificationPositionRadio('mobile-radio-b');
        }
      }
    });

    // init notification position change listener
    initAppearanceNotificationPositionRadioListener('desktop-radio-tl', NotificationPosition.TOP_LEFT(), 'mobile-radio-t');
    initAppearanceNotificationPositionRadioListener('desktop-radio-tm', NotificationPosition.TOP_MIDDLE(), 'mobile-radio-t');
    initAppearanceNotificationPositionRadioListener('desktop-radio-tr', NotificationPosition.TOP_RIGHT(), 'mobile-radio-t');
    initAppearanceNotificationPositionRadioListener('desktop-radio-bl', NotificationPosition.BOTTOM_LEFT(), 'mobile-radio-b');
    initAppearanceNotificationPositionRadioListener('desktop-radio-bm', NotificationPosition.BOTTOM_MIDDLE(), 'mobile-radio-b');
    initAppearanceNotificationPositionRadioListener('desktop-radio-br', NotificationPosition.BOTTOM_RIGHT(), 'mobile-radio-b');

    initAppearanceNotificationPositionRadioListener('mobile-radio-t', NotificationPosition.TOP_MIDDLE(), 'desktop-radio-tm');
    initAppearanceNotificationPositionRadioListener('mobile-radio-b', NotificationPosition.BOTTOM_MIDDLE(), 'desktop-radio-bm');
  }

  function checkAppearanceNotificationPositionRadio(id) {
    const radioId = 'redstop-option-appearance-position-' + id;
    const radio = document.getElementById(radioId);
    radio.checked = true;
  }

  function initAppearanceNotificationPositionRadioListener(id, notificationPosition, relatedId) {
    const radioId = 'redstop-option-appearance-position-' + id;
    const radio = document.getElementById(radioId);
    radio.addEventListener('change', function() {
      // save to storage
      const storeValue = {};
      storeValue[StorageKey.APPEARANCE_NOTIFICATION_POSITION()] = notificationPosition;
      chrome.storage.sync.set(storeValue);

      // update related checkbox
      if (relatedId) {
        const relatedRadioId = 'redstop-option-appearance-position-' + relatedId;
        const relatedRadio = document.getElementById(relatedRadioId);
        relatedRadio.checked = true;
      }
    });
  }


  /* Auto Hide */
  function initAppearanceAutoHide() {
    const autoHideCheckbox = document.getElementById('redstop-option-appearance-auto-hide-checkbox');
    const autoHideTimeContainer = document.getElementById('redstop-option-appearance-auto-hide-time-container');
    const autoHideTime = document.getElementById('redstop-option-appearance-auto-hide-time');

    // init auto hide checkbox and time
    chrome.storage.sync.get([ StorageKey.APPEARANCE_AUTO_HIDE(), StorageKey.APPEARANCE_AUTO_HIDE_TIME() ], (data) => {
      // checkbox
      if (data && (StorageKey.APPEARANCE_AUTO_HIDE() in data)) {
        if (data[StorageKey.APPEARANCE_AUTO_HIDE()]) {
          autoHideCheckbox.checked = true;
          autoHideTimeContainer.classList.add('redstop-option-appearance-auto-hide-time-container-show');
        }
      }

      // time
      if (data && (StorageKey.APPEARANCE_AUTO_HIDE_TIME() in data)) autoHideTime.value = data[StorageKey.APPEARANCE_AUTO_HIDE_TIME()];
    });

    // init auto hide checkbox change listener
    autoHideCheckbox.addEventListener('change', function(e) {
      // save to storage
      const storeValue = {};
      storeValue[StorageKey.APPEARANCE_AUTO_HIDE()] = e.target.checked;
      chrome.storage.sync.set(storeValue);

      // show auto hide time
      const autoHideTimeContainer = document.getElementById('redstop-option-appearance-auto-hide-time-container');
      if (e.target.checked) autoHideTimeContainer.classList.add('redstop-option-appearance-auto-hide-time-container-show');
      else autoHideTimeContainer.classList.remove('redstop-option-appearance-auto-hide-time-container-show');
    });

    // focus auto hide time to accept integer only
    autoHideTime.addEventListener('keypress', function(e) {
      if (!e.target.value && e.keyCode === 48) e.returnValue = false;
      else if (e.keyCode < 48 || e.keyCode > 57) e.returnValue = false;
    });

    // init auto hide time change listener
    autoHideTime.addEventListener('change', function(e) {
      // default value
      if (!e.target.value) e.target.value = 5;

      // save to storage
      const storeValue = {};
      storeValue[StorageKey.APPEARANCE_AUTO_HIDE_TIME()] = e.target.value;
      chrome.storage.sync.set(storeValue);
    });
  }

})()

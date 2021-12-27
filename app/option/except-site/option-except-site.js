(function() {

  var activeMenuItemId;
  var activeStorageKey;
  var editor;
  var originalValue;


  /* Onload Event */
  window.onload = function() {
    // dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDarkMode = urlParams.get('darkMode') == 'true';
    if (isDarkMode) document.body.classList.add('redstop-dark-mode');

    // editor (must before init menu)
    initEditor();

    // buttons
    initSaveButton();
    initResetButton();
    setButtonsEnable(false);

    // menu
    initMenuItem('redstop-option-except-site-menu-website', '網頁', StorageKey.EXCEPT_SITE_WEBSITE(), true);
    initMenuItem('redstop-option-except-site-menu-wiki', 'Wikipedia', StorageKey.EXCEPT_SITE_WIKI(), false);
    initMenuItem('redstop-option-except-site-menu-facebook', 'Facebook', StorageKey.EXCEPT_SITE_FACEBOOK(), false);
    initMenuItem('redstop-option-except-site-menu-ig', 'Instagram', StorageKey.EXCEPT_SITE_IG(), false);
    initMenuItem('redstop-option-except-site-menu-twitter', 'Twitter', StorageKey.EXCEPT_SITE_TWITTER(), false);
    initMenuItem('redstop-option-except-site-menu-openrice', 'Openrice', StorageKey.EXCEPT_SITE_OPENRICE(), false);
    initMenuItem('redstop-option-except-site-menu-ios-store', 'iOS商店', StorageKey.EXCEPT_SITE_IOS_STORE(), false);
    initMenuItem('redstop-option-except-site-menu-ios-app', 'iOS App', StorageKey.EXCEPT_SITE_IOS_APP(), false);
    initMenuItem('redstop-option-except-site-menu-android-store', 'Android商店', StorageKey.EXCEPT_SITE_ANDROID_STORE(), false);
    initMenuItem('redstop-option-except-site-menu-android-package', 'Android App', StorageKey.EXCEPT_SITE_ANDROID_PACKAGE(), false);
    initMenuItem('redstop-option-except-site-menu-steam-store', 'Steam商店', StorageKey.EXCEPT_SITE_STEAM_STORE(), false);
    initMenuItem('redstop-option-except-site-menu-steam-app', 'Steam遊戲', StorageKey.EXCEPT_SITE_STEAM_APP(), false);
    initMenuItem('redstop-option-except-site-menu-ps-app', 'PlayStation遊戲', StorageKey.EXCEPT_SITE_PS_APP(), false);
    initMenuItem('redstop-option-except-site-menu-xbox-app', 'Xbox遊戲', StorageKey.EXCEPT_SITE_XBOX_APP(), false);
    initMenuItem('redstop-option-except-site-menu-switch-app', 'Switch遊戲', StorageKey.EXCEPT_SITE_SWITCH_APP(), false);
  }


  /* Menu */
  function initMenuItem(id, title, storageKey, defaultActive) {
    // set default active
    if (defaultActive) setMenuItemActive(id, title, storageKey);

    // add click listener
    const menuItem = document.getElementById(id);
    menuItem.addEventListener('click', function() { setMenuItemActive(id, title, storageKey); });
  }

  function setMenuItemActive(id, title, storageKey) {
    // check if click same menu item
    if (activeMenuItemId && activeMenuItemId === id) return;

    // check if value change
    if (isValueChanged()) {
      if (!confirm('你並未儲存名單，是否捨棄已作出的更改？')) return;
    }

    // update menu class
    const menu = document.getElementById('redstop-option-except-site-menu');
    for (const menuItem of menu.children) {
      if (menuItem.id) {
        if (menuItem.id === id) {
          activeMenuItemId = id;
          activeStorageKey = storageKey;
          menuItem.classList.add('redstop-option-except-site-menu-item-active');
        }
        else {
          menuItem.classList.remove('redstop-option-except-site-menu-item-active');
        }
      }
    }

    // update title
    const titleElement = document.getElementById('redstop-option-except-site-content-title-text');
    titleElement.innerHTML = title;

    // update editor
    if (storageKey) reloadEditorValue(storageKey);
  }


  /* Buttons */
  function initSaveButton() {
    const saveButton = document.getElementById('redstop-option-except-site-content-save-button');
    saveButton.addEventListener('click', performSaveAction);
  }

  function performSaveAction() {
    if (activeStorageKey) {
      // - trim all lines
      // - remove all spaces
      // - remove http:// or https://
      // - remove all content after / ? #
      // - remove empty lines
      // - remove duplicated line
      var finalValue = '';
      const checkDuplicateList = [];
      const value = editor.getDoc().getValue();
      const lines = value.split('\n');

      for (const line of lines) {
        var formatLine = line.trim();
        formatLine = formatLine.replaceAll(' ', '');

        if (formatLine.startsWith('http://')) formatLine = formatLine.substring(7);
        if (formatLine.startsWith('https://')) formatLine = formatLine.substring(8);

        formatLine = formatLine.split('/')[0];
        formatLine = formatLine.split('?')[0];
        formatLine = formatLine.split('#')[0];

        if (formatLine != '' && !checkDuplicateList.includes(formatLine)) {
          if (finalValue != '') finalValue += '\n';
          finalValue += formatLine;
          checkDuplicateList.push(formatLine);
        }
      }

      // reset original value
      originalValue = finalValue;

      // save to storage
      const storeValue = {};
      storeValue[activeStorageKey] = finalValue;
      chrome.storage.sync.set(storeValue, () => {
        // reload editor value
        reloadEditorValue(activeStorageKey);

        // set buttons to disable
        setButtonsEnable(false);
      });
    }
  }

  function initResetButton() {
    const resetButton = document.getElementById('redstop-option-except-site-content-reset-button');
    resetButton.addEventListener('click', function() {
      if (activeStorageKey) {
        // reload editor value
        reloadEditorValue(activeStorageKey);

        // set buttons to disable
        setButtonsEnable(false);
      }
    });
  }

  function setButtonsEnable(enabled) {
    setButtonEnable('redstop-option-except-site-content-save-button', enabled);
    setButtonEnable('redstop-option-except-site-content-reset-button', enabled);
  }

  function setButtonEnable(id, enabled) {
    const button = document.getElementById(id);
    button.disabled = !enabled;
  }


  /* Editor */
  function initEditor() {
    const editorElement = document.getElementById('redstop-option-except-site-content-editor');
    editor = CodeMirror(editorElement, {
      lineNumbers: true,
      styleActiveLine: true,
      extraKeys: {
        "Ctrl-S": performSaveAction
      }
    });

    // add change listener
    editor.on('change', function() {
      setButtonsEnable(isValueChanged());
    });

    // bug of codeMirror:
    // - cannot highlight if editor init before come to visible
    // - need to refresh when first focus
    editor.on('focus', function() {
      refreshEditor();
      editor.off('focus');
    });

    // refresh editor
    refreshEditor();
  }

  function reloadEditorValue(storageKey) {
    chrome.storage.sync.get(storageKey, (data) => {
      if (data && (storageKey in data)) {
        originalValue = data[storageKey];
        editor.getDoc().setValue(originalValue);

        // refresh editor
        refreshEditor();
      }
    });
  }

  function refreshEditor() {
    // need settimeout to refresh for editor to work
    setTimeout(() => { editor.refresh(); }, 100);
  }

  function isValueChanged() {
    const checkValue = !originalValue ? '' : originalValue;
    const currentValue = editor ? editor.getDoc().getValue() : '';
    return checkValue != currentValue;
  }

})()

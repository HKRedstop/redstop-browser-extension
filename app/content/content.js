(function() {

	const CONTAINER_ID = 'redstop-notifications-container';
	var autoHideTimer;


  /* Get Message from background.js */
	chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.code === BrowserMessage.BC_SHOW_NOTIFICATION()) {
      showNotifications(msg.results, null, msg.isDarkMode);
    }
		else if (msg.code === BrowserMessage.BC_CHECK_CONTENT()) {
			checkContent(msg.domain, msg.isDarkMode, msg.checkDomainCn, msg.checkChinaIcp);
		}
  });


	/* Selection Event */
	document.addEventListener('selectionchange', function() {
		const selection = window.getSelection().toString().trim();

		// prevent extension updated and lose connection
		if (chrome.runtime?.id) {
			chrome.runtime.sendMessage({
				code: BrowserMessage.BC_SELECTION(),
				selection: selection
			});
		}
	});


	/* Check Content */
	function checkContent(domain, isDarkMode, checkDomainCn, checkChinaIcp) {
		const messages = [];

		// 1. website ends with .cn
		if (checkDomainCn && domain && domain.endsWith('.cn')) messages.push('網域名稱是中國 .cn');

		// 2. contain china icp number
		if (checkChinaIcp) {
			const bodyContent = document.body.innerHTML;
			const icpMatch = bodyContent.match(/([\u7f51\u7db2]\u5b89|ICP)\s*[\u5907\u5099]\s*[0-9]+\s*[\u865F\u53F7]?/i);
			if (icpMatch) messages.push('網站含有中國網安備 / ICP備');
		}

		// show notifications
		if (messages) showNotifications(null, messages, isDarkMode);
		else removeAllNotifications();
	}


	/* Remove Notifications */
	function removeAllNotifications() {
    const container = document.getElementById(CONTAINER_ID);
		if (container) {
			document.body.removeChild(container);
		}
	}


	/* Show Notifications */
  function showNotifications(results, messages, isDarkMode) {
		// clear previous auto hide timer
		clearAutoHideTimer();

		// remove previous notifications first
		removeAllNotifications();

		if ((results && results.length > 0) || (messages && messages.length > 0)) {
	    // container
	    const container = document.createElement('div');
	    container.id = CONTAINER_ID;
	    container.classList.add('redstop-notifications-container');
			container.classList.add('redstop-noselect');
			if (isDarkMode) container.classList.add('redstop-dark-mode');
			getContainerPosition(container);

	    // boxs
			if (results && results.length > 0) {
		    for (const result of results) {
		      container.append(buildNotificationResultBox(result));
		    }
			}

			if (messages && messages.length > 0) {
				var i = 1;
				for (const message of messages) {
					container.append(buildNotificationMessageBox(i++, message));
				}
			}

	    document.body.append(container);

			// auto hide
			setAutoHideTimer();
		}
  }

	function getContainerPosition(container) {
		chrome.storage.sync.get(StorageKey.APPEARANCE_NOTIFICATION_POSITION(), (data) => {
			var containerPosition;
			if (data && (StorageKey.APPEARANCE_NOTIFICATION_POSITION() in data)) containerPosition = data[StorageKey.APPEARANCE_NOTIFICATION_POSITION()];
			if (!containerPosition) containerPosition = NotificationPosition.BOTTOM_RIGHT();

			// add class to container
			if (containerPosition === NotificationPosition.TOP_LEFT()) container.classList.add('redstop-notifications-container-tl');
			else if (containerPosition === NotificationPosition.TOP_MIDDLE()) container.classList.add('redstop-notifications-container-tm');
			else if (containerPosition === NotificationPosition.TOP_RIGHT()) container.classList.add('redstop-notifications-container-tr');
			else if (containerPosition === NotificationPosition.BOTTOM_LEFT()) container.classList.add('redstop-notifications-container-bl');
			else if (containerPosition === NotificationPosition.BOTTOM_MIDDLE()) container.classList.add('redstop-notifications-container-bm');
			else if (containerPosition === NotificationPosition.BOTTOM_RIGHT()) container.classList.add('redstop-notifications-container-br');
		});
	}

	function commonBuildNotificationBox(id, redStar, isOpenWebsite) {
		// box link
		const boxLink = document.createElement('a');
		boxLink.id = 'redstop-notification-box-link-' + id;
		boxLink.classList.add('redstop-notification-box-link');
		if (isOpenWebsite) {
			boxLink.href = 'https://www.redstop.info/info/' + id;
			boxLink.target = '_blank';
		}
		else {
			boxLink.classList.add('redstop-notification-box-link-disabled');
		}

		// box
    const box = document.createElement('div');
		box.id = 'redstop-notification-box-' + id;
    box.classList.add('redstop-notification-box');
    box.classList.add('redstop-notification-box-star-' + redStar);
		boxLink.append(box);

    // close button
    const closeButton = document.createElement('div');
    closeButton.classList.add('redstop-close-button');
    closeButton.addEventListener('click', function(e) { closeBox(e, boxLink.id, box.id); });
    box.append(closeButton);

		const closeButtonLink = document.createElement('a');
    closeButtonLink.classList.add('redstop-close-button-link');
		closeButtonLink.href = "close:";
		closeButton.append(closeButtonLink);

		const closeButtonIcon = document.createElement('img');
		closeButtonIcon.classList.add('redstop-close-button-icon');
		closeButtonIcon.src = chrome.runtime.getURL('/images/icon/close.png');
		closeButtonLink.append(closeButtonIcon);

		return [boxLink, box];
	}

  function buildNotificationResultBox(result) {
		// box
    const [boxLink, box] = commonBuildNotificationBox(result.companyCode, result.redStar, true);

    // box inner
    const boxInner = document.createElement('div');
    boxInner.classList.add('redstop-notification-box-inner');
    box.append(boxInner);

    // logo
		const logoContainer = document.createElement('div');
		logoContainer.classList.add('redstop-logo-container');
		boxInner.append(logoContainer);

    const logo = document.createElement('img');
    logo.classList.add('redstop-logo');
    logo.src = 'https://image.redstop.info/redstop/images/red-company-thumbnail/' + result.groupCode + '/' + result.companyCode + '.jpg';
		logo.addEventListener('error', function() { logo.src = chrome.runtime.getURL('/images/other/no-logo.png'); });
    logoContainer.append(logo);

		// name
		const nameContainer = document.createElement('div');
		nameContainer.classList.add('redstop-name-container');
		boxInner.append(nameContainer);

		const nameText = document.createElement('div');
		nameText.classList.add('redstop-name');
		nameText.innerHTML = result.displayName;
		nameContainer.append(nameText);

		if (result.displaySubName) {
			const subNameText = document.createElement('div');
			subNameText.classList.add('redstop-sub-name');
			subNameText.innerHTML = result.displaySubName;
			nameContainer.append(subNameText);
		}

		// star
		const starContainer = document.createElement('div');
		starContainer.classList.add('redstop-star-container');
		boxInner.append(starContainer);

		const outlineStarUrl = chrome.runtime.getURL('/images/icon/star-outline.png');
		const fillStarUrl = chrome.runtime.getURL('/images/icon/star-fill.png');

		for (var i = 1; i <= 5; i++) {
			const star = document.createElement('img');
			star.classList.add('redstop-star');
			star.classList.add('redstop-star-' + result.redStar);
			star.src = (i <= result.redStar) ? fillStarUrl : outlineStarUrl;
			starContainer.append(star);
		}

    return boxLink;
  }

	function buildNotificationMessageBox(id, message) {
		// box
    const [boxLink, box] = commonBuildNotificationBox(id, 5, false);

		// message
		const messageDiv = document.createElement('div');
		messageDiv.classList.add('redstop-notification-box-message');
		messageDiv.innerHTML = message;
		box.append(messageDiv);

		return boxLink;
	}


	/* Close Box */
  function closeBox(e, boxLinkId, boxId) {
		e.preventDefault();
		e.stopPropagation();

    const container = document.getElementById(CONTAINER_ID);
		const boxLink = document.getElementById(boxLinkId);
    const box = document.getElementById(boxId);
		const boxStyle = window.getComputedStyle ? getComputedStyle(box, null) : box.currentStyle;
		const boxHeight = box.offsetHeight + parseInt(boxStyle.marginTop) + parseInt(boxStyle.marginBottom);

		// insert space
		const space = document.createElement('div');
		space.classList.add('redstop-notification-box-remove-space');
		space.style.height = boxHeight + 'px';
		container.insertBefore(space, boxLink.nextSibling);

		// remove box
    container.removeChild(boxLink);

		// set timeout for space to collapse
		setTimeout(() => { space.style.height = '0px'; }, 1);
  }


	/* Auto Hide */
	function clearAutoHideTimer() {
		if (autoHideTimer) {
			clearTimeout(autoHideTimer);
			autoHideTimer = null;
		}
	}

	function setAutoHideTimer() {
		chrome.storage.sync.get([ StorageKey.APPEARANCE_AUTO_HIDE(), StorageKey.APPEARANCE_AUTO_HIDE_TIME() ], (data) => {
			if (data && (StorageKey.APPEARANCE_AUTO_HIDE() in data) && data[StorageKey.APPEARANCE_AUTO_HIDE()] && (StorageKey.APPEARANCE_AUTO_HIDE_TIME() in data)) {
				// get auto hide time
				const autoHideSecond = parseInt(data[StorageKey.APPEARANCE_AUTO_HIDE_TIME()]);
				if (!autoHideSecond) autoHideSecond = 5;

				// setup auto hide timer
				autoHideTimer = setTimeout(() => {
					autoHideTimer = null;

					const container = document.getElementById(CONTAINER_ID);
					if (container) container.classList.add('redstop-notifications-container-hide');

					// remove container after 0.4s, equal to css transition
					setTimeout(() => { removeAllNotifications(); }, 400);
				}, autoHideSecond * 1000);
			}
		});
	}


})()

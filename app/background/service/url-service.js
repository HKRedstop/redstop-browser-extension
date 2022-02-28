class UrlService {

  constructor() {}


  /* Extract URL Data */
  extractUrl(value) {
    const data = {};
    const match = value.match(/^(https?\:\/\/)?([a-z0-9\-\_]+(\.[a-z0-9\-\_]+)+)(\:[0-9]+)?([\/\?\#].*)?$/i);

    if (match) {
      const domain = match[2];
      const param = match[5] ? match[5].substring(1) : null;
      data.website = domain;

      // wiki: {language}.wikipedia.org/wiki/{id}
      // 1. need to convert special char
      var wikiId = this.extractExtension(domain, param, 'wikipedia.org', /^[a-z0-9\_\-]+\/([^\?\#]+)([\?\#].*)?$/i, 1);
      wikiId = this.convertSpecialChar(wikiId);
      if (wikiId) data.wikiId = wikiId;

      // facebook: {language}.facebook.com/(pg/|pages/category/{name}/)?{id}
      var facebookId = this.extractExtension(domain, param, 'facebook.com', /^(pg\/|pages\/category\/[^\/]+\/)?([^\/\?\#]+)([\/\?\#].*)?$/i, 2);
      if (facebookId) data.facebookId = facebookId;

      // ig: www.instagram.com/{id}
      var igId = this.extractExtension(domain, param, 'instagram.com', /^([^\/\?\#]+)([\/\?\#].*)?$/i, 1);
      if (igId) data.igId = igId;

      // twitter: www.twitter.com/{id}
      var twitterId = this.extractExtension(domain, param, 'twitter.com', /^([^\/\?\#]+)([\/\?\#].*)?$/i, 1);
      if (twitterId) data.twitterId = twitterId;

      // openrice: www.openrice.com/{language}/hongkong/r-{name}-{id: r[0-9]+}
      var openriceId = this.extractExtension(domain, param, 'openrice.com', /^[a-z0-9\_\-]+\/hongkong\/r\-.+\-(r[0-9]+)([\/\?\#].*)?$/i, 1);
      if (openriceId) data.openriceId = openriceId;

      // ios store: apps.apple.com/{language}?/developer/{name}?/{id: id[0-9]+}
      var iosStoreId = this.extractExtension(domain, param, 'apps.apple.com', /^([a-z0-9\_\-]+\/)?developer\/([^\/]+\/)?(id[0-9]+)([\/\?\#].*)?$/i, 3);
      if (iosStoreId) data.iosStoreId = iosStoreId;

      // ios app: apps.apple.com/{language}?/(app|app-bundle)/{name}?/{id: id[0-9]+}
      var iosAppId = this.extractExtension(domain, param, 'apps.apple.com', /^([a-z0-9\_\-]+\/)?(app|app\-bundle)\/([^\/]+\/)?(id[0-9]+)([\/\?\#].*)?$/i, 4);
      if (iosAppId) data.iosAppId = iosAppId;

      // android store: play.google.com/store/(apps/(dev|developer)|books/author)?{queryParam: id={id}}
      // 1. can contain /
      // 2. need to convert special char
      const androidStoreQueryParamStr = this.extractExtension(domain, param, 'play.google.com', /^store\/(apps\/(dev|developer)|books\/author)\?([^\?\#]+)(\#.*)?$/i, 3);
      var androidStoreId = this.extractQueryParam(androidStoreQueryParamStr, 'id');
      androidStoreId = this.convertSpecialChar(androidStoreId);
      if (androidStoreId) data.androidStoreId = androidStoreId;

      // android package: play.google.com/store/apps/details?{queryParam: id={id}}
      const androidPackageQueryParamStr = this.extractExtension(domain, param, 'play.google.com', /^store\/apps\/details\?([^\/\?\#]+)(\#.*)?$/i, 1);
      var androidPackage = this.extractQueryParam(androidPackageQueryParamStr, 'id');
      if (androidPackage) data.androidPackage = androidPackage;

      // steam store: store.steampowered.com/(developer|publisher|curator|franchise)/{id}
      // 1. need to convert special char
      var steamStoreId = this.extractExtension(domain, param, 'store.steampowered.com', /^(developer|publisher|curator|franchise)\/([^\/\?\#]+)([\/\?\#].*)?$/i, 2);
      steamStoreId = this.convertSpecialChar(steamStoreId);
      if (steamStoreId) data.steamStoreId = steamStoreId;

      // steam app: store.steampowered.com/agecheck?/app/{id: [0-9]}
      var steamAppId = this.extractExtension(domain, param, 'store.steampowered.com', /^(agecheck\/)?app\/([0-9]+)([\/\?\#].*)?$/i, 2);
      if (steamAppId) data.steamAppId = steamAppId;

      // ps app:
      // (www|store).playstation.com/{language}/(games|concept|editorial/this-month-on-playstation)/{id}
      // {www|store}.playstation.com/{language}/product/{id: [a-z0-9\-]+}_[a-z0-9\-]+
      var psAppId = this.extractExtension(domain, param, 'playstation.com', /^[a-z0-9\_\-]+\/(games|concept|editorial\/this\-month\-on\-playstation)\/([^\/\?\#]+)([\/\?\#].*)?$/i, 2);
      if (!psAppId) psAppId = this.extractExtension(domain, param, 'playstation.com', /^[a-z0-9\_\-]+\/product\/([a-z0-9\-]+)\_[a-z0-9\-]+([\/\?\#].*)?$/i, 1);
      if (psAppId) data.psAppId = psAppId;

      // xbox app:
      // (www|marketplace).xbox.com/{language}/(games|product)/store?/{id}
      // www.microsoft.com/{language}/p/{id}
      var xboxAppId = this.extractExtension(domain, param, 'xbox.com', /^[a-z0-9\_\-]+\/(games|product)\/(store\/)?([^\/\?\#]+)([\/\?\#].*)?$/i, 3);
      if (!xboxAppId) xboxAppId = this.extractExtension(domain, param, 'microsoft.com', /^[a-z0-9\_\-]+\/p\/([^\/\?\#]+)([\/\?\#].*)?$/i, 1);
      if (xboxAppId) data.xboxAppId = xboxAppId;

      // switch app:
      // (www|store).nintendo.com.hk/switch?/{id}
      // www.nintendo.com/{language}?/(games/detail|{name}/titles|store/products)/{id}
      // www.nintendo.co.uk/games/{systemType}/{id}.html
      // store-jp.nintendo.com/list/software/{id}.html
      var switchAppId = this.extractExtension(domain, param, 'nintendo.com.hk', /^(switch\/)?([^\/\?\#]+)([\/\?\#].*)?$/i, 2);
      if (!switchAppId) switchAppId = this.extractExtension(domain, param, 'nintendo.com', /^([a-z0-9\_\-]+\/)?(games\/detail|[^\/]+\/titles|store\/products)\/([^\/\?\#]+)([\/\?\#].*)?$/i, 3);
      if (!switchAppId) switchAppId = this.extractExtension(domain, param, 'nintendo.co.uk', /^games\/[^\/]+\/([^\/\?\#\.]+)\.html([\/\?\#].*)?$/i, 1);
      if (!switchAppId) switchAppId = this.extractExtension(domain, param, 'store-jp.nintendo.com', /^list\/software\/([^\/\?\#\.]+)\.html([\/\?\#].*)?$/i, 1);
      if (switchAppId) data.switchAppId = switchAppId;
    }

    return data;
  }

  extractExtension(domain, param, matchDomain, matchRegex, matchGroup) {
    if (domain && param && domain.endsWith(matchDomain)) {
      const match = param.match(matchRegex);
      if (match) {
        const id = match[matchGroup];
        if (id) return decodeURI(id);
      }
    }
    return null;
  }

  extractQueryParam(queryParamStr, idKey) {
    if (queryParamStr && idKey) {
      // split by &
      const queryParams = queryParamStr.split('&');
      for (const param of queryParams) {
        // split by =
        const keyValuePairs = param.split('=');
        if (keyValuePairs && keyValuePairs.length === 2 && keyValuePairs[0].toLowerCase() === idKey.toLowerCase()) {
          if (keyValuePairs[1]) return decodeURI(keyValuePairs[1]);
        }
      }
    }
    return null;
  }

  convertSpecialChar(value) {
    if (value) value = value.replace(/%26/gi, '&');
    if (value) value = value.replace(/%C2%AE/gi, '®');
    if (value) value = value.replace(/\r?\n/gi, '');
    return value;
  }


  /* Special Rule: Wiki */
  isWiki(url) {
    return url.match(/^(https?\:\/\/)?[a-z0-9\-_]+.wikipedia\.org\/.+$/i);
  }


  /* Special Rule: Google Map */
  isGoogleMap(url) {
    return url.match(/^(https?\:\/\/)?www\.google\.com(\.[A-Za-z]+)?\/maps\/.+$/i);
  }


  /* Function Enable */
  checkFunctionEnable(data, enableWiki, enableFacebook, enableIg, enableTwitter, enableOpenrice,
      enableIos, enableAndroid, enableSteam, enablePs, enableXbox, enableSwitch) {
    if (!enableWiki) delete data.wikiId;
    if (!enableFacebook) delete data.facebookId;
    if (!enableIg) delete data.idId;
    if (!enableTwitter) delete data.twitterId;
    if (!enableOpenrice) delete data.openriceId;
    if (!enableIos) {
      delete data.iosStoreId;
      delete data.iosAppId;
    }
    if (!enableAndroid) {
      delete data.androidStoreId;
      delete data.androidPackage;
    }
    if (!enableSteam) {
      delete data.steamStoreId;
      delete data.steamAppId;
    }
    if (!enablePs) delete data.psAppId;
    if (!enableXbox) delete data.xboxAppId;
    if (!enableSwitch) delete data.switchAppId;
  }


  /* Except Site */
  checkExceptSite(data, websiteExceptSiteStr, wikiExceptSiteStr,
      facebookExceptSiteStr, igExceptSiteStr, twitterExceptSiteStr, openriceExceptSiteStr,
      iosStoreExceptSiteStr, iosAppExceptSiteStr, androidStoreExceptSiteStr, androidPackageExceptSiteStr,
      steamStoreExceptSiteStr, steamAppExceptSiteStr, psAppExceptSiteStr, xboxAppExceptSiteStr, switchAppExceptSiteStr) {
    if (this.isMatchExceptSite(data.website, websiteExceptSiteStr)) delete data.website;
    if (this.isMatchExceptSite(data.wikiId, wikiExceptSiteStr)) delete data.wikiId;
    if (this.isMatchExceptSite(data.facebookId, facebookExceptSiteStr)) delete data.facebookId;
    if (this.isMatchExceptSite(data.igId, igExceptSiteStr)) delete data.igId;
    if (this.isMatchExceptSite(data.twitterId, twitterExceptSiteStr)) delete data.twitterId;
    if (this.isMatchExceptSite(data.openriceId, openriceExceptSiteStr)) delete data.openriceId;
    if (this.isMatchExceptSite(data.iosStoreId, iosStoreExceptSiteStr)) delete data.iosStoreId;
    if (this.isMatchExceptSite(data.iosAppId, iosAppExceptSiteStr)) delete data.iosAppId;
    if (this.isMatchExceptSite(data.androidStoreId, androidStoreExceptSiteStr)) delete data.androidStoreId;
    if (this.isMatchExceptSite(data.androidPackage, androidPackageExceptSiteStr)) delete data.androidPackage;
    if (this.isMatchExceptSite(data.steamStoreId, steamStoreExceptSiteStr)) delete data.steamStoreId;
    if (this.isMatchExceptSite(data.steamAppId, steamAppExceptSiteStr)) delete data.steamAppId;
    if (this.isMatchExceptSite(data.psAppId, psAppExceptSiteStr)) delete data.psAppId;
    if (this.isMatchExceptSite(data.xboxAppId, xboxAppExceptSiteStr)) delete data.xboxAppId;
    if (this.isMatchExceptSite(data.switchAppId, switchAppExceptSiteStr)) delete data.switchAppId;
  }

  isMatchExceptSite(value, exceptSiteStr) {
    if (value && exceptSiteStr) {
      const exceptSites = exceptSiteStr.split('\n');
      for (const exceptSite of exceptSites) {
        // change to regex for wildcard
        var exceptSiteRegexStr = exceptSite.toUpperCase().replace(".", "\\.").replace("*", ".*");
        const exceptSiteRegex = new RegExp('^' + exceptSiteRegexStr + '$');

        // test
        if (value.toUpperCase().match(exceptSiteRegex)) return true;
      }
    }
    return false;
  }

}

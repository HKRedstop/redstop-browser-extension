class WebService {

  static API_URL = 'https://api.redstop.info/redstop/jaxrs';
  static DATA_JSON_URL = 'https://image.redstop.info/redstop/data-json/v1';

  constructor(logHelper) {
    this.logHelper = logHelper;
  }


  /* Check Website API */
  async checkWebsite(data) {
    return await this.doGet(WebService.API_URL + '/extension/check/v3?' + (new URLSearchParams(data)).toString());
  }


  /* Data Json */
  async getRedCompanyInfo() {
    return await this.doGet(WebService.DATA_JSON_URL + '/red-company-info.json');
  }

  async getRedCompanyWebsite() {
    return await this.doGet(WebService.DATA_JSON_URL + '/website.json');
  }

  async getRedCompanyWiki() {
    return await this.doGet(WebService.DATA_JSON_URL + '/wiki.json');
  }

  async getRedCompanyFacebook() {
    return await this.doGet(WebService.DATA_JSON_URL + '/facebook.json');
  }

  async getRedCompanyIg() {
    return await this.doGet(WebService.DATA_JSON_URL + '/ig.json');
  }

  async getRedCompanyTwitter() {
    return await this.doGet(WebService.DATA_JSON_URL + '/twitter.json');
  }

  async getRedCompanyOpenrice() {
    return await this.doGet(WebService.DATA_JSON_URL + '/openrice.json');
  }

  async getRedCompanyIosStore() {
    return await this.doGet(WebService.DATA_JSON_URL + '/ios-store.json');
  }

  async getRedCompanyIosApp() {
    return await this.doGet(WebService.DATA_JSON_URL + '/ios-app.json');
  }

  async getRedCompanyAndroidStore() {
    return await this.doGet(WebService.DATA_JSON_URL + '/android-store.json');
  }

  async getRedCompanyAndroidPackage() {
    return await this.doGet(WebService.DATA_JSON_URL + '/android-package.json');
  }

  async getRedCompanySteamStore() {
    return await this.doGet(WebService.DATA_JSON_URL + '/steam-store.json');
  }

  async getRedCompanySteamApp() {
    return await this.doGet(WebService.DATA_JSON_URL + '/steam-app.json');
  }

  async getRedCompanyPsApp() {
    return await this.doGet(WebService.DATA_JSON_URL + '/ps-app.json');
  }

  async getRedCompanyXboxApp() {
    return await this.doGet(WebService.DATA_JSON_URL + '/xbox-app.json');
  }

  async getRedCompanySwitchApp() {
    return await this.doGet(WebService.DATA_JSON_URL + '/switch-app.json');
  }


  /* Common */
  async doGet(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      this.logHelper.log('GET Error: ' + url)
      this.logHelper.log(error);
      return null;
    }
  }

}

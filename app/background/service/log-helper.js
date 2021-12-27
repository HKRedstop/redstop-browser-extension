class LogHelper {

  constructor() {
  }

  log(logData) {
    console.log(this.getDateTimeTag() + logData);
  }

  error(errorData) {
    console.error(this.getDateTimeTag() + 'Error', errorData);
  }

  getDateTimeTag() {
    const date = new Date();

    const year = date.getFullYear();

    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;

    let day = date.getDate();
    if (day < 10) day = '0' + day;

    let hour = date.getHours();
    if (hour < 10) hour = '0' + hour;

    let min = date.getMinutes();
    if (min < 10) min = '0' + min;

    let second = date.getSeconds();
    if (second < 10) second = '0' + second;

    const ms = date.getMilliseconds();
    let msStr = '';
    if (ms < 10) msStr = '00' + ms;
    else if (ms < 100) msStr = '0' + ms;
    else msStr = ms;

    return '[' + year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + second + ':' + msStr + '] ';
  }

}

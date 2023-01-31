/* global CryptoJS */
import axios from '/js/lib/axios.min.js';

const businessKey = 'admin';
const businessSecret = '12878dd962115106db6d';

export function request(options) {
  const { url, method = 'GET', data = {}, params = {}, headers = {} } = options;
  const token = localStorage.getItem('_login_token_');
  const arr = url.split('?');
  const path = arr[0];
  const query = Qs.parse(arr[1]);
  const auth = generateAuthorization({
    businessKey,
    businessSecret,
    path: path,
    method: method.toUpperCase(),
    params: Object.assign({}, query, data, params),
  });
  //
  const headerRes = Object.assign(
    {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: auth.authorization,
      'Authorization-Date': auth.date,
      Token: token,
    },
    headers,
  );
  const configs = Object.assign({}, options, { headers: headerRes });
  return axios(configs);
}

function generateAuthorization({
  businessKey,
  businessSecret,
  path,
  method,
  params,
}) {
  let CSTDate = getCSTDate();
  let sortParamsEncode = Qs.stringify(sortByKey(params));
  let encryptStr =
    path + '|' + method.toUpperCase() + '|' + sortParamsEncode + '|' + CSTDate;

  let digest = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(encryptStr, businessSecret),
  );
  return { authorization: businessKey + ' ' + digest, date: CSTDate };
}

//
function sortByKey(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key];
      return obj;
    }, {});
}

function getCSTDate() {
  let date = new Date();
  let CSTDate =
    date.getFullYear() +
    '-' + // "年"
    (date.getMonth() + 1 >= 10
      ? date.getMonth() + 1
      : '0' + (date.getMonth() + 1)) +
    '-' + // "月"
    (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) +
    ' ' + // "日"
    (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) +
    ':' + // "小时"
    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
    ':' + // "分钟"
    (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()); // "秒"
  return CSTDate;
}

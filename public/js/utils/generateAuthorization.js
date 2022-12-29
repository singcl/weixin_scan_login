/* global CryptoJS */
import jqParam from './jqParam.js';

export default function generateAuthorization({
  businessKey,
  businessSecret,
  path,
  method,
  params,
}) {
  let date = new Date();
  let datetime =
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

  const urlSearchParams = new URLSearchParams(jqParam(params));
  urlSearchParams.sort();
  let sortParamsEncode = decodeURIComponent(urlSearchParams.toString());
  let encryptStr =
    path + '|' + method.toUpperCase() + '|' + sortParamsEncode + '|' + datetime;

  let digest = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(encryptStr, businessSecret)
  );
  return { authorization: businessKey + ' ' + digest, date: datetime };
}

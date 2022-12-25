import { h, defineComponent, onMounted, reactive, ref } from 'vue';
// import naive from 'naive';
// import Mail from '@vicons/ionicons5/Mail.js';
import ReloadCircle from '@vicons/ionicons5/ReloadCircle.js';
//
export default defineComponent((props, { emit }) => {
  //
  onMounted(async () => {
    const info = await getQrcodeInfo();
    qrcodeInfo.info = info;
    //
    const { heartBeat, sessionKey, expires } = info;
    checkRetry(sessionKey, heartBeat);
  });
  const qrcodeInfo = reactive({ info: {} });
  const timer = ref();
  //
  async function getQrcodeInfo() {
    const response = await fetch('/mp/qrcode');
    const data = await response.json();
    return data;
  }

  async function checkLogin(sessionKey) {
    const response = await fetch(`/mp/qrcode/check?sessionKey=${sessionKey}`, {
      headers: {
        WxToken: localStorage.getItem('WxToken'),
      },
    });
    const data = await response.json();
    return data;
  }

  async function checkRetry(sessionKey, heartBeat) {
    const data = await checkLogin(sessionKey);
    if (data.success) {
      clearTimeout(timer.value);
      localStorage.setItem('WxToken', data.token);
      location.href = `/?ticket=${data.token}`;
      return;
    }
    timer.value = setTimeout(
      () => checkRetry(sessionKey, heartBeat),
      heartBeat * 1000,
    );
  }
  return () =>
    h(
      'div',
      {
        class: 'flex flex-col items-center justify-content text-center w-full',
      },
      [
        h('h3', { class: 'my-4 text-xl' }, ['微信登录']),
        h('p', { class: 'm-0 text-sm' }, [
          '请使用 ',
          h('a', { class: 'text-green-500' }, ['微信扫码']),
          ' 关注公众号即可安全登录',
        ]),
        h('div', { class: 'flex items-center justify-center' }, [
          h(
            'div',
            {
              class:
                'rounded-md my-4 p-4 relative overflow-hidden bg-transparent w-[208px] h-[208px] border border-solid border-slate-200',
            },
            [
              qrcodeInfo.info.url
                ? h('img', {
                    src: qrcodeInfo.info.url,
                    alt: '登录二维码',
                    class: 'w-full h-full',
                  })
                : h(ReloadCircle, {
                    class: 'p-16 animate-spin',
                  }),
            ],
          ),
        ]),
        h('p', { class: 'flex items-start flex-wrap mb-6 text-sm' }, [
          '扫码表示您同意',
          h('a', { class: 'text-green-500' }, ['服务协议']),
          '和',
          h('a', { class: 'text-green-500' }, ['隐私条款']),
        ]),
      ],
    );
});

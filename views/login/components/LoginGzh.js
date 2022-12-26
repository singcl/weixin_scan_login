import {
  h,
  defineComponent,
  onMounted,
  reactive,
  ref,
  onBeforeUnmount,
} from 'vue';
import naive from 'naive';
import WeChat from '@vicons/ionicons5/WeChat.min.js';
import ReloadCircle from '@vicons/ionicons5/ReloadCircle.min.js';
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
  onBeforeUnmount(() => {
    clearTimeout(timer.value);
  });

  //
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

  function handleLoginMiniProgram() {
    //
    emit('change', 'mini');
  }

  //
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
        h(
          'div',
          {
            class:
              'w-full flex flex-col pt-4 mt-0 border-solid border-t border-slate-200',
          },
          [
            h('div', { class: 'py-2' }, [
              h(
                'button',
                {
                  class:
                    'w-full inline-flex justify-center items-center py-2 text-green-600 rounded outline-0 text-base border-solid border-green-600 border hover:border-green-600',
                  onClick: handleLoginMiniProgram,
                },
                [
                  h(naive.NIcon, { size: 24, class: 'mr-1' }, () => h(WeChat)),
                  '微信小程序登录',
                ],
              ),
            ]),
          ],
        ),
      ],
    );
});

import { defineComponent, h, ref } from 'vue';
import LoginGzh from './components/LoginGzh.js';
import LoginMiniProgram from './components/LoginMiniProgram.js';

// App
export default defineComponent((props, { emit }) => {
  const loginType = ref('gzh');
  function changeLoginType(v) {
    loginType.value = v;
  }
  function loginTypeRender() {
    switch (loginType.value) {
      case 'mini':
        return h(LoginMiniProgram, { onChange: changeLoginType });
      case 'gzh':
      default:
        return h(LoginGzh, {
          onChange: changeLoginType,
        });
    }
  }
  return () =>
    h(
      'div',
      {
        // bg-[url("https://cdn.apifox.cn/mirror-www/web/static/bg-texture.c61f6dbd.svg")]
        class: 'flex flex-col justify-center h-screen bg-cover bg-slate-100',
      },
      [
        h('div', null, [
          h(
            'div',
            { class: 'flex flex-col items-center justify-center px-6' },
            [
              h('div', { class: 'w-[400px] rounded-lg bg-white' }, [
                h(
                  'div',
                  { class: 'flex flex-col items-center justify-center p-6' },
                  [h(loginTypeRender())],
                ),
              ]),
            ],
          ),
        ]),
      ],
    );
});

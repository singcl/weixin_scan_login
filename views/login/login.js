import { defineComponent, h } from 'vue';
import LoginGzh from './components/LoginGzh.js';

// App
export default defineComponent((props, { emit }) => {
  return () =>
    h(
      'div',
      {
        class:
          'flex flex-col justify-center h-screen bg-cover bg-[url("https://cdn.apifox.cn/mirror-www/web/static/bg-texture.c61f6dbd.svg")]',
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
                  [h(LoginGzh)],
                ),
              ]),
            ],
          ),
        ]),
      ],
    );
});

import { defineComponent, h, ref } from 'vue';
import { request } from 'request';

// App
export default defineComponent((props, { emit }) => {
  async function handleTestClick() {
    request({
      method: 'POST',
      url: '/authorized/test',
      data: {
        username: 'ds',
        b: '333',
        a: '我爱你',
        e: [2, 3, 'your name is han mei mei'],
        f: {
          a: 2,
          c: '444',
          b: [{ s: 1 }, 3],
        },
        r: true,
      },
    });
  }
  return () =>
    h('div', null, [
      h('div', { class: 'flex flex-col items-center justify-center px-6' }, [
        h('div', { class: 'w-[400px] rounded-lg bg-white' }, [
          h('div', { class: 'flex flex-col items-center justify-center p-6' }, [
            h(
              'button',
              {
                class:
                  'w-full inline-flex justify-center items-center py-2 text-green-600 rounded outline-0 text-base border-solid border-green-600 border hover:border-green-600',
                onClick: handleTestClick,
              },
              ['测试按钮'],
            ),
          ]),
        ]),
      ]),
    ]);
});

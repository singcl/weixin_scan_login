import { defineComponent, h, ref } from 'vue';
import Kiko from 'kiko';

// App
export default defineComponent((props, { emit }) => {
  async function handleTestClick() {
    const response = await new Kiko().fetch('/authorized/test', {
      method: 'POST',
      body: {
        username: 'test_user',
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

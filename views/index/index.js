import { defineComponent, h, ref } from 'vue';

// App
export default defineComponent((props, { emit }) => {
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
              },
              ['测试按钮'],
            ),
          ]),
        ]),
      ]),
    ]);
});

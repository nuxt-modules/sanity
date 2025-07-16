<template>
  <div>
    <SanityContent
      :blocks="blocks"
      :serializers="serializers"
    />
  </div>
</template>

<script setup>
import { defineComponent, defineAsyncComponent, resolveComponent, h } from 'vue'

const serializers = {
  types: {
    // This registered by `@nuxt/components`
    lazyRegisteredComponent: resolveComponent('LazyCustomSerializer'),
    // An example of an inline component/directly imported component
    importedComponent: defineComponent({
      props: { someProp: String },
      render: props => h('p', 'An inline/imported custom component: ' + props.someProp),
    }),
    // Example of an async component
    dynamicComponent: defineAsyncComponent({
      loadingComponent: () => 'Loading...',
      loader: () => Promise.resolve(defineComponent({
        props: { someProp: String },
        render: props => h('p', 'An dynamically imported custom component: ' + props.someProp),
      })),
    }),
  },
}

const blocks = [
  {
    _type: 'lazyRegisteredComponent',
    someProp: 'some value',
  },
  {
    _type: 'importedComponent',
    someProp: 'some value',
  },
  {
    _type: 'dynamicComponent',
    someProp: 'some value',
  },
  {
    _key: 'd810da8ac845',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8450',
        _type: 'span',
        marks: [],
        text: 'An example of ',
      },
      {
        _key: '7dc51c030a2f',
        _type: 'span',
        marks: ['strong'],
        text: 'bold',
      },
      {
        _key: '794714489c2d',
        _type: 'span',
        marks: [],
        text: ' text and ',
      },
      {
        _key: '23487f',
        _type: 'span',
        marks: ['strong'],
        text: 'another',
      },
      {
        _key: '230498a',
        _type: 'span',
        marks: [],
        text: '.',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]
</script>
